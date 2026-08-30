const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { query } = require('../database/db');
const { authUser } = require('../middleware/auth');
const { notify }   = require('../socket');
const router = express.Router();

const signToken      = (id) => jwt.sign({ id }, process.env.JWT_SECRET,       { expiresIn: process.env.JWT_EXPIRES_IN       || '7d' });
const signAdminToken = (id) => jwt.sign({ id }, process.env.JWT_ADMIN_SECRET,  { expiresIn: process.env.JWT_ADMIN_EXPIRES_IN || '12h' });

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post('/register', [
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { name, email, password, phone, city, role, shop_name, bio, category, cnic, bank_name, account_title, account_number } = req.body;

  try {
    const existing = await query('SELECT id FROM users WHERE email=$1', [email]);
    if (existing.rows[0]) return res.status(409).json({ success: false, message: 'Email already registered' });

    const hash = await bcrypt.hash(password, 12);
    const { rows } = await query(
      `INSERT INTO users (name,email,phone,password_hash,city,status) VALUES ($1,$2,$3,$4,$5,'active') RETURNING id,name,email,phone,city,status,created_at`,
      [name, email, phone || null, hash, city || null]
    );
    const user = rows[0];

    let seller = null;
    if (role === 'seller' && shop_name) {
      const sRes = await query(
        `INSERT INTO sellers (user_id,shop_name,shop_bio,category,cnic,bank_name,account_title,account_number,city,status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending') RETURNING *`,
        [user.id, shop_name, bio || null, category || null, cnic || null, bank_name || null, account_title || null, account_number || null, city || null]
      );
      seller = sRes.rows[0];
      notify.newSeller({ ...seller, owner_name: name });
    } else {
      notify.newBuyer(user);
    }

    res.status(201).json({ success: true, token: signToken(user.id), user: { ...user, role: role || 'buyer', seller } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await query('SELECT * FROM users WHERE email=$1', [email?.toLowerCase()]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash)))
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    if (user.status === 'suspended')
      return res.status(403).json({ success: false, message: 'Account suspended. Contact support.' });

    const sellerRow = await query('SELECT id, shop_name, status, rating FROM sellers WHERE user_id=$1', [user.id]);
    await query('UPDATE users SET updated_at=NOW() WHERE id=$1', [user.id]);

    res.json({
      success: true,
      token: signToken(user.id),
      user: {
        id: user.id, name: user.name, email: user.email,
        phone: user.phone, city: user.city, profileImg: user.profile_img,
        status: user.status, role: sellerRow.rows[0] ? 'seller' : 'buyer',
        seller: sellerRow.rows[0] || null,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// ── POST /api/auth/admin/login ────────────────────────────────────────────────
router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await query('SELECT * FROM admins WHERE email=$1 AND is_active=true', [email?.toLowerCase()]);
    const admin = rows[0];
    if (!admin || !(await bcrypt.compare(password, admin.password_hash)))
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });

    await query('UPDATE admins SET last_login=NOW() WHERE id=$1', [admin.id]);
    res.json({
      success: true,
      token: signAdminToken(admin.id),
      admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Admin login failed' });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get('/me', authUser, async (req, res) => {
  try {
    const { rows } = await query('SELECT id,name,email,phone,city,profile_img,status,created_at FROM users WHERE id=$1', [req.user.id]);
    const seller = await query('SELECT id,shop_name,status,rating FROM sellers WHERE user_id=$1', [req.user.id]);
    res.json({ success: true, user: { ...rows[0], role: seller.rows[0] ? 'seller' : 'buyer', seller: seller.rows[0] || null } });
  } catch { res.status(500).json({ success: false, message: 'Failed' }); }
});

// ── PUT /api/auth/profile ─────────────────────────────────────────────────────
router.put('/profile', authUser, async (req, res) => {
  const { name, phone, city } = req.body;
  try {
    const { rows } = await query(
      'UPDATE users SET name=$1,phone=$2,city=$3,updated_at=NOW() WHERE id=$4 RETURNING id,name,email,phone,city',
      [name, phone, city, req.user.id]
    );
    res.json({ success: true, user: rows[0] });
  } catch { res.status(500).json({ success: false, message: 'Update failed' }); }
});

// ─── POST /api/auth/seller-onboard ───────────────────────────────────────────
router.post('/seller-onboard', authUser, async (req, res) => {
  const { 
    shop_name, shopName, bio, category, 
    cnic, idNumber, legalName,
    bank_name, bankName, 
    account_title, accountTitle, 
    account_number, accountNumber, 
    city, phone, shopAddress
  } = req.body;

  const finalShopName = shop_name || shopName || legalName || 'My Shop';
  const finalBank = bank_name || bankName;
  const finalAccountTitle = account_title || accountTitle;
  const finalAccountNumber = account_number || accountNumber;
  const finalCnic = cnic || idNumber;
  const finalCity = city || shopAddress;

  try {
    if (phone) await query('UPDATE users SET phone=$1, city=$2, updated_at=NOW() WHERE id=$3', [phone, finalCity||null, req.user.id]);

    const existing = await query('SELECT id FROM sellers WHERE user_id=$1', [req.user.id]);
    let seller;
    if (existing.rows[0]) {
      const { rows } = await query(
        `UPDATE sellers SET shop_name=$1, shop_bio=$2, category=$3, cnic=$4, bank_name=$5, account_title=$6, account_number=$7, city=$8, updated_at=NOW() WHERE user_id=$9 RETURNING *`,
        [finalShopName, bio||null, category||null, finalCnic||null, finalBank||null, finalAccountTitle||null, finalAccountNumber||null, finalCity||null, req.user.id]
      );
      seller = rows[0];
    } else {
      const { rows } = await query(
        `INSERT INTO sellers (user_id, shop_name, shop_bio, category, cnic, bank_name, account_title, account_number, city, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending') RETURNING *`,
        [req.user.id, finalShopName, bio||null, category||null, finalCnic||null, finalBank||null, finalAccountTitle||null, finalAccountNumber||null, finalCity||null]
      );
      seller = rows[0];
    }
    res.json({ success: true, message: 'Seller onboarding complete', seller });
  } catch(err) {
    console.error('Seller onboard error:', err);
    res.status(500).json({ success: false, message: err.message || 'Onboarding failed' });
  }
});

module.exports = router;
