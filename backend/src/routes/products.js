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
  limits: { fileSize: 8 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

const uploadImageToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'image', folder: 'shoptok/products' },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });

const parseArrayField = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
};

const numOrNull = (v) => {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

// ── POST /api/products/upload-images ──────────────────────────────────────────
router.post('/upload-images', authSeller, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files?.length) {
      return res.status(400).json({ success: false, message: 'No images provided' });
    }

    const results = await Promise.all(
      req.files.map((f) => uploadImageToCloudinary(f.buffer))
    );

    return res.json({
      success: true,
      images: results.map((r) => r.secure_url),
    });
  } catch (err) {
    console.error('Image upload error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Image upload failed',
    });
  }
});

// ── PUBLIC CATALOGUE ───────────────────────────────────────────────────────────
// Returns master listings + active reseller listings.
// Reseller rows use reseller_listings.id as `id`, so existing checkout can send
// the same product_id field without any CheckoutFlow change.
router.get('/', async (req, res) => {
  const {
    cat,
    search,
    sort = 'sold',
    page = 1,
    limit = 20,
  } = req.query;

  const lim = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const offset = Math.max((Number(page) - 1) * lim, 0);

  try {
    const params = [];
    const masterWhere = [`p.status='live'`];
    const resellerWhere = [`p.status='live'`, `rl.status='active'`, `p.allow_reselling=true`];

    if (cat && cat !== 'all') {
      params.push(cat);
      masterWhere.push(`p.category=$${params.length}`);
      resellerWhere.push(`p.category=$${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      masterWhere.push(`(p.title ILIKE $${params.length} OR p.description ILIKE $${params.length})`);
      resellerWhere.push(`(p.title ILIKE $${params.length} OR p.description ILIKE $${params.length})`);
    }

    const sortMap = {
      sold: 'sold DESC',
      price_asc: 'price ASC',
      price_desc: 'price DESC',
      rating: 'rating DESC',
      newest: 'created_at DESC',
    };

    const rows = await query(`
      WITH catalogue AS (
        SELECT
          p.id,
          p.id AS source_product_id,
          NULL::uuid AS reseller_listing_id,
          'master'::text AS listing_type,
          p.seller_id AS original_seller_id,
          NULL::uuid AS reseller_seller_id,
          p.title,
          p.description,
          p.price::numeric AS price,
          p.original_price::numeric AS original_price,
          p.discount_pct,
          p.category,
          p.subcategory,
          p.emoji,
          p.images,
          p.stock,
          p.sold,
          p.rating,
          p.review_count,
          p.brand,
          p.sku,
          p.weight_grams,
          p.sizes,
          p.colors,
          p.allow_reselling,
          p.reseller_base_price,
          p.min_resale_price,
          s.shop_name AS seller,
          p.created_at
        FROM products p
        LEFT JOIN sellers s ON s.id=p.seller_id
        WHERE ${masterWhere.join(' AND ')}

        UNION ALL

        SELECT
          rl.id AS id,
          p.id AS source_product_id,
          rl.id AS reseller_listing_id,
          'reseller'::text AS listing_type,
          p.seller_id AS original_seller_id,
          rl.reseller_seller_id,
          p.title,
          p.description,
          rl.selling_price::numeric AS price,
          CASE
            WHEN p.original_price IS NOT NULL AND p.original_price > rl.selling_price
              THEN p.original_price::numeric
            ELSE rl.selling_price::numeric
          END AS original_price,
          CASE
            WHEN p.original_price IS NOT NULL AND p.original_price > 0
              THEN GREATEST(0, ROUND((1-(rl.selling_price/p.original_price))*100))
            ELSE 0
          END::int AS discount_pct,
          p.category,
          p.subcategory,
          p.emoji,
          p.images,
          p.stock,
          p.sold,
          p.rating,
          p.review_count,
          p.brand,
          p.sku,
          p.weight_grams,
          p.sizes,
          p.colors,
          p.allow_reselling,
          p.reseller_base_price,
          p.min_resale_price,
          rs.shop_name AS seller,
          rl.created_at
        FROM reseller_listings rl
        JOIN products p ON p.id=rl.product_id
        JOIN sellers rs ON rs.id=rl.reseller_seller_id
        WHERE ${resellerWhere.join(' AND ')}
      )
      SELECT *
      FROM catalogue
      ORDER BY ${sortMap[sort] || sortMap.sold}
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
    `, [...params, lim, offset]);

    return res.json({ success: true, products: rows.rows });
  } catch (err) {
    console.error('Catalogue load failed:', err);
    return res.status(500).json({ success: false, message: 'Failed' });
  }
});

// ── SELLER'S OWN MASTER PRODUCTS ──────────────────────────────────────────────
router.get('/my', authSeller, async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT *
      FROM products
      WHERE seller_id=$1
      ORDER BY created_at DESC
    `, [req.seller.id]);

    return res.json({ success: true, products: rows });
  } catch (err) {
    console.error('Seller products load failed:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to load your products',
    });
  }
});

// ── PRODUCTS AVAILABLE TO RESELL ──────────────────────────────────────────────
router.get('/resellable', authSeller, async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT
        p.*,
        s.shop_name AS supplier_name,
        COALESCE(p.reseller_base_price, p.price)::numeric AS supplier_price,
        GREATEST(
          COALESCE(p.min_resale_price, 0),
          COALESCE(p.reseller_base_price, p.price)
        )::numeric AS minimum_listing_price
      FROM products p
      JOIN sellers s ON s.id=p.seller_id
      WHERE p.status='live'
        AND p.allow_reselling=true
        AND p.seller_id<>$1
        AND NOT EXISTS (
          SELECT 1
          FROM reseller_listings rl
          WHERE rl.product_id=p.id
            AND rl.reseller_seller_id=$1
        )
      ORDER BY p.created_at DESC
    `, [req.seller.id]);

    return res.json({ success: true, products: rows });
  } catch (err) {
    console.error('Resellable products load failed:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to load reseller catalogue',
    });
  }
});

// ── MY RESELLER LISTINGS ──────────────────────────────────────────────────────
router.get('/reseller-listings/my', authSeller, async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT
        rl.*,
        p.title,
        p.description,
        p.images,
        p.emoji,
        p.stock,
        p.status AS product_status,
        p.category,
        p.subcategory,
        p.brand,
        p.sizes,
        p.colors,
        COALESCE(p.reseller_base_price, p.price)::numeric AS supplier_price,
        p.min_resale_price,
        s.shop_name AS supplier_name,
        (rl.selling_price - COALESCE(p.reseller_base_price, p.price))::numeric AS profit_per_unit
      FROM reseller_listings rl
      JOIN products p ON p.id=rl.product_id
      JOIN sellers s ON s.id=p.seller_id
      WHERE rl.reseller_seller_id=$1
      ORDER BY rl.created_at DESC
    `, [req.seller.id]);

    return res.json({ success: true, listings: rows });
  } catch (err) {
    console.error('My reseller listings load failed:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to load reseller listings',
    });
  }
});

// ── ADD TO MY STORE ────────────────────────────────────────────────────────────
router.post('/reseller-listings', authSeller, async (req, res) => {
  const { product_id, selling_price } = req.body;

  try {
    const productResult = await query(`
      SELECT *
      FROM products
      WHERE id=$1
        AND status='live'
        AND allow_reselling=true
    `, [product_id]);

    const product = productResult.rows[0];

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'This product is not available for reselling',
      });
    }

    if (String(product.seller_id) === String(req.seller.id)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot resell your own product',
      });
    }

    const price = Number(selling_price);
    const supplierPrice = Number(product.reseller_base_price ?? product.price);
    const minimumPrice = Math.max(
      supplierPrice,
      Number(product.min_resale_price || 0)
    );

    if (!Number.isFinite(price) || price < minimumPrice) {
      return res.status(400).json({
        success: false,
        message: `Selling price must be at least $${minimumPrice.toFixed(2)}`,
      });
    }

    const { rows } = await query(`
      INSERT INTO reseller_listings (
        product_id,
        reseller_seller_id,
        selling_price,
        status
      )
      VALUES ($1,$2,$3,'active')
      ON CONFLICT (product_id, reseller_seller_id)
      DO UPDATE SET
        selling_price=EXCLUDED.selling_price,
        status='active',
        updated_at=NOW()
      RETURNING *
    `, [product.id, req.seller.id, price]);

    return res.status(201).json({
      success: true,
      message: 'Product added to your store',
      listing: rows[0],
    });
  } catch (err) {
    console.error('Create reseller listing failed:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to add product to your store',
    });
  }
});

// ── UPDATE RESELLER PRICE ─────────────────────────────────────────────────────
router.put('/reseller-listings/:id', authSeller, async (req, res) => {
  try {
    const current = await query(`
      SELECT
        rl.*,
        p.price,
        p.reseller_base_price,
        p.min_resale_price
      FROM reseller_listings rl
      JOIN products p ON p.id=rl.product_id
      WHERE rl.id=$1
        AND rl.reseller_seller_id=$2
    `, [req.params.id, req.seller.id]);

    const row = current.rows[0];

    if (!row) {
      return res.status(404).json({
        success: false,
        message: 'Reseller listing not found',
      });
    }

    const price = Number(req.body.selling_price);
    const supplierPrice = Number(row.reseller_base_price ?? row.price);
    const minimumPrice = Math.max(
      supplierPrice,
      Number(row.min_resale_price || 0)
    );

    if (!Number.isFinite(price) || price < minimumPrice) {
      return res.status(400).json({
        success: false,
        message: `Selling price must be at least $${minimumPrice.toFixed(2)}`,
      });
    }

    const { rows } = await query(`
      UPDATE reseller_listings
      SET selling_price=$1,
          updated_at=NOW()
      WHERE id=$2
        AND reseller_seller_id=$3
      RETURNING *
    `, [price, req.params.id, req.seller.id]);

    return res.json({
      success: true,
      message: 'Reseller price updated',
      listing: rows[0],
    });
  } catch (err) {
    console.error('Update reseller listing failed:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update reseller listing',
    });
  }
});

// ── REMOVE FROM MY STORE ──────────────────────────────────────────────────────
router.delete('/reseller-listings/:id', authSeller, async (req, res) => {
  try {
    const { rows } = await query(`
      DELETE FROM reseller_listings
      WHERE id=$1
        AND reseller_seller_id=$2
      RETURNING id
    `, [req.params.id, req.seller.id]);

    if (!rows[0]) {
      return res.status(404).json({
        success: false,
        message: 'Reseller listing not found',
      });
    }

    return res.json({
      success: true,
      message: 'Product removed from your store',
    });
  } catch (err) {
    console.error('Delete reseller listing failed:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove product',
    });
  }
});

// ── CREATE MASTER PRODUCT ─────────────────────────────────────────────────────
router.post('/', authSeller, async (req, res) => {
  const {
    title,
    description,
    price,
    original_price,
    category,
    subcategory,
    emoji,
    stock,
    images,
    brand,
    sku,
    weight_grams,
    sizes,
    colors,
    allow_reselling = false,
    reseller_base_price,
    min_resale_price,
  } = req.body;

  try {
    const salePrice = Number(price);
    const originalPrice = numOrNull(original_price);
    const resellerBase = numOrNull(reseller_base_price);
    const minResale = numOrNull(min_resale_price);

    if (!title?.trim() || !Number.isFinite(salePrice) || salePrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Product title and valid price are required',
      });
    }

    if (
      allow_reselling &&
      resellerBase !== null &&
      resellerBase <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Reseller base price must be greater than zero',
      });
    }

    const effectiveBase = resellerBase ?? salePrice;

    if (
      allow_reselling &&
      minResale !== null &&
      minResale < effectiveBase
    ) {
      return res.status(400).json({
        success: false,
        message: 'Minimum resale price cannot be below reseller base price',
      });
    }

    const disc =
      originalPrice && originalPrice > 0
        ? Math.max(0, Math.round((1 - salePrice / originalPrice) * 100))
        : 0;

    const { rows } = await query(`
      INSERT INTO products (
        seller_id,
        title,
        description,
        price,
        original_price,
        discount_pct,
        category,
        subcategory,
        emoji,
        stock,
        images,
        brand,
        sku,
        weight_grams,
        sizes,
        colors,
        status,
        allow_reselling,
        reseller_base_price,
        min_resale_price
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,'pending',$17,$18,$19
      )
      RETURNING *
    `, [
      req.seller.id,
      title.trim(),
      description || null,
      salePrice,
      originalPrice,
      disc,
      category,
      subcategory || null,
      emoji || '📦',
      Number(stock) || 0,
      images || [],
      brand || null,
      sku || null,
      numOrNull(weight_grams),
      parseArrayField(sizes),
      parseArrayField(colors),
      Boolean(allow_reselling),
      allow_reselling ? effectiveBase : null,
      allow_reselling ? (minResale ?? effectiveBase) : null,
    ]);

    try {
      notify.newProduct(rows[0]);
    } catch (notifyErr) {
      console.error('Product notification failed:', notifyErr);
    }

    return res.status(201).json({
      success: true,
      message: 'Product submitted for review',
      product: rows[0],
    });
  } catch (err) {
    console.error('Create product failed:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to add product',
    });
  }
});

// ── UPDATE MASTER PRODUCT ─────────────────────────────────────────────────────
router.put('/:id', authSeller, async (req, res) => {
  const {
    title,
    description,
    price,
    original_price,
    category,
    subcategory,
    stock,
    images,
    brand,
    sku,
    weight_grams,
    sizes,
    colors,
    allow_reselling,
    reseller_base_price,
    min_resale_price,
  } = req.body;

  try {
    const currentResult = await query(`
      SELECT *
      FROM products
      WHERE id=$1
        AND seller_id=$2
    `, [req.params.id, req.seller.id]);

    const current = currentResult.rows[0];

    if (!current) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const nextPrice = price !== undefined ? Number(price) : Number(current.price);
    const nextOriginal =
      original_price !== undefined
        ? numOrNull(original_price)
        : numOrNull(current.original_price);

    const nextAllow =
      allow_reselling !== undefined
        ? Boolean(allow_reselling)
        : Boolean(current.allow_reselling);

    const nextBase =
      reseller_base_price !== undefined
        ? numOrNull(reseller_base_price)
        : numOrNull(current.reseller_base_price);

    const effectiveBase = nextBase ?? nextPrice;

    const nextMin =
      min_resale_price !== undefined
        ? numOrNull(min_resale_price)
        : numOrNull(current.min_resale_price);

    if (nextAllow && effectiveBase <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Reseller base price must be greater than zero',
      });
    }

    if (nextAllow && nextMin !== null && nextMin < effectiveBase) {
      return res.status(400).json({
        success: false,
        message: 'Minimum resale price cannot be below reseller base price',
      });
    }

    const disc =
      nextOriginal && nextOriginal > 0
        ? Math.max(0, Math.round((1 - nextPrice / nextOriginal) * 100))
        : 0;

    const { rows } = await query(`
      UPDATE products
      SET
        title=$1,
        description=$2,
        price=$3,
        original_price=$4,
        discount_pct=$5,
        category=$6,
        subcategory=$7,
        stock=$8,
        images=$9,
        brand=$10,
        sku=$11,
        weight_grams=$12,
        sizes=$13,
        colors=$14,
        allow_reselling=$15,
        reseller_base_price=$16,
        min_resale_price=$17,
        updated_at=NOW()
      WHERE id=$18
        AND seller_id=$19
      RETURNING *
    `, [
      title !== undefined ? title : current.title,
      description !== undefined ? description : current.description,
      nextPrice,
      nextOriginal,
      disc,
      category !== undefined ? category : current.category,
      subcategory !== undefined ? subcategory : current.subcategory,
      stock !== undefined ? Number(stock) : Number(current.stock),
      images !== undefined ? images : current.images,
      brand !== undefined ? brand : current.brand,
      sku !== undefined ? sku : current.sku,
      weight_grams !== undefined ? numOrNull(weight_grams) : current.weight_grams,
      sizes !== undefined ? parseArrayField(sizes) : current.sizes,
      colors !== undefined ? parseArrayField(colors) : current.colors,
      nextAllow,
      nextAllow ? effectiveBase : null,
      nextAllow ? (nextMin ?? effectiveBase) : null,
      current.id,
      req.seller.id,
    ]);

    if (!nextAllow) {
      await query(`
        UPDATE reseller_listings
        SET status='disabled',
            updated_at=NOW()
        WHERE product_id=$1
      `, [current.id]);
    } else {
      await query(`
        UPDATE reseller_listings
        SET status='active',
            updated_at=NOW()
        WHERE product_id=$1
          AND selling_price >= GREATEST($2, $3)
      `, [
        current.id,
        effectiveBase,
        nextMin ?? effectiveBase,
      ]);

      await query(`
        UPDATE reseller_listings
        SET status='disabled',
            updated_at=NOW()
        WHERE product_id=$1
          AND selling_price < GREATEST($2, $3)
      `, [
        current.id,
        effectiveBase,
        nextMin ?? effectiveBase,
      ]);
    }

    return res.json({
      success: true,
      message: 'Product updated',
      product: rows[0],
    });
  } catch (err) {
    console.error('Update product failed:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update product',
    });
  }
});

// ── PRODUCT DETAIL: MASTER OR RESELLER LISTING ────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const master = await query(`
      SELECT
        p.*,
        p.id AS source_product_id,
        NULL::uuid AS reseller_listing_id,
        'master'::text AS listing_type,
        s.shop_name AS seller_name,
        s.rating AS seller_rating
      FROM products p
      LEFT JOIN sellers s ON s.id=p.seller_id
      WHERE p.id=$1
        AND p.status='live'
    `, [req.params.id]);

    let product = master.rows[0];

    if (!product) {
      const reseller = await query(`
        SELECT
          p.*,
          rl.id AS id,
          p.id AS source_product_id,
          rl.id AS reseller_listing_id,
          'reseller'::text AS listing_type,
          p.seller_id AS original_seller_id,
          rl.reseller_seller_id,
          rl.selling_price AS price,
          rs.shop_name AS seller_name,
          rs.rating AS seller_rating
        FROM reseller_listings rl
        JOIN products p ON p.id=rl.product_id
        JOIN sellers rs ON rs.id=rl.reseller_seller_id
        WHERE rl.id=$1
          AND rl.status='active'
          AND p.status='live'
          AND p.allow_reselling=true
      `, [req.params.id]);

      product = reseller.rows[0];
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Not found',
      });
    }

    const reviews = await query(`
      SELECT r.*, u.name AS buyer_name
      FROM reviews r
      LEFT JOIN users u ON u.id=r.buyer_id
      WHERE r.product_id=$1
      ORDER BY r.created_at DESC
      LIMIT 20
    `, [product.source_product_id || product.id]);

    return res.json({
      success: true,
      product,
      reviews: reviews.rows,
    });
  } catch (err) {
    console.error('Product detail failed:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed',
    });
  }
});

module.exports = router;
