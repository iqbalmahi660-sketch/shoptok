const express = require('express');
const multer  = require('multer');
const cloudinary = require('cloudinary').v2;
const { query } = require('../database/db');
const { authUser } = require('../middleware/auth');
const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB, matches the frontend check
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('video/')) return cb(new Error('Only video files are allowed'));
    cb(null, true);
  },
});

const uploadToCloudinary = (buffer) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(
    { resource_type: 'video', folder: 'shoptok/videos' },
    (err, result) => (err ? reject(err) : resolve(result))
  );
  stream.end(buffer);
});

const parseArrayField = (val) => {
  if (!val) return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch { return []; }
};

// ── POST /api/videos ───────────────────────────────────────────────────────
// Seller uploads a new video. Requires the seller to already have a seller
// profile (i.e. completed seller onboarding).
router.post('/', authUser, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No video file provided' });

    const sellerRes = await query('SELECT id FROM sellers WHERE user_id=$1', [req.user.id]);
    const seller = sellerRes.rows[0];
    if (!seller) return res.status(403).json({ success: false, message: 'Only sellers can upload videos' });

    const result = await uploadToCloudinary(req.file.buffer);

    const { title, caption, description, product_ids, hashtags, tags } = req.body;
    const parsedProductIds = parseArrayField(product_ids);
    const parsedHashtags   = parseArrayField(hashtags);
    const parsedTags       = parseArrayField(tags);

    const { rows } = await query(
      `INSERT INTO videos (seller_id, video_url, thumbnail_url, title, caption, product_ids, hashtags, tags, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pending') RETURNING *`,
      [
        seller.id, result.secure_url, result.thumbnail_url || null,
        title || null, description || caption || null,
        parsedProductIds, parsedHashtags, parsedTags,
      ]
    );

    res.status(201).json({ success: true, video: rows[0] });
  } catch (err) {
    console.error('Video upload error:', err);
    res.status(500).json({ success: false, message: err.message || 'Video upload failed' });
  }
});

// ── GET /api/videos/mine ──────────────────────────────────────────────────
// The logged-in seller's own videos, any status — for their dashboard grid.
router.get('/mine', authUser, async (req, res) => {
  try {
    const sellerRes = await query('SELECT id FROM sellers WHERE user_id=$1', [req.user.id]);
    const seller = sellerRes.rows[0];
    if (!seller) return res.json({ success: true, videos: [] });

    const { rows } = await query(
      'SELECT * FROM videos WHERE seller_id=$1 ORDER BY created_at DESC',
      [seller.id]
    );
    res.json({ success: true, videos: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load videos' });
  }
});

// ── GET /api/videos ────────────────────────────────────────────────────────
// Public feed of approved videos (for the buyer-facing shop/home page).
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const { rows } = await query(
      `SELECT v.*, s.shop_name AS creator
       FROM videos v JOIN sellers s ON s.id = v.seller_id
       WHERE v.status='live' ORDER BY v.created_at DESC LIMIT $1`,
      [limit]
    );
    res.json({ success: true, videos: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load videos' });
  }
});

module.exports = router;
