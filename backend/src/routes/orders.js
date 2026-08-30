const express = require('express');
const { query } = require('../database/db');
const { authUser } = require('../middleware/auth');
const { notify } = require('../socket');
const router = express.Router();

const genOrderNum = () => '#ORD-' + Date.now().toString().slice(-6);

router.post('/', authUser, async (req, res) => {
  const { product_id, quantity=1, payment_method='COD', shipping_name, shipping_phone, shipping_address, shipping_city, rider_note } = req.body;
  try {
    const { rows: prodRows } = await query(
      "SELECT * FROM products WHERE id=$1 AND status='live' AND stock>=$2",
      [product_id, quantity]
    );
    if (!prodRows[0]) return res.status(400).json({ success: false, message: 'Product unavailable' });
    const p = prodRows[0];
    const fee   = (p.price * quantity) >= 1000 ? 0 : 150;
    const total = p.price * quantity + fee;

    const { rows } = await query(`
      INSERT INTO orders (order_number,buyer_id,seller_id,product_id,product_title,product_emoji,
        quantity,unit_price,shipping_fee,total_amount,status,payment_method,
        shipping_name,shipping_phone,shipping_address,shipping_city,rider_note)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'pending',$11,$12,$13,$14,$15,$16)
      RETURNING *
    `, [genOrderNum(), req.user.id, p.seller_id, p.id, p.title, p.emoji,
        quantity, p.price, fee, total, payment_method,
        shipping_name, shipping_phone, shipping_address, shipping_city, rider_note]);

    await query('UPDATE products SET stock=stock-$1, sold=sold+$2 WHERE id=$3', [quantity, quantity, product_id]);
    notify.newOrder(rows[0]);
    res.status(201).json({ success: true, message: 'Order placed!', order: rows[0] });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: 'Failed' }); }
});

router.get('/my', authUser, async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT o.*, p.emoji, s.shop_name AS seller_name
      FROM orders o LEFT JOIN products p ON p.id=o.product_id LEFT JOIN sellers s ON s.id=o.seller_id
      WHERE o.buyer_id=$1 ORDER BY o.created_at DESC
    `, [req.user.id]);
    res.json({ success: true, orders: rows });
  } catch { res.status(500).json({ success: false, message: 'Failed' }); }
});

module.exports = router;
