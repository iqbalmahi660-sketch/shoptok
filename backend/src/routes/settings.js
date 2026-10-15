const express = require('express');
const { query } = require('../database/db');
const { authAdmin } = require('../middleware/auth');

const router = express.Router();

async function ensureSettingsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key VARCHAR(120) PRIMARY KEY,
      value TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
}

router.get('/payment', async (req, res) => {
  try {
    await ensureSettingsTable();
    const { rows } = await query(
      `SELECT key, value FROM app_settings WHERE key IN ('buyer_bank_name','buyer_bank_account')`
    );
    const map = Object.fromEntries(rows.map(r => [r.key, r.value || '']));
    res.json({
      success: true,
      bank_name: map.buyer_bank_name || '',
      bank_account: map.buyer_bank_account || '',
    });
  } catch (err) {
    console.error('Public payment settings error:', err);
    res.status(500).json({ success: false, message: 'Could not load payment settings' });
  }
});

router.get('/payment/admin', authAdmin, async (req, res) => {
  try {
    await ensureSettingsTable();
    const { rows } = await query(
      `SELECT key, value FROM app_settings WHERE key IN ('buyer_bank_name','buyer_bank_account')`
    );
    const map = Object.fromEntries(rows.map(r => [r.key, r.value || '']));
    res.json({
      success: true,
      bank_name: map.buyer_bank_name || '',
      bank_account: map.buyer_bank_account || '',
    });
  } catch (err) {
    console.error('Admin payment settings load error:', err);
    res.status(500).json({ success: false, message: 'Could not load payment settings' });
  }
});

router.put('/payment', authAdmin, async (req, res) => {
  const bankName = String(req.body?.bank_name || '').trim();
  const bankAccount = String(req.body?.bank_account || '').trim();

  if (!bankName || !bankAccount) {
    return res.status(400).json({
      success: false,
      message: 'Bank Name and Account Number / IBAN are required',
    });
  }

  if (bankName.length > 120 || bankAccount.length > 160) {
    return res.status(400).json({ success: false, message: 'Bank details are too long' });
  }

  try {
    await ensureSettingsTable();
    await query(
      `INSERT INTO app_settings (key, value, updated_at)
       VALUES ('buyer_bank_name', $1, NOW())
       ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`,
      [bankName]
    );
    await query(
      `INSERT INTO app_settings (key, value, updated_at)
       VALUES ('buyer_bank_account', $1, NOW())
       ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`,
      [bankAccount]
    );

    res.json({
      success: true,
      message: 'Buyer bank payment details saved',
      bank_name: bankName,
      bank_account: bankAccount,
    });
  } catch (err) {
    console.error('Save payment settings error:', err);
    res.status(500).json({ success: false, message: err.message || 'Could not save payment settings' });
  }
});

module.exports = router;
