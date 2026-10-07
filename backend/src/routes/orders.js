const express = require('express');
const { query } = require('../database/db');
const { authUser, authSeller } = require('../middleware/auth');
const { notify } = require('../socket');

const router = express.Router();

const genOrderNum = () =>
  '#ORD-' +
  Date.now().toString(36).toUpperCase() +
  '-' +
  Math.random().toString(36).slice(2, 6).toUpperCase();

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;


// ─── CREATE ORDER ─────────────────────────────────────────────────────────────

router.post('/', authUser, async (req, res) => {
  const {
    product_id,
    quantity = 1,
    payment_method = 'COD',
    shipping_name,
    shipping_phone,
    shipping_address,
    shipping_city,
    rider_note,
  } = req.body;

  try {
    if (!UUID_RE.test(String(product_id || ''))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product. Please refresh the shop and try again.',
      });
    }

    const qty = Number(quantity);

    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quantity',
      });
    }

    const { rows: prodRows } = await query(
      `
      SELECT *
      FROM products
      WHERE id = $1
        AND status = 'live'
        AND stock >= $2
      `,
      [product_id, qty]
    );

    if (!prodRows[0]) {
      return res.status(400).json({
        success: false,
        message: 'Product unavailable',
      });
    }

    const p = prodRows[0];

    // Shipping removed completely
    const fee = 0;
    const total = p.price * qty;

    const { rows } = await query(
      `
      INSERT INTO orders (
        order_number,
        buyer_id,
        seller_id,
        product_id,
        product_title,
        product_emoji,
        quantity,
        unit_price,
        shipping_fee,
        total_amount,
        status,
        payment_method,
        shipping_name,
        shipping_phone,
        shipping_address,
        shipping_city,
        rider_note
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        'processing',
        $11,$12,$13,$14,$15,$16
      )
      RETURNING *
      `,
      [
        genOrderNum(),
        req.user.id,
        p.seller_id,
        p.id,
        p.title,
        p.emoji,
        qty,
        p.price,
        fee,
        total,
        payment_method,
        shipping_name,
        shipping_phone,
        shipping_address,
        shipping_city,
        rider_note,
      ]
    );

    await query(
      `
      UPDATE products
      SET stock = stock - $1,
          sold = sold + $2
      WHERE id = $3
      `,
      [qty, qty, product_id]
    );

    try {
      notify.newOrder(rows[0]);
    } catch (notifyErr) {
      console.error('Order notification failed:', notifyErr);
    }

    return res.status(201).json({
      success: true,
      message: 'Order placed!',
      order: rows[0],
    });
  } catch (err) {
    console.error('Create order failed:', err);

    return res.status(500).json({
      success: false,
      message: 'Failed',
    });
  }
});


// ─── SELLER ORDERS ────────────────────────────────────────────────────────────

router.get('/seller', authSeller, async (req, res) => {
  try {
    const { rows } = await query(
      `
      SELECT
        o.*,
        p.images AS product_images,
        p.emoji AS product_current_emoji
      FROM orders o
      LEFT JOIN products p
        ON p.id = o.product_id
      WHERE o.seller_id = $1
      ORDER BY o.created_at DESC
      `,
      [req.seller.id]
    );

    return res.json({
      success: true,
      orders: rows,
    });
  } catch (err) {
    console.error('Seller orders load failed:', err);

    return res.status(500).json({
      success: false,
      message: 'Failed',
    });
  }
});


// ─── SELLER UPDATE DELIVERY STATUS ───────────────────────────────────────────
// New orders start as Processing.
// Seller can only mark their own order as Delivered.

router.patch('/seller/:id/status', authSeller, async (req, res) => {
  try {
    const status = String(req.body?.status || '')
      .trim()
      .toLowerCase();

    if (status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Seller can only mark an order as Delivered',
      });
    }

    const { rows } = await query(
      `
      UPDATE orders
      SET status = $1
      WHERE id = $2
        AND seller_id = $3
      RETURNING *
      `,
      [
        status,
        req.params.id,
        req.seller.id,
      ]
    );

    if (!rows[0]) {
      return res.status(404).json({
        success: false,
        message:
          'Order not found or you do not have permission to update it',
      });
    }

    try {
      if (notify?.orderStatus) {
        notify.orderStatus(rows[0]);
      }
    } catch (notifyErr) {
      console.error(
        'Order status notification failed:',
        notifyErr
      );
    }

    return res.json({
      success: true,
      message: `Order marked as ${status}`,
      order: rows[0],
    });
  } catch (err) {
    console.error(
      'Seller order status update failed:',
      err
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to update order status',
    });
  }
});


// ─── BUYER ORDERS ─────────────────────────────────────────────────────────────

router.get('/my', authUser, async (req, res) => {
  try {
    const { rows } = await query(
      `
      SELECT
        o.*,
        p.images AS product_images,
        p.emoji AS product_current_emoji,
        s.shop_name AS seller_name
      FROM orders o
      LEFT JOIN products p
        ON p.id = o.product_id
      LEFT JOIN sellers s
        ON s.id = o.seller_id
      WHERE o.buyer_id = $1
      ORDER BY o.created_at DESC
      `,
      [req.user.id]
    );

    return res.json({
      success: true,
      orders: rows,
    });
  } catch (err) {
    console.error(
      'Buyer orders load failed:',
      err
    );

    return res.status(500).json({
      success: false,
      message: 'Failed',
    });
  }
});

module.exports = router;