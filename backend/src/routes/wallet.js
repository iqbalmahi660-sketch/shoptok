const express = require('express');
const { query, getClient } = require('../database/db');
const { authSeller } = require('../middleware/auth');
const {
  ensureWalletSchema,
  backfillSellerOrders,
  getWalletSummary,
} = require('../services/wallet');

const router = express.Router();
router.use(authSeller);

router.get('/', async (req, res) => {
  try {
    await ensureWalletSchema();
    await backfillSellerOrders(req.seller.id);

    const [summary, txRes, sellerRes, withdrawalRes] = await Promise.all([
      getWalletSummary(req.seller.id),
      query(`
        SELECT wt.*, o.order_number
        FROM wallet_transactions wt
        LEFT JOIN orders o ON o.id=wt.order_id
        WHERE wt.seller_id=$1
        ORDER BY wt.created_at DESC
        LIMIT 250
      `, [req.seller.id]),
      query(`
        SELECT bank_name, account_title, account_number
        FROM sellers WHERE id=$1
      `, [req.seller.id]),
      query(`
        SELECT * FROM withdrawal_requests
        WHERE seller_id=$1
        ORDER BY requested_at DESC
        LIMIT 100
      `, [req.seller.id]),
    ]);

    return res.json({
      success: true,
      summary,
      transactions: txRes.rows,
      withdrawals: withdrawalRes.rows,
      payout_account: sellerRes.rows[0] || null,
    });
  } catch (err) {
    console.error('Wallet load failed:', err);
    return res.status(500).json({ success: false, message: 'Failed to load wallet' });
  }
});

router.post('/withdrawals', async (req, res) => {
  const amount = Number(req.body?.amount);
  const sellerNote = String(req.body?.note || '').trim() || null;

  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Enter a valid withdrawal amount' });
  }

  const client = await getClient();
  try {
    await ensureWalletSchema();
    await backfillSellerOrders(req.seller.id);
    await client.query('BEGIN');

    const sellerRes = await client.query(`
      SELECT bank_name, account_title, account_number
      FROM sellers WHERE id=$1 FOR UPDATE
    `, [req.seller.id]);
    const seller = sellerRes.rows[0];

    if (!seller?.bank_name || !seller?.account_title || !seller?.account_number) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Please complete your bank/account details in your seller profile before withdrawing.',
      });
    }

    const balanceRes = await client.query(`
      SELECT COALESCE(SUM(CASE
        WHEN affects_balance=true AND status='available' THEN amount
        WHEN transaction_type='withdrawal' AND affects_balance=true AND status IN ('pending','approved','completed') THEN amount
        ELSE 0 END),0)::numeric AS available_balance
      FROM wallet_transactions
      WHERE seller_id=$1
    `, [req.seller.id]);
    const available = Number(balanceRes.rows[0]?.available_balance || 0);

    if (amount > available) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: `Insufficient available balance. Available: $${available.toFixed(2)}`,
      });
    }

    const withdrawalRes = await client.query(`
      INSERT INTO withdrawal_requests (
        seller_id, amount, bank_name, account_title, account_number, seller_note
      ) VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *
    `, [
      req.seller.id,
      amount,
      seller.bank_name,
      seller.account_title,
      seller.account_number,
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
        bank_name: seller.bank_name,
        account_title: seller.account_title,
        account_number: seller.account_number,
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
