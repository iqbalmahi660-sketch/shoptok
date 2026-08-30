// ─── routes/products.js ───────────────────────────────────────────────────────
const express = require('express');
const multer  = require('multer');
const cloudinary = require('cloudinary').v2;
const { query } = require('../database/db');
const { authSeller } = require('../middleware/auth');
const { notify } = require('../socket');
const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 5 }, // 8MB per image, max 5 images
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image files are allowed'));
    cb(null, true);
  },
});

const uploadImageToCloudinary = (buffer) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(
    { resource_type: 'image', folder: 'shoptok/products' },
    (err, result) => (err ? reject(err) : resolve(result))
  );
  stream.end(buffer);
});

// ── POST /api/products/upload-images ───────────────────────────────────────
// Seller uploads up to 5 product images. Returns the Cloudinary URLs to save
// on the product record afterwards.
router.post('/upload-images', authSeller, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files?.length) return res.status(400).json({ success: false, message: 'No images provided' });
    const results = await Promise.all(req.files.map((f) => uploadImageToCloudinary(f.buffer)));
    res.json({ success: true, images: results.map((r) => r.secure_url) });
  } catch (err) {
    console.error('Image upload error:', err);
    res.status(500).json({ success: false, message: err.message || 'Image upload failed' });
  }
});

router.get('/', async (req, res) => {
  const { cat, search, sort = 'sold', page = 1, limit = 20 } = req.query;
  const params = ["'live'"];
  const where  = ['p.status=$1'];
  if (cat && cat !== 'all') { params.push(cat); where.push(`p.category=$${params.length}`); }
  if (search) { params.push(`%${search}%`); where.push(`p.title ILIKE $${params.length}`); }
  const sortMap = { sold:'p.sold DESC', price_asc:'p.price ASC', price_desc:'p.price DESC', rating:'p.rating DESC', newest:'p.created_at DESC' };
  try {
    const { rows } = await query(`
      SELECT p.id,p.title,p.price,p.original_price,p.discount_pct,p.category,p.emoji,p.images,p.stock,p.sold,p.rating,p.review_count,
             p.brand,p.sku,p.weight_grams,p.sizes,p.colors,s.shop_name AS seller
      FROM products p LEFT JOIN sellers s ON s.id=p.seller_id
      WHERE ${where.join(' AND ')} ORDER BY ${sortMap[sort]||'p.sold DESC'}
      LIMIT $${params.length+1} OFFSET $${params.length+2}
    `, [...params, limit, (page-1)*limit]);
    res.json({ success: true, products: rows });
  } catch { res.status(500).json({ success: false, message: 'Failed' }); }
});

// ── GET /api/products/my ──────────────────────────────────────────────────
// The logged-in seller's own products, any status — for their dashboard.
router.get('/my', authSeller, async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT * FROM products WHERE seller_id=$1 ORDER BY created_at DESC
    `, [req.seller.id]);
    res.json({ success: true, products: rows });
  } catch { res.status(500).json({ success: false, message: 'Failed to load your products' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT p.*, s.shop_name AS seller_name, s.rating AS seller_rating
      FROM products p LEFT JOIN sellers s ON s.id=p.seller_id
      WHERE p.id=$1 AND p.status='live'
    `, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Not found' });
    const reviews = await query(`
      SELECT r.*, u.name AS buyer_name FROM reviews r
      LEFT JOIN users u ON u.id=r.buyer_id
      WHERE r.product_id=$1 ORDER BY r.created_at DESC LIMIT 20
    `, [req.params.id]);
    res.json({ success: true, product: rows[0], reviews: reviews.rows });
  } catch { res.status(500).json({ success: false, message: 'Failed' }); }
});

const parseArrayField = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch { return []; }
};

router.post('/', authSeller, async (req, res) => {
  const {
    title, description, price, original_price, category, emoji, stock, images,
    brand, sku, weight_grams, sizes, colors,
  } = req.body;
  try {
    const disc = original_price ? Math.round((1-price/original_price)*100) : 0;
    const { rows } = await query(`
      INSERT INTO products (seller_id,title,description,price,original_price,discount_pct,category,emoji,stock,images,brand,sku,weight_grams,sizes,colors,status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'pending') RETURNING *
    `, [
      req.seller.id, title, description, price, original_price, disc, category, emoji||'📦', stock, images||[],
      brand || null, sku || null, weight_grams || null, parseArrayField(sizes), parseArrayField(colors),
    ]);
    notify.newProduct(rows[0]);
    res.status(201).json({ success: true, message: 'Product submitted for review', product: rows[0] });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: 'Failed' }); }
});

module.exports = router;
