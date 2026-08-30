require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('🔄 Running migrations...\n');
    await client.query('BEGIN');
    await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await client.query(`CREATE TABLE IF NOT EXISTS admins (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(30) NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin','admin','moderator')),
      is_active BOOLEAN DEFAULT TRUE,
      last_login TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    console.log('  ✅ admins');

    await client.query(`CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      phone VARCHAR(20),
      password_hash VARCHAR(255) NOT NULL,
      city VARCHAR(60),
      avatar VARCHAR(10) DEFAULT '👤',
      profile_img TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('pending','active','suspended')),
      total_orders INTEGER DEFAULT 0,
      total_spent BIGINT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    console.log('  ✅ users');

    await client.query(`CREATE TABLE IF NOT EXISTS sellers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      shop_name VARCHAR(150) NOT NULL,
      shop_bio TEXT,
      category VARCHAR(60),
      cnic VARCHAR(20),
      bank_name VARCHAR(60),
      account_title VARCHAR(100),
      account_number VARCHAR(30),
      city VARCHAR(60),
      status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','suspended','rejected')),
      rating DECIMAL(3,1) DEFAULT 0,
      total_products INTEGER DEFAULT 0,
      total_orders INTEGER DEFAULT 0,
      total_revenue BIGINT DEFAULT 0,
      rejection_reason TEXT,
      approved_at TIMESTAMPTZ,
      approved_by UUID REFERENCES admins(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    console.log('  ✅ sellers');

    await client.query(`CREATE TABLE IF NOT EXISTS products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      price INTEGER NOT NULL CHECK (price > 0),
      original_price INTEGER,
      discount_pct INTEGER DEFAULT 0,
      category VARCHAR(60),
      emoji VARCHAR(10) DEFAULT '📦',
      images TEXT[] DEFAULT '{}',
      stock INTEGER DEFAULT 0,
      sold INTEGER DEFAULT 0,
      rating DECIMAL(3,1) DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','live','rejected','paused')),
      rejection_reason TEXT,
      approved_at TIMESTAMPTZ,
      approved_by UUID REFERENCES admins(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    console.log('  ✅ products');

    await client.query(`CREATE TABLE IF NOT EXISTS orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_number VARCHAR(20) UNIQUE NOT NULL,
      buyer_id UUID REFERENCES users(id),
      seller_id UUID REFERENCES sellers(id),
      product_id UUID REFERENCES products(id),
      product_title VARCHAR(200),
      product_emoji VARCHAR(10),
      quantity INTEGER NOT NULL DEFAULT 1,
      unit_price INTEGER NOT NULL,
      shipping_fee INTEGER NOT NULL DEFAULT 150,
      total_amount INTEGER NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','refunded')),
      payment_method VARCHAR(20) NOT NULL DEFAULT 'Bank Transfer' CHECK (payment_method IN ('USDT','Bank Transfer','Crypto','COD','JazzCash','Easypaisa','Card')),
      payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','refunded','failed')),
      shipping_name VARCHAR(100),
      shipping_phone VARCHAR(20),
      shipping_address TEXT,
      shipping_city VARCHAR(60),
      rider_note TEXT,
      tracking_number VARCHAR(50),
      cancelled_reason TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    console.log('  ✅ orders');

    await client.query(`CREATE TABLE IF NOT EXISTS reviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id UUID REFERENCES products(id) ON DELETE CASCADE,
      buyer_id UUID REFERENCES users(id),
      order_id UUID REFERENCES orders(id),
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      comment TEXT,
      images TEXT[] DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    console.log('  ✅ reviews');

    await client.query(`CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      type VARCHAR(50) NOT NULL,
      title VARCHAR(150) NOT NULL,
      body TEXT,
      icon VARCHAR(10) DEFAULT '🔔',
      color VARCHAR(20) DEFAULT '#fe2c55',
      target_type VARCHAR(30),
      target_id UUID,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    console.log('  ✅ notifications');

    await client.query(`CREATE TABLE IF NOT EXISTS admin_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      admin_id UUID REFERENCES admins(id),
      admin_name VARCHAR(100),
      action VARCHAR(100) NOT NULL,
      target_type VARCHAR(50),
      target_id UUID,
      target_name VARCHAR(150),
      details JSONB DEFAULT '{}',
      ip_address VARCHAR(45),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    console.log('  ✅ admin_logs');

    // Drop test table if exists
    await client.query(`DROP TABLE IF EXISTS test`);

    await client.query('COMMIT');
    console.log('\n✅ All migrations completed!\n');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌ Migration failed:', err.message);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
