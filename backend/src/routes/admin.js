const express = require('express');
const { query } = require('../database/db');
const { authAdmin, requireSuperAdmin, logAction } = require('../middleware/auth');
const router = express.Router();

router.use(authAdmin);

// ═══════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════
router.get('/dashboard', async (req, res) => {
  try {
    const [users, sellers, orders, revenue, pendingSellers, pendingProducts, recentOrders, monthlyRev, orderStats] = await Promise.all([
      query(`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status='active')::int AS active,
               COUNT(*) FILTER (WHERE status='pending')::int AS pending,
               COUNT(*) FILTER (WHERE status='suspended')::int AS suspended FROM users`),
      query(`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status='active')::int AS active,
               COUNT(*) FILTER (WHERE status='pending')::int AS pending,
               COUNT(*) FILTER (WHERE status='rejected')::int AS rejected FROM sellers`),
      query(`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status='pending')::int AS pending,
               COUNT(*) FILTER (WHERE status='delivered')::int AS delivered,
               COUNT(*) FILTER (WHERE status='cancelled')::int AS cancelled FROM orders`),
      query(`SELECT COALESCE(SUM(total_amount),0)::int AS total,
               COALESCE(SUM(CASE WHEN created_at >= NOW()-INTERVAL '30 days' THEN total_amount END),0)::int AS this_month,
               COALESCE(SUM(CASE WHEN created_at >= NOW()-INTERVAL '7 days' THEN total_amount END),0)::int AS this_week,
               COALESCE(SUM(CASE WHEN created_at >= CURRENT_DATE THEN total_amount END),0)::int AS today
               FROM orders WHERE status='delivered'`),
      query(`SELECT COUNT(*)::int FROM sellers WHERE status='pending'`),
      query(`SELECT COUNT(*)::int FROM products WHERE status='pending'`),
      query(`SELECT o.id, o.order_number, o.total_amount, o.status, o.payment_method, o.created_at,
               u.name AS buyer_name, s.shop_name AS seller_name, o.product_title, o.product_emoji
             FROM orders o
             LEFT JOIN users u ON u.id=o.buyer_id
             LEFT JOIN sellers s ON s.id=o.seller_id
             ORDER BY o.created_at DESC LIMIT 8`),
      query(`SELECT TO_CHAR(DATE_TRUNC('month',created_at),'Mon') AS month,
               COALESCE(SUM(total_amount),0)::int AS revenue,
               COUNT(*)::int AS orders
             FROM orders WHERE created_at >= NOW()-INTERVAL '6 months' AND status='delivered'
             GROUP BY DATE_TRUNC('month',created_at)
             ORDER BY DATE_TRUNC('month',created_at)`),
      query(`SELECT status, COUNT(*)::int AS count FROM orders GROUP BY status`),
    ]);

    res.json({
      success: true,
      users:    users.rows[0],
      sellers:  sellers.rows[0],
      orders:   orders.rows[0],
      revenue:  revenue.rows[0],
      pendingSellers:  pendingSellers.rows[0].count,
      pendingProducts: pendingProducts.rows[0].count,
      recentOrders:    recentOrders.rows,
      monthlyRevenue:  monthlyRev.rows,
      orderStatus:     orderStats.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Dashboard failed' });
  }
});

// ═══════════════════════════════════════════════════════════════
// BUYERS
// ═══════════════════════════════════════════════════════════════
router.get('/buyers', async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;
  const params = [];
  const where  = [];

  if (status && status !== 'all') { params.push(status); where.push(`u.status=$${params.length}`); }
  if (search) {
    params.push(`%${search}%`);
    where.push(`(u.name ILIKE $${params.length} OR u.email ILIKE $${params.length} OR u.phone ILIKE $${params.length})`);
  }
  const wc = where.length ? 'WHERE ' + where.join(' AND ') : '';

  try {
    const countRes = await query(`SELECT COUNT(*)::int FROM users u ${wc}`, params);
    const { rows } = await query(`
      SELECT u.id, u.name, u.email, u.phone, u.city, u.status, u.avatar, u.created_at,
             COUNT(o.id)::int                        AS total_orders,
             COALESCE(SUM(o.total_amount),0)::int    AS total_spent
      FROM users u
      LEFT JOIN orders o ON o.buyer_id=u.id
      ${wc}
      GROUP BY u.id
      ORDER BY u.created_at DESC
      LIMIT $${params.length+1} OFFSET $${params.length+2}
    `, [...params, limit, (page-1)*limit]);

    res.json({ success: true, buyers: rows, total: countRes.rows[0].count, page: +page, pages: Math.ceil(countRes.rows[0].count/limit) });
  } catch (err) { res.status(500).json({ success: false, message: 'Failed' }); }
});

router.get('/buyers/:id', async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT u.*,
             COUNT(o.id)::int AS total_orders,
             COALESCE(SUM(o.total_amount),0)::int AS total_spent,
             COUNT(o.id) FILTER (WHERE o.status='delivered')::int AS delivered
      FROM users u LEFT JOIN orders o ON o.buyer_id=u.id
      WHERE u.id=$1 GROUP BY u.id
    `, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Not found' });

    const orders = await query('SELECT * FROM orders WHERE buyer_id=$1 ORDER BY created_at DESC LIMIT 10', [req.params.id]);
    res.json({ success: true, buyer: rows[0], orders: orders.rows });
  } catch { res.status(500).json({ success: false, message: 'Failed' }); }
});

router.patch('/buyers/:id/status', async (req, res) => {
  const { status, reason } = req.body;
  if (!['active','suspended','pending'].includes(status))
    return res.status(400).json({ success: false, message: 'Invalid status' });
  try {
    const { rows } = await query(
      'UPDATE users SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING id,name,email,status',
      [status, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Not found' });
    logAction(req.admin.id, req.admin.name, `buyer_${status}`, 'user', req.params.id, rows[0].name, { reason }, req.ip);
    res.json({ success: true, message: `Buyer ${status}`, buyer: rows[0] });
  } catch { res.status(500).json({ success: false, message: 'Failed' }); }
});

// ═══════════════════════════════════════════════════════════════
// SELLERS
// ═══════════════════════════════════════════════════════════════
router.get('/sellers', async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;
  const params = [];
  const where  = [];

  if (status && status !== 'all') { params.push(status); where.push(`s.status=$${params.length}`); }
  if (search) {
    params.push(`%${search}%`);
    where.push(`(s.shop_name ILIKE $${params.length} OR u.name ILIKE $${params.length} OR u.email ILIKE $${params.length})`);
  }
  const wc = where.length ? 'WHERE ' + where.join(' AND ') : '';

  try {
    const countRes = await query(`SELECT COUNT(*)::int FROM sellers s LEFT JOIN users u ON u.id=s.user_id ${wc}`, params);
    const { rows } = await query(`
      SELECT s.*,
             u.name AS owner_name, u.email, u.phone,
             COUNT(DISTINCT p.id)::int                    AS product_count,
             COUNT(DISTINCT o.id)::int                    AS order_count,
             COALESCE(SUM(o.total_amount),0)::int         AS revenue
      FROM sellers s
      LEFT JOIN users u    ON u.id=s.user_id
      LEFT JOIN products p ON p.seller_id=s.id
      LEFT JOIN orders o   ON o.seller_id=s.id AND o.status='delivered'
      ${wc}
      GROUP BY s.id, u.name, u.email, u.phone
      ORDER BY s.created_at DESC
      LIMIT $${params.length+1} OFFSET $${params.length+2}
    `, [...params, limit, (page-1)*limit]);

    res.json({ success: true, sellers: rows, total: countRes.rows[0].count, page: +page, pages: Math.ceil(countRes.rows[0].count/limit) });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: 'Failed' }); }
});

router.get('/sellers/:id', async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT s.*, u.name AS owner_name, u.email, u.phone, u.profile_img
      FROM sellers s LEFT JOIN users u ON u.id=s.user_id WHERE s.id=$1
    `, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Not found' });

    const [products, orders] = await Promise.all([
      query('SELECT * FROM products WHERE seller_id=$1 ORDER BY created_at DESC LIMIT 10', [req.params.id]),
      query('SELECT * FROM orders    WHERE seller_id=$1 ORDER BY created_at DESC LIMIT 10', [req.params.id]),
    ]);
    res.json({ success: true, seller: rows[0], products: products.rows, orders: orders.rows });
  } catch { res.status(500).json({ success: false, message: 'Failed' }); }
});

router.patch('/sellers/:id/status', async (req, res) => {
  const { status, reason } = req.body;
  if (!['active','suspended','rejected','pending'].includes(status))
    return res.status(400).json({ success: false, message: 'Invalid status' });
  try {
    const { rows } = await query(`
      UPDATE sellers SET status=$1::varchar, updated_at=NOW(),
        rejection_reason = CASE WHEN $1::varchar='rejected' THEN $2 ELSE rejection_reason END,
        approved_at      = CASE WHEN $1::varchar='active'   THEN NOW() ELSE approved_at END,
        approved_by      = CASE WHEN $1::varchar='active'   THEN $3   ELSE approved_by END
      WHERE id=$4 RETURNING *
    `, [status, reason||null, req.admin.id, req.params.id]);
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Not found' });
    logAction(req.admin.id, req.admin.name, `seller_${status}`, 'seller', req.params.id, rows[0].shop_name, { reason }, req.ip);
    const msg = { active:'Seller approved ✓', suspended:'Seller suspended', rejected:'Seller rejected', pending:'Reset to pending' }[status];
    res.json({ success: true, message: msg, seller: rows[0] });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: 'Failed' }); }
});

// ═══════════════════════════════════════════════════════════════
// PRODUCTS
// ═══════════════════════════════════════════════════════════════
router.get('/products', async (req, res) => {
  const { status, search, category, page = 1, limit = 20 } = req.query;
  const params = [];
  const where  = [];

  if (status && status !== 'all') { params.push(status); where.push(`p.status=$${params.length}`); }
  if (category) { params.push(category); where.push(`p.category=$${params.length}`); }
  if (search) { params.push(`%${search}%`); where.push(`(p.title ILIKE $${params.length} OR s.shop_name ILIKE $${params.length})`); }
  const wc = where.length ? 'WHERE ' + where.join(' AND ') : '';

  try {
    const countRes = await query(`SELECT COUNT(*)::int FROM products p LEFT JOIN sellers s ON s.id=p.seller_id ${wc}`, params);
    const { rows } = await query(`
      SELECT p.*, s.shop_name AS seller_name
      FROM products p LEFT JOIN sellers s ON s.id=p.seller_id
      ${wc}
      ORDER BY p.created_at DESC
      LIMIT $${params.length+1} OFFSET $${params.length+2}
    `, [...params, limit, (page-1)*limit]);

    res.json({ success: true, products: rows, total: countRes.rows[0].count });
  } catch { res.status(500).json({ success: false, message: 'Failed' }); }
});

router.patch('/products/:id/status', async (req, res) => {
  const { status, reason } = req.body;
  if (!['live','rejected','paused','pending'].includes(status))
    return res.status(400).json({ success: false, message: 'Invalid status' });
  try {
    const { rows } = await query(`
      UPDATE products SET status=$1::varchar, updated_at=NOW(),
        rejection_reason = CASE WHEN $1::varchar='rejected' THEN $2 ELSE rejection_reason END,
        approved_at      = CASE WHEN $1::varchar='live'     THEN NOW() ELSE approved_at END,
        approved_by      = CASE WHEN $1::varchar='live'     THEN $3   ELSE approved_by END
      WHERE id=$4 RETURNING *
    `, [status, reason||null, req.admin.id, req.params.id]);
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Not found' });
    logAction(req.admin.id, req.admin.name, `product_${status}`, 'product', req.params.id, rows[0].title, { reason }, req.ip);
    res.json({ success: true, message: `Product ${status}`, product: rows[0] });
  } catch { res.status(500).json({ success: false, message: 'Failed' }); }
});

// ═══════════════════════════════════════════════════════════════
// ORDERS
// ═══════════════════════════════════════════════════════════════
router.get('/orders', async (req, res) => {
  const { status, payment, search, page = 1, limit = 20 } = req.query;
  const params = [];
  const where  = [];

  if (status && status !== 'all') { params.push(status); where.push(`o.status=$${params.length}`); }
  if (payment) { params.push(payment); where.push(`o.payment_method=$${params.length}`); }
  if (search) {
    params.push(`%${search}%`);
    where.push(`(o.order_number ILIKE $${params.length} OR u.name ILIKE $${params.length})`);
  }
  const wc = where.length ? 'WHERE ' + where.join(' AND ') : '';

  try {
    const countRes = await query(`SELECT COUNT(*)::int FROM orders o LEFT JOIN users u ON u.id=o.buyer_id ${wc}`, params);
    const { rows } = await query(`
      SELECT o.*, u.name AS buyer_name, u.phone AS buyer_phone, s.shop_name AS seller_name
      FROM orders o
      LEFT JOIN users u   ON u.id=o.buyer_id
      LEFT JOIN sellers s ON s.id=o.seller_id
      ${wc}
      ORDER BY o.created_at DESC
      LIMIT $${params.length+1} OFFSET $${params.length+2}
    `, [...params, limit, (page-1)*limit]);

    res.json({ success: true, orders: rows, total: countRes.rows[0].count, page: +page });
  } catch { res.status(500).json({ success: false, message: 'Failed' }); }
});

router.patch('/orders/:id/status', async (req, res) => {
  const { status, tracking_number, cancelled_reason } = req.body;
  try {
    const { rows } = await query(`
      UPDATE orders SET status=$1,
        tracking_number  = COALESCE($2, tracking_number),
        cancelled_reason = COALESCE($3, cancelled_reason),
        updated_at=NOW()
      WHERE id=$4 RETURNING *
    `, [status, tracking_number||null, cancelled_reason||null, req.params.id]);
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Not found' });
    logAction(req.admin.id, req.admin.name, `order_${status}`, 'order', req.params.id, rows[0].order_number, {}, req.ip);
    res.json({ success: true, message: `Order updated to ${status}`, order: rows[0] });
  } catch { res.status(500).json({ success: false, message: 'Failed' }); }
});

// ═══════════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════════
router.get('/analytics', async (req, res) => {
  try {
    const [monthly, topSellers, topProducts, byCategory, userGrowth] = await Promise.all([
      query(`
        SELECT TO_CHAR(DATE_TRUNC('month',created_at),'Mon YYYY') AS month,
          COALESCE(SUM(total_amount),0)::int AS revenue,
          COUNT(*)::int AS orders,
          COUNT(DISTINCT buyer_id)::int AS buyers
        FROM orders WHERE created_at >= NOW()-INTERVAL '12 months' AND status='delivered'
        GROUP BY DATE_TRUNC('month',created_at) ORDER BY DATE_TRUNC('month',created_at)
      `),
      query(`
        SELECT s.shop_name, s.category, s.rating,
          COUNT(o.id)::int AS orders,
          COALESCE(SUM(o.total_amount),0)::int AS revenue
        FROM sellers s LEFT JOIN orders o ON o.seller_id=s.id AND o.status='delivered'
        WHERE s.status='active' GROUP BY s.id ORDER BY revenue DESC LIMIT 8
      `),
      query(`
        SELECT p.title, p.emoji, p.price, p.sold, p.rating, s.shop_name
        FROM products p LEFT JOIN sellers s ON s.id=p.seller_id
        WHERE p.status='live' ORDER BY p.sold DESC LIMIT 8
      `),
      query(`
        SELECT p.category,
          COUNT(o.id)::int AS orders,
          COALESCE(SUM(o.total_amount),0)::int AS revenue
        FROM orders o JOIN products p ON p.id=o.product_id
        WHERE o.status='delivered' GROUP BY p.category ORDER BY revenue DESC
      `),
      query(`
        SELECT TO_CHAR(DATE_TRUNC('month',created_at),'Mon') AS month,
          COUNT(*)::int AS users
        FROM users WHERE created_at >= NOW()-INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month',created_at) ORDER BY DATE_TRUNC('month',created_at)
      `),
    ]);

    res.json({ success: true, monthly: monthly.rows, topSellers: topSellers.rows, topProducts: topProducts.rows, byCategory: byCategory.rows, userGrowth: userGrowth.rows });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: 'Failed' }); }
});

// ═══════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════
router.get('/notifications', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50');
    const unread = rows.filter(n => !n.is_read).length;
    res.json({ success: true, notifications: rows, unread });
  } catch { res.status(500).json({ success: false, message: 'Failed' }); }
});

router.patch('/notifications/read-all', async (req, res) => {
  await query('UPDATE notifications SET is_read=true');
  res.json({ success: true });
});

// ═══════════════════════════════════════════════════════════════
// ACTIVITY LOGS
// ═══════════════════════════════════════════════════════════════
router.get('/logs', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT 100');
    res.json({ success: true, logs: rows });
  } catch { res.status(500).json({ success: false, message: 'Failed' }); }
});

// ═══════════════════════════════════════════════════════════════
// ADMIN MANAGEMENT (super admin only)
// ═══════════════════════════════════════════════════════════════
router.get('/admins', requireSuperAdmin, async (req, res) => {
  const { rows } = await query('SELECT id,name,email,role,is_active,last_login,created_at FROM admins ORDER BY created_at');
  res.json({ success: true, admins: rows });
});

router.post('/admins', requireSuperAdmin, async (req, res) => {
  const { name, email, password, role = 'admin' } = req.body;
  const bcrypt = require('bcryptjs');
  try {
    const hash = await bcrypt.hash(password, 12);
    const { rows } = await query(
      'INSERT INTO admins (name,email,password_hash,role) VALUES ($1,$2,$3,$4) RETURNING id,name,email,role',
      [name, email, hash, role]
    );
    res.status(201).json({ success: true, admin: rows[0] });
  } catch { res.status(500).json({ success: false, message: 'Failed to create admin' }); }
});

module.exports = router;
