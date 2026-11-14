const bcrypt = require('bcryptjs');
const { query } = require('../database/db');

// Creates the first super admin from ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME
// when no admin with that email exists. It never overwrites an existing admin,
// so a password changed via "Forgot password" survives restarts.
async function ensureAdminAccount() {
  const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.log('ℹ️  ADMIN_EMAIL / ADMIN_PASSWORD not set; skipping admin bootstrap');
    return;
  }

  const existing = await query('SELECT id FROM admins WHERE email=$1', [email]);
  if (existing.rows.length) return;

  const hash = await bcrypt.hash(password, 12);
  await query(
    `INSERT INTO admins (name, email, password_hash, role)
     VALUES ($1, $2, $3, 'super_admin')
     ON CONFLICT (email) DO NOTHING`,
    [process.env.ADMIN_NAME || 'Super Admin', email, hash]
  );
  console.log(`✅ Admin account created for ${email}`);
}

module.exports = { ensureAdminAccount };
