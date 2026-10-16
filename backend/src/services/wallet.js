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
      ALTER TABLE sellers
      ADD COLUMN IF NOT EXISTS payout_method VARCHAR(20),
      ADD COLUMN IF NOT EXISTS payout_network VARCHAR(80),
      ADD COLUMN IF NOT EXISTS payout_wallet_address TEXT
    `);

    await query(`
      ALTER TABLE withdrawal_requests
      ADD COLUMN IF NOT EXISTS payout_method VARCHAR(20),
      ADD COLUMN IF NOT EXISTS payout_network VARCHAR(80),
      ADD COLUMN IF NOT EXISTS payout_wallet_address TEXT
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
    ) VALUES (
      $1::uuid,
      $2::uuid,
      $3::varchar(40),
      $4::numeric,
      $5::varchar(20),
      $6::boolean,
      $7::text,
      $8::jsonb,
      CASE WHEN $5::text='available' THEN NOW() ELSE NULL END
    )
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

const walletOrderOwnershipSql = (sellerAlias = 'wt', orderAlias = 'o') => `
  (
    ${sellerAlias}.order_id IS NULL
    OR (
      ${sellerAlias}.transaction_type IN ('product_sale','supplier_sale')
      AND ${sellerAlias}.seller_id = COALESCE(${orderAlias}.original_seller_id, ${orderAlias}.seller_id)
    )
    OR (
      ${sellerAlias}.transaction_type IN ('reseller_profit','platform_fee')
      AND ${orderAlias}.reseller_seller_id IS NOT NULL
      AND ${sellerAlias}.seller_id = ${orderAlias}.reseller_seller_id
    )
  )
`;

const cleanupInvalidSellerWalletRows = async (sellerId) => {
  await ensureWalletSchema();

  // Remove legacy/misassigned order transactions that do not belong to this
  // seller according to the order's authoritative supplier/reseller IDs.
  await query(`
    DELETE FROM wallet_transactions wt
    USING orders o
    WHERE wt.order_id=o.id
      AND wt.seller_id=$1::uuid
      AND NOT (
        (
          wt.transaction_type IN ('product_sale','supplier_sale')
          AND wt.seller_id = COALESCE(o.original_seller_id, o.seller_id)
        )
        OR (
          wt.transaction_type IN ('reseller_profit','platform_fee')
          AND o.reseller_seller_id IS NOT NULL
          AND wt.seller_id = o.reseller_seller_id
        )
      )
  `, [sellerId]);
};

const backfillSellerOrders = async (sellerId) => {
  await ensureWalletSchema();

  // Clear legacy rows that were attached to the wrong seller before rebuilding.
  await cleanupInvalidSellerWalletRows(sellerId);

  // Rebuild this seller's supplier/direct-sale ledger in one SQL operation.
  // This also covers historical orders created before supplier_amount existed by
  // falling back to total_amount when the stored supplier amount is null/zero.
  await query(`
    INSERT INTO wallet_transactions (
      seller_id, order_id, transaction_type, amount, status,
      affects_balance, description, metadata, available_at
    )
    SELECT
      COALESCE(o.original_seller_id, o.seller_id) AS seller_id,
      o.id AS order_id,
      CASE WHEN o.reseller_seller_id IS NULL THEN 'product_sale' ELSE 'supplier_sale' END AS transaction_type,
      CASE
        WHEN o.reseller_seller_id IS NULL THEN COALESCE(o.total_amount, 0)::numeric
        ELSE COALESCE(NULLIF(o.supplier_amount, 0), o.total_amount, 0)::numeric
      END AS amount,
      CASE
        WHEN LOWER(COALESCE(o.status,''))='delivered' THEN 'available'
        WHEN LOWER(COALESCE(o.status,'')) IN ('processing','shipped') THEN 'pending'
        WHEN LOWER(COALESCE(o.status,'')) IN ('cancelled','refunded') THEN 'reversed'
        ELSE 'held'
      END AS status,
      TRUE AS affects_balance,
      CASE
        WHEN o.reseller_seller_id IS NULL THEN 'Product sale ' || COALESCE(o.order_number,'')
        ELSE 'Supplier earning from ' || COALESCE(o.order_number,'')
      END AS description,
      jsonb_build_object(
        'order_number', o.order_number,
        'product_title', o.product_title,
        'total_amount', COALESCE(o.total_amount,0),
        'supplier_amount', CASE
          WHEN o.reseller_seller_id IS NULL THEN COALESCE(o.total_amount,0)
          ELSE COALESCE(NULLIF(o.supplier_amount,0),o.total_amount,0)
        END,
        'reseller_profit', COALESCE(o.reseller_profit,0),
        'platform_fee', COALESCE(o.platform_fee,0),
        'is_reseller_order', (o.reseller_seller_id IS NOT NULL)
      ) AS metadata,
      CASE WHEN LOWER(COALESCE(o.status,''))='delivered' THEN COALESCE(o.updated_at,o.created_at,NOW()) ELSE NULL END AS available_at
    FROM orders o
    WHERE COALESCE(o.original_seller_id, o.seller_id)=$1::uuid
      AND COALESCE(o.total_amount,0) > 0
    ON CONFLICT (seller_id, order_id, transaction_type) WHERE order_id IS NOT NULL
    DO UPDATE SET
      amount=EXCLUDED.amount,
      status=EXCLUDED.status,
      affects_balance=EXCLUDED.affects_balance,
      description=EXCLUDED.description,
      metadata=EXCLUDED.metadata,
      available_at=CASE
        WHEN EXCLUDED.status='available' THEN COALESCE(wallet_transactions.available_at, EXCLUDED.available_at, NOW())
        ELSE NULL
      END,
      updated_at=NOW()
  `, [sellerId]);

  // Rebuild reseller-profit ledger. If an older reseller order has a zero/null
  // reseller_profit, derive it from customer total - supplier amount - platform fee.
  await query(`
    INSERT INTO wallet_transactions (
      seller_id, order_id, transaction_type, amount, status,
      affects_balance, description, metadata, available_at
    )
    SELECT
      o.reseller_seller_id AS seller_id,
      o.id AS order_id,
      'reseller_profit' AS transaction_type,
      GREATEST(
        COALESCE(
          NULLIF(o.reseller_profit,0),
          COALESCE(o.total_amount,0) - COALESCE(NULLIF(o.supplier_amount,0),0) - COALESCE(o.platform_fee,0)
        ),
        0
      )::numeric AS amount,
      CASE
        WHEN LOWER(COALESCE(o.status,''))='delivered' THEN 'available'
        WHEN LOWER(COALESCE(o.status,'')) IN ('processing','shipped') THEN 'pending'
        WHEN LOWER(COALESCE(o.status,'')) IN ('cancelled','refunded') THEN 'reversed'
        ELSE 'held'
      END AS status,
      TRUE AS affects_balance,
      'Reseller profit from ' || COALESCE(o.order_number,'') AS description,
      jsonb_build_object(
        'order_number', o.order_number,
        'product_title', o.product_title,
        'total_amount', COALESCE(o.total_amount,0),
        'supplier_amount', COALESCE(NULLIF(o.supplier_amount,0),0),
        'reseller_profit', GREATEST(
          COALESCE(
            NULLIF(o.reseller_profit,0),
            COALESCE(o.total_amount,0) - COALESCE(NULLIF(o.supplier_amount,0),0) - COALESCE(o.platform_fee,0)
          ),
          0
        ),
        'platform_fee', COALESCE(o.platform_fee,0),
        'is_reseller_order', TRUE
      ) AS metadata,
      CASE WHEN LOWER(COALESCE(o.status,''))='delivered' THEN COALESCE(o.updated_at,o.created_at,NOW()) ELSE NULL END AS available_at
    FROM orders o
    WHERE o.reseller_seller_id=$1::uuid
      AND GREATEST(
        COALESCE(
          NULLIF(o.reseller_profit,0),
          COALESCE(o.total_amount,0) - COALESCE(NULLIF(o.supplier_amount,0),0) - COALESCE(o.platform_fee,0)
        ),
        0
      ) > 0
    ON CONFLICT (seller_id, order_id, transaction_type) WHERE order_id IS NOT NULL
    DO UPDATE SET
      amount=EXCLUDED.amount,
      status=EXCLUDED.status,
      affects_balance=EXCLUDED.affects_balance,
      description=EXCLUDED.description,
      metadata=EXCLUDED.metadata,
      available_at=CASE
        WHEN EXCLUDED.status='available' THEN COALESCE(wallet_transactions.available_at, EXCLUDED.available_at, NOW())
        ELSE NULL
      END,
      updated_at=NOW()
  `, [sellerId]);

  // Platform-fee records are informational only and never change seller balance.
  await query(`
    INSERT INTO wallet_transactions (
      seller_id, order_id, transaction_type, amount, status,
      affects_balance, description, metadata, available_at
    )
    SELECT
      o.reseller_seller_id,
      o.id,
      'platform_fee',
      COALESCE(o.platform_fee,0)::numeric,
      CASE
        WHEN LOWER(COALESCE(o.status,''))='delivered' THEN 'available'
        WHEN LOWER(COALESCE(o.status,'')) IN ('processing','shipped') THEN 'pending'
        WHEN LOWER(COALESCE(o.status,'')) IN ('cancelled','refunded') THEN 'reversed'
        ELSE 'held'
      END,
      FALSE,
      'TokZoo platform fee for ' || COALESCE(o.order_number,''),
      jsonb_build_object(
        'order_number', o.order_number,
        'product_title', o.product_title,
        'platform_fee', COALESCE(o.platform_fee,0),
        'is_reseller_order', TRUE
      ),
      CASE WHEN LOWER(COALESCE(o.status,''))='delivered' THEN COALESCE(o.updated_at,o.created_at,NOW()) ELSE NULL END
    FROM orders o
    WHERE o.reseller_seller_id=$1::uuid
      AND COALESCE(o.platform_fee,0) > 0
    ON CONFLICT (seller_id, order_id, transaction_type) WHERE order_id IS NOT NULL
    DO UPDATE SET
      amount=EXCLUDED.amount,
      status=EXCLUDED.status,
      affects_balance=FALSE,
      description=EXCLUDED.description,
      metadata=EXCLUDED.metadata,
      available_at=CASE
        WHEN EXCLUDED.status='available' THEN COALESCE(wallet_transactions.available_at, EXCLUDED.available_at, NOW())
        ELSE NULL
      END,
      updated_at=NOW()
  `, [sellerId]);

  await cleanupInvalidSellerWalletRows(sellerId);
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
    FROM wallet_transactions wt
    LEFT JOIN orders o ON o.id=wt.order_id
    WHERE wt.seller_id=$1::uuid
      AND ${walletOrderOwnershipSql('wt', 'o')}
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
  cleanupInvalidSellerWalletRows,
  walletOrderOwnershipSql,
};
