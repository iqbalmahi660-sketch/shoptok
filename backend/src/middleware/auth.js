const jwt  = require('jsonwebtoken');
const { query } = require('../database/db');

// ── Verify buyer/seller token ─────────────────────────────────────────────────
const authUser = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer '))
      return res.status(401).json({ success: false, message: 'Token required' });

    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    const { rows } = await query('SELECT id, name, email, status FROM users WHERE id=$1', [decoded.id]);

    if (!rows[0])       return res.status(401).json({ success: false, message: 'User not found' });
    if (rows[0].status === 'suspended')
      return res.status(403).json({ success: false, message: 'Account suspended' });

    req.user = rows[0];
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// ── Verify admin token ────────────────────────────────────────────────────────
const authAdmin = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer '))
      return res.status(401).json({ success: false, message: 'Admin token required' });

    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_ADMIN_SECRET);
    const { rows } = await query(
      'SELECT id, name, email, role FROM admins WHERE id=$1 AND is_active=true', [decoded.id]
    );

    if (!rows[0]) return res.status(401).json({ success: false, message: 'Admin not found' });
    req.admin = rows[0];
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid admin token' });
  }
};

// ── Verify seller (must be active) ───────────────────────────────────────────
const authSeller = async (req, res, next) => {
  await authUser(req, res, async () => {
    const { rows } = await query('SELECT id, status FROM sellers WHERE user_id=$1', [req.user.id]);
    if (!rows[0])                return res.status(403).json({ success: false, message: 'Seller account not found' });
    if (rows[0].status !== 'active') return res.status(403).json({ success: false, message: 'Seller not approved yet' });
    req.seller = rows[0];
    next();
  });
};

// ── Super admin guard ─────────────────────────────────────────────────────────
const requireSuperAdmin = (req, res, next) => {
  if (req.admin?.role !== 'super_admin')
    return res.status(403).json({ success: false, message: 'Super admin only' });
  next();
};

// ── Log admin action (non-blocking) ──────────────────────────────────────────
const logAction = (adminId, adminName, action, targetType, targetId, targetName, details = {}, ip) => {
  query(
    `INSERT INTO admin_logs (admin_id,admin_name,action,target_type,target_id,target_name,details,ip_address)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [adminId, adminName, action, targetType, targetId, targetName, JSON.stringify(details), ip]
  ).catch(e => console.error('Log error:', e.message));
};

module.exports = { authUser, authAdmin, authSeller, requireSuperAdmin, logAction };
