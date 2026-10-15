const { query, getClient } = require('../database/db');

let schemaReadyPromise = null;

const ensureWalletSchema = () => {
  if (schemaReadyPromise) return schemaReadyPromise;

  schemaReadyPromise = (async () => {
    await query(`
      CREATE TABLE IF NOT EXISTS withdrawal_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
        amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
        bank_name VARCHAR(100),
        account_title VARCHAR(150),
        account_number VARCHAR(80),
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        seller_note TEXT,
        admin_note TEXT,
        requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        approved_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        processed_by UUID REFERENCES admins(id),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS wallet_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
        order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
        withdrawal_id UUID REFERENCES withdrawal_requests(id) ON DELETE SET NULL,
        transaction_type VARCHAR(40) NOT NULL,
        amount NUMERIC(12,2) NOT NULL DEFAULT 0,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        affects_balance BOOLEAN NOT NULL DEFAULT TRUE,
        description TEXT,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        available_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await query(`CREATE INDEX IF NOT EXISTS idx_wallet_transactions_seller ON wallet_transactions(seller_id, created_at DESC)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_wallet_transactions_order ON wallet_transactions(order_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_withdrawals_seller ON withdrawal_requests(seller_id, requested_at DESC)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawal_requests(status, requested_at DESC)`);

    // Older deployments may already contain duplicate ledger rows from early wallet builds.
    // Deduplicate before adding the idempotency indexes so order status changes cannot fail.
    await query(`
      DELETE FROM wallet_transactions a
      USING wallet_transactions b
      WHERE a.order_id IS NOT NULL
        AND b.order_id IS NOT NULL
        AND a.seller_id=b.seller_id
        AND a.order_id=b.order_id
        AND a.transaction_type=b.transaction_type
        AND (a.created_at < b.created_at OR (a.created_at=b.created_at AND a.id < b.id))
    `);
    await query(`
      DELETE FROM wallet_transactions a
      USING wallet_transactions b
      WHERE a.withdrawal_id IS NOT NULL
        AND b.withdrawal_id IS NOT NULL
        AND a.withdrawal_id=b.withdrawal_id
        AND a.transaction_type=b.transaction_type
        AND (a.created_at < b.created_at OR (a.created_at=b.created_at AND a.id < b.id))
    `);

    await query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_wallet_order_type_seller
      ON wallet_transactions(seller_id, order_id, transaction_type)
      WHERE order_id IS NOT NULL
    `);
    await query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_wallet_withdrawal_tx
      ON wallet_transactions(withdrawal_id, transaction_type)
      WHERE withdrawal_id IS NOT NULL
    `);
  })().catch((err) => {
    schemaReadyPromise = null;
    throw err;
  });

  return schemaReadyPromise;
};

const orderWalletStatus = (orderStatus) => {
  const status = String(orderStatus || '').toLowerCase();
  if (status === 'delivered') return 'available';
  if (status === 'processing' || status === 'shipped') return 'pending';
  if (status === 'cancelled' || status === 'refunded') return 'reversed';
  // New and seller-confirmed orders are not earnings yet. They become pending
  // only after admin moves the order into Processing/Shipped.
  return 'held';
};

const upsertOrderTransaction = async (client, {
  sellerId,
  order,
  type,
  amount,
  affectsBalance = true,
  description,
  metadata = {},
}) => {
  if (!sellerId) return;
  const numericAmount = Number(amount || 0);
  if (!Number.isFinite(numericAmount) || numericAmount === 0) return;

  const status = orderWalletStatus(order.status);
  await client.query(`
    INSERT INTO wallet_transactions (
      seller_id, order_id, transaction_type, amount, status,
      affects_balance, description, metadata, available_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,CASE WHEN $5='available' THEN NOW() ELSE NULL END)
    ON CONFLICT (seller_id, order_id, transaction_type) WHERE order_id IS NOT NULL
    DO UPDATE SET
      amount=EXCLUDED.amount,
      status=EXCLUDED.status,
      affects_balance=EXCLUDED.affects_balance,
      description=EXCLUDED.description,
      metadata=EXCLUDED.metadata,
      available_at=CASE
        WHEN EXCLUDED.status='available' THEN COALESCE(wallet_transactions.available_at, NOW())
        ELSE NULL
      END,
      updated_at=NOW()
  `, [
    sellerId,
    order.id,
    type,
    numericAmount,
    status,
    affectsBalance,
    description,
    JSON.stringify(metadata),
  ]);
};

const syncOrderWallet = async (order, existingClient = null) => {
  if (!order?.id) return;
  await ensureWalletSchema();

  const client = existingClient || await getClient();
  const ownsClient = !existingClient;

  try {
    if (ownsClient) await client.query('BEGIN');

    const supplierId = order.original_seller_id || order.seller_id;
    const resellerId = order.reseller_seller_id || null;
    const supplierAmount = Number(order.supplier_amount ?? order.total_amount ?? 0);
    const resellerProfit = Number(order.reseller_profit || 0);
    const platformFee = Number(order.platform_fee || 0);
    const orderMeta = {
      order_number: order.order_number,
      product_title: order.product_title,
      total_amount: Number(order.total_amount || 0),
      supplier_amount: supplierAmount,
      reseller_profit: resellerProfit,
      platform_fee: platformFee,
      is_reseller_order: Boolean(resellerId),
    };

    await upsertOrderTransaction(client, {
      sellerId: supplierId,
      order,
      type: resellerId ? 'supplier_sale' : 'product_sale',
      amount: supplierAmount,
      description: resellerId ? `Supplier earning from ${order.order_number}` : `Product sale ${order.order_number}`,
      metadata: orderMeta,
    });

    if (resellerId && resellerProfit > 0) {
      await upsertOrderTransaction(client, {
        sellerId: resellerId,
        order,
        type: 'reseller_profit',
        amount: resellerProfit,
        description: `Reseller profit from ${order.order_number}`,
        metadata: orderMeta,
      });
    }

    if (resellerId && platformFee > 0) {
      await upsertOrderTransaction(client, {
        sellerId: resellerId,
        order,
        type: 'platform_fee',
        amount: platformFee,
        affectsBalance: false,
        description: `TokZoo platform fee for ${order.order_number}`,
        metadata: orderMeta,
      });
    }

    if (ownsClient) await client.query('COMMIT');
  } catch (err) {
    if (ownsClient) await client.query('ROLLBACK');
    throw err;
  } finally {
    if (ownsClient) client.release();
  }
};

const backfillSellerOrders = async (sellerId) => {
  await ensureWalletSchema();
  const { rows } = await query(`
    SELECT * FROM orders
    WHERE seller_id=$1 OR original_seller_id=$1 OR reseller_seller_id=$1
    ORDER BY created_at ASC
  `, [sellerId]);

  for (const order of rows) {
    await syncOrderWallet(order);
  }
};

const getWalletSummary = async (sellerId) => {
  await ensureWalletSchema();
  const { rows } = await query(`
    SELECT
      COALESCE(SUM(CASE
        WHEN affects_balance=true AND status='available' THEN amount
        WHEN transaction_type='withdrawal' AND affects_balance=true AND status IN ('pending','approved','completed') THEN amount
        ELSE 0 END),0)::numeric AS available_balance,
      COALESCE(SUM(CASE
        WHEN affects_balance=true AND amount > 0 AND status='pending' THEN amount
        ELSE 0 END),0)::numeric AS pending_balance,
      COALESCE(SUM(CASE
        WHEN affects_balance=true AND amount > 0 AND status IN ('pending','available','completed') THEN amount
        ELSE 0 END),0)::numeric AS total_earnings,
      COALESCE(ABS(SUM(CASE
        WHEN transaction_type='withdrawal' AND status='completed' THEN amount
        ELSE 0 END)),0)::numeric AS withdrawn
    FROM wallet_transactions
    WHERE seller_id=$1
  `, [sellerId]);

  const r = rows[0] || {};
  return {
    available_balance: Number(r.available_balance || 0),
    pending_balance: Number(r.pending_balance || 0),
    total_earnings: Number(r.total_earnings || 0),
    withdrawn: Number(r.withdrawn || 0),
  };
};

module.exports = {
  ensureWalletSchema,
  syncOrderWallet,
  backfillSellerOrders,
  getWalletSummary,
};
