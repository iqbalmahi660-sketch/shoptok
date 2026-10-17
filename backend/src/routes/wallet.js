const express = require('express');
const { query, getClient } = require('../database/db');
const { authSeller } = require('../middleware/auth');
const {
  ensureWalletSchema,
  backfillSellerOrders,
  getWalletSummary,
  getSellerOrderTransactions,
  cleanupInvalidSellerWalletRows,
} = require('../services/wallet');

const router = express.Router();
router.use(authSeller);

router.get('/', async (req, res) => {
  try {
    await ensureWalletSchema();

    // Wallet display is derived directly from real orders so it cannot go empty
    // merely because a historical ledger backfill failed.
    const [summary, orderTransactions, sellerRes, withdrawalRes] = await Promise.all([
      getWalletSummary(req.seller.id),
      getSellerOrderTransactions(req.seller.id),
      query(`
        SELECT payout_method, payout_network, payout_wallet_address
        FROM sellers WHERE id=$1::uuid
      `, [req.seller.id]),
      query(`
        SELECT * FROM withdrawal_requests
        WHERE seller_id=$1::uuid
        ORDER BY requested_at DESC
        LIMIT 100
      `, [req.seller.id]),
    ]);

    const withdrawalTransactions = withdrawalRes.rows.map((w) => ({
      id: `withdrawal-${w.id}`,
      order_id: null,
      withdrawal_id: w.id,
      transaction_type: 'withdrawal',
      amount: -Math.abs(Number(w.amount || 0)),
      status: String(w.status || 'pending').toLowerCase(),
      affects_balance: true,
      description: `Withdrawal request ${w.id}`,
      metadata: {
        payout_method: w.payout_method,
        payout_network: w.payout_network,
        payout_wallet_address: w.payout_wallet_address,
      },
      available_at: w.completed_at || null,
      created_at: w.requested_at,
      updated_at: w.updated_at,
      order_number: null,
    }));

    const transactions = [...orderTransactions, ...withdrawalTransactions]
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 250);

    return res.json({
      success: true,
      summary,
      transactions,
      withdrawals: withdrawalRes.rows,
      payout_account: sellerRes.rows[0] || null,
    });
  } catch (err) {
    console.error('Wallet load failed:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to load wallet' });
  }
});

router.put('/payout-account', async (req, res) => {
  try {
    await ensureWalletSchema();
    const payoutMethod = String(req.body?.payout_method || '').trim();
    const payoutNetwork = String(req.body?.payout_network || '').trim();
    const walletAddress = String(req.body?.payout_wallet_address || '').trim();

    if (!['USDT', 'Crypto'].includes(payoutMethod)) {
      return res.status(400).json({ success: false, message: 'Choose USDT or Crypto' });
    }
    if (!payoutNetwork || !walletAddress) {
      return res.status(400).json({ success: false, message: 'Network and wallet address are required' });
    }

    const { rows } = await query(`
      UPDATE sellers
      SET payout_method=$1, payout_network=$2, payout_wallet_address=$3
      WHERE id=$4
      RETURNING payout_method, payout_network, payout_wallet_address
    `, [payoutMethod, payoutNetwork, walletAddress, req.seller.id]);

    return res.json({ success: true, payout_account: rows[0] });
  } catch (err) {
    console.error('Payout account update failed:', err);
    return res.status(500).json({ success: false, message: 'Failed to save payout account' });
  }
});

router.post('/withdrawals', async (req, res) => {
  const amount = Number(req.body?.amount);
  const sellerNote = String(req.body?.note || '').trim() || null;

  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Enter a valid withdrawal amount' });
  }

  if (amount < 100) {
    return res.status(400).json({ success: false, message: 'Minimum withdrawal amount is $100' });
  }

  const client = await getClient();
  try {
    await ensureWalletSchema();
    await backfillSellerOrders(req.seller.id);
    await client.query('BEGIN');

    const sellerRes = await client.query(`
      SELECT payout_method, payout_network, payout_wallet_address
      FROM sellers WHERE id=$1 FOR UPDATE
    `, [req.seller.id]);
    const seller = sellerRes.rows[0];

    if (!['USDT', 'Crypto'].includes(seller?.payout_method) || !seller?.payout_network || !seller?.payout_wallet_address) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Please save your USDT/Crypto payout details before withdrawing.',
      });
    }

    const walletSummary = await getWalletSummary(req.seller.id);
    const available = Number(walletSummary.available_balance || 0);

    if (amount > available) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: `Insufficient available balance. Available: $${available.toFixed(2)}`,
      });
    }

    const withdrawalRes = await client.query(`
      INSERT INTO withdrawal_requests (
        seller_id, amount, payout_method, payout_network, payout_wallet_address, seller_note
      ) VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *
    `, [
      req.seller.id,
      amount,
      seller.payout_method,
      seller.payout_network,
      seller.payout_wallet_address,
      sellerNote,
    ]);
    const withdrawal = withdrawalRes.rows[0];

    await client.query(`
      INSERT INTO wallet_transactions (
        seller_id, withdrawal_id, transaction_type, amount, status,
        affects_balance, description, metadata
      ) VALUES ($1,$2,'withdrawal',$3,'pending',true,$4,$5::jsonb)
    `, [
      req.seller.id,
      withdrawal.id,
      -Math.abs(amount),
      `Withdrawal request ${withdrawal.id}`,
      JSON.stringify({
        payout_method: seller.payout_method,
        payout_network: seller.payout_network,
        payout_wallet_address: seller.payout_wallet_address,
      }),
    ]);

    await client.query('COMMIT');
    return res.status(201).json({
      success: true,
      message: 'Withdrawal request sent to admin',
      withdrawal,
    });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Withdrawal request failed:', err);
    return res.status(500).json({ success: false, message: 'Failed to create withdrawal request' });
  } finally {
    client.release();
  }
});

module.exports = router;
