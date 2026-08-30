require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { pool } = require('./db');

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('🔄 Running migrations...\n');
    await client.query('BEGIN');

    // ── Enable UUID extension ──────────────────────────────────────────────────
    await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    // ── ADMINS ────────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name          VARCHAR(100) NOT NULL,
        email         VARCHAR(150) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role          VARCHAR(30)  NOT NULL DEFAULT 'admin'
                        CHECK (role IN ('super_admin','admin','moderator')),
        is_active     BOOLEAN DEFAULT TRUE,
        last_login    TIMESTAMPTZ,
        created_at    TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('  ✅ admins');

    // ── USERS (buyers) ────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name          VARCHAR(100) NOT NULL,
        email         VARCHAR(150) UNIQUE NOT NULL,
        phone         VARCHAR(20),
        password_hash VARCHAR(255) NOT NULL,
        city          VARCHAR(60),
        avatar        VARCHAR(10)  DEFAULT '👤',
        profile_img   TEXT,
        status        VARCHAR(20)  NOT NULL DEFAULT 'active'
                        CHECK (status IN ('pending','active','suspended')),
        total_orders  INTEGER DEFAULT 0,
        total_spent   BIGINT  DEFAULT 0,
        created_at    TIMESTAMPTZ DEFAULT NOW(),
        updated_at    TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('  ✅ users');

    // ── SELLERS ───────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS sellers (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id          UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        shop_name        VARCHAR(150) NOT NULL,
        shop_bio         TEXT,
        category         VARCHAR(60),
        cnic             VARCHAR(20),
        bank_name        VARCHAR(60),
        account_title    VARCHAR(100),
        account_number   VARCHAR(30),
        city             VARCHAR(60),
        status           VARCHAR(20) NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending','active','suspended','rejected')),
        rating           DECIMAL(3,1) DEFAULT 0,
        total_products   INTEGER DEFAULT 0,
        total_orders     INTEGER DEFAULT 0,
        total_revenue    BIGINT  DEFAULT 0,
        rejection_reason TEXT,
        approved_at      TIMESTAMPTZ,
        approved_by      UUID REFERENCES admins(id),
        created_at       TIMESTAMPTZ DEFAULT NOW(),
        updated_at       TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('  ✅ sellers');

    // ── PRODUCTS ──────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        seller_id        UUID REFERENCES sellers(id) ON DELETE CASCADE,
        title            VARCHAR(200) NOT NULL,
        description      TEXT,
        price            INTEGER NOT NULL CHECK (price > 0),
        original_price   INTEGER,
        discount_pct     INTEGER DEFAULT 0,
        category         VARCHAR(60),
        emoji            VARCHAR(10)  DEFAULT '📦',
        images           TEXT[]       DEFAULT '{}',
        stock            INTEGER      DEFAULT 0,
        sold             INTEGER      DEFAULT 0,
        rating           DECIMAL(3,1) DEFAULT 0,
        review_count     INTEGER      DEFAULT 0,
        status           VARCHAR(20)  NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending','live','rejected','paused')),
        rejection_reason TEXT,
        approved_at      TIMESTAMPTZ,
        approved_by      UUID REFERENCES admins(id),
        created_at       TIMESTAMPTZ DEFAULT NOW(),
        updated_at       TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('  ✅ products');

    // ── ORDERS ────────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_number     VARCHAR(20) UNIQUE NOT NULL,
        buyer_id         UUID REFERENCES users(id),
        seller_id        UUID REFERENCES sellers(id),
        product_id       UUID REFERENCES products(id),
        product_title    VARCHAR(200),
        product_emoji    VARCHAR(10),
        quantity         INTEGER NOT NULL DEFAULT 1,
        unit_price       INTEGER NOT NULL,
        shipping_fee     INTEGER NOT NULL DEFAULT 150,
        total_amount     INTEGER NOT NULL,
        status           VARCHAR(20) NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','refunded')),
        payment_method   VARCHAR(20) NOT NULL DEFAULT 'COD'
                           CHECK (payment_method IN ('USDT','Bank Transfer','Crypto','COD','JazzCash','Easypaisa','Card')),
        payment_status   VARCHAR(20) NOT NULL DEFAULT 'pending'
                           CHECK (payment_status IN ('pending','paid','refunded','failed')),
        shipping_name    VARCHAR(100),
        shipping_phone   VARCHAR(20),
        shipping_address TEXT,
        shipping_city    VARCHAR(60),
        rider_note       TEXT,
        tracking_number  VARCHAR(50),
        cancelled_reason TEXT,
        created_at       TIMESTAMPTZ DEFAULT NOW(),
        updated_at       TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('  ✅ orders');

    // ── REVIEWS ───────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id  UUID REFERENCES products(id) ON DELETE CASCADE,
        buyer_id    UUID REFERENCES users(id),
        order_id    UUID REFERENCES orders(id),
        rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comment     TEXT,
        images      TEXT[] DEFAULT '{}',
        created_at  TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('  ✅ reviews');

    // ── NOTIFICATIONS ─────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type        VARCHAR(50) NOT NULL,
        title       VARCHAR(150) NOT NULL,
        body        TEXT,
        icon        VARCHAR(10) DEFAULT '🔔',
        color       VARCHAR(20) DEFAULT '#fe2c55',
        target_type VARCHAR(30),
        target_id   UUID,
        is_read     BOOLEAN DEFAULT FALSE,
        created_at  TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('  ✅ notifications');

    // ── ADMIN ACTIVITY LOG ────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_logs (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        admin_id    UUID REFERENCES admins(id),
        admin_name  VARCHAR(100),
        action      VARCHAR(100) NOT NULL,
        target_type VARCHAR(50),
        target_id   UUID,
        target_name VARCHAR(150),
        details     JSONB DEFAULT '{}',
        ip_address  VARCHAR(45),
        created_at  TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('  ✅ admin_logs');

    // ── INDEXES ───────────────────────────────────────────────────────────────
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_email       ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_users_status      ON users(status)',
      'CREATE INDEX IF NOT EXISTS idx_users_created     ON users(created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_sellers_status    ON sellers(status)',
      'CREATE INDEX IF NOT EXISTS idx_sellers_user      ON sellers(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_sellers_created   ON sellers(created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_products_seller   ON products(seller_id)',
      'CREATE INDEX IF NOT EXISTS idx_products_status   ON products(status)',
      'CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)',
      'CREATE INDEX IF NOT EXISTS idx_orders_buyer      ON orders(buyer_id)',
      'CREATE INDEX IF NOT EXISTS idx_orders_seller     ON orders(seller_id)',
      'CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders(status)',
      'CREATE INDEX IF NOT EXISTS idx_orders_created    ON orders(created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_notifs_read       ON notifications(is_read)',
      'CREATE INDEX IF NOT EXISTS idx_logs_admin        ON admin_logs(admin_id)',
      'CREATE INDEX IF NOT EXISTS idx_logs_created      ON admin_logs(created_at DESC)',
    ];
    for (const idx of indexes) await client.query(idx);
    console.log('  ✅ indexes');

    await client.query('COMMIT');
    console.log('\n✅ All migrations completed!\n');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌ Migration failed:', err.message);
    throw err;
  } finally {
    client.release();
    pool.end();
  }
}

migrate().catch(() => process.exit(1));
