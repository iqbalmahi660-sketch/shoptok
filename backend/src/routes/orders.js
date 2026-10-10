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

// Resolve either a normal product UUID or a reseller-listing UUID.
const resolveSaleItem = async (listingId, qty) => {
  const direct = await query(`
    SELECT
      p.*,
      p.id AS source_product_id,
      NULL::uuid AS reseller_listing_id,
      NULL::uuid AS reseller_seller_id,
      p.seller_id AS original_seller_id,
      p.price::numeric AS checkout_price,
      p.price::numeric AS supplier_unit_price,
      'master'::text AS listing_type
    FROM products p
    WHERE p.id=$1
      AND p.status='live'
      AND p.stock >= $2
  `, [listingId, qty]);

  if (direct.rows[0]) return direct.rows[0];

  const reseller = await query(`
    SELECT
      p.*,
      p.id AS source_product_id,
      rl.id AS reseller_listing_id,
      rl.reseller_seller_id,
      p.seller_id AS original_seller_id,
      rl.selling_price::numeric AS checkout_price,
      COALESCE(p.reseller_base_price, p.price)::numeric AS supplier_unit_price,
      'reseller'::text AS listing_type
    FROM reseller_listings rl
    JOIN products p ON p.id=rl.product_id
    WHERE rl.id=$1
      AND rl.status='active'
      AND p.status='live'
      AND p.allow_reselling=true
      AND p.stock >= $2
  `, [listingId, qty]);

  return reseller.rows[0] || null;
};

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

    const item = await resolveSaleItem(product_id, qty);

    if (!item) {
      return res.status(400).json({
        success: false,
        message: 'Product unavailable',
      });
    }

    // Checkout remains shipping-free in the current TokZoo flow.
    const shippingFee = 0;
    const unitPrice = Number(item.checkout_price);
    const total = unitPrice * qty;

    // Platform fee is intentionally zero until platform-fee settings are enabled.
    // The schema already records it, so a fee can be introduced without another
    // order-table redesign.
    const platformFee = 0;

    const supplierAmount =
      Number(item.supplier_unit_price) * qty;

    const resellerProfit =
      item.listing_type === 'reseller'
        ? Math.max(0, total - supplierAmount - platformFee)
        : 0;

    const { rows } = await query(`
      INSERT INTO orders (
        order_number,
        buyer_id,
        seller_id,
        original_seller_id,
        reseller_seller_id,
        reseller_listing_id,
        product_id,
        product_title,
        product_emoji,
        quantity,
        unit_price,
        shipping_fee,
        total_amount,
        supplier_amount,
        reseller_profit,
        platform_fee,
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
        $11,$12,$13,$14,$15,$16,
        'processing',
        $17,$18,$19,$20,$21,$22
      )
      RETURNING *
    `, [
      genOrderNum(),
      req.user.id,
      item.original_seller_id,           // fulfillment seller
      item.original_seller_id,
      item.reseller_seller_id,
      item.reseller_listing_id,
      item.source_product_id,
      item.title,
      item.emoji,
      qty,
      unitPrice,
      shippingFee,
      total,
      supplierAmount,
      resellerProfit,
      platformFee,
      payment_method,
      shipping_name,
      shipping_phone,
      shipping_address,
      shipping_city,
      rider_note,
    ]);

    const stockUpdate = await query(`
      UPDATE products
      SET stock = stock - $1,
          sold = sold + $1
      WHERE id=$2
        AND stock >= $1
      RETURNING id, stock
    `, [qty, item.source_product_id]);

    if (!stockUpdate.rows[0]) {
      await query(`DELETE FROM orders WHERE id=$1`, [rows[0].id]);

      return res.status(409).json({
        success: false,
        message: 'Product went out of stock. Please try again.',
      });
    }

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

// ─── ORIGINAL SELLER / FULFILLMENT ORDERS ────────────────────────────────────
router.get('/seller', authSeller, async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT
        o.*,
        CASE WHEN o.reseller_seller_id IS NULL THEN false ELSE true END AS is_reseller_order,
        rs.shop_name AS reseller_shop_name
      FROM orders o
      LEFT JOIN sellers rs ON rs.id=o.reseller_seller_id
      WHERE o.seller_id=$1
      ORDER BY o.created_at DESC
    `, [req.seller.id]);

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

// ─── RESELLER SALES / EARNINGS ────────────────────────────────────────────────
router.get('/reseller', authSeller, async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT
        o.*,
        os.shop_name AS supplier_name
      FROM orders o
      LEFT JOIN sellers os ON os.id=o.original_seller_id
      WHERE o.reseller_seller_id=$1
      ORDER BY o.created_at DESC
    `, [req.seller.id]);

    return res.json({
      success: true,
      orders: rows,
    });
  } catch (err) {
    console.error('Reseller orders load failed:', err);

    return res.status(500).json({
      success: false,
      message: 'Failed to load reseller sales',
    });
  }
});

// ─── SELLER UPDATE DELIVERY STATUS ───────────────────────────────────────────
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

    const { rows } = await query(`
      UPDATE orders
      SET status=$1
      WHERE id=$2
        AND seller_id=$3
      RETURNING *
    `, [status, req.params.id, req.seller.id]);

    if (!rows[0]) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or you do not have permission to update it',
      });
    }

    try {
      if (notify?.orderStatus) {
        notify.orderStatus(rows[0]);
      }
    } catch (notifyErr) {
      console.error('Order status notification failed:', notifyErr);
    }

    return res.json({
      success: true,
      message: 'Order marked as delivered',
      order: rows[0],
    });
  } catch (err) {
    console.error('Seller order status update failed:', err);

    return res.status(500).json({
      success: false,
      message: 'Failed to update order status',
    });
  }
});

// ─── BUYER ORDERS ─────────────────────────────────────────────────────────────
router.get('/my', authUser, async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT
        o.*,
        p.emoji,
        COALESCE(rs.shop_name, s.shop_name) AS seller_name
      FROM orders o
      LEFT JOIN products p ON p.id=o.product_id
      LEFT JOIN sellers s ON s.id=o.seller_id
      LEFT JOIN sellers rs ON rs.id=o.reseller_seller_id
      WHERE o.buyer_id=$1
      ORDER BY o.created_at DESC
    `, [req.user.id]);

    return res.json({
      success: true,
      orders: rows,
    });
  } catch (err) {
    console.error('Buyer orders load failed:', err);

    return res.status(500).json({
      success: false,
      message: 'Failed',
    });
  }
});

module.exports = router;
