const { query } = require('./src/database/db');

async function run() {
  try {
    await query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);

    await query(`
      ALTER TABLE products
        ADD COLUMN IF NOT EXISTS allow_reselling BOOLEAN NOT NULL DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS reseller_base_price NUMERIC(12,2),
        ADD COLUMN IF NOT EXISTS min_resale_price NUMERIC(12,2)
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS reseller_listings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        reseller_seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
        selling_price NUMERIC(12,2) NOT NULL CHECK (selling_price > 0),
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (product_id, reseller_seller_id)
      )
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_reseller_listings_product
        ON reseller_listings(product_id)
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_reseller_listings_reseller
        ON reseller_listings(reseller_seller_id)
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_reseller_listings_status
        ON reseller_listings(status)
    `);

    await query(`
      ALTER TABLE orders
        ADD COLUMN IF NOT EXISTS original_seller_id UUID REFERENCES sellers(id),
        ADD COLUMN IF NOT EXISTS reseller_seller_id UUID REFERENCES sellers(id),
        ADD COLUMN IF NOT EXISTS reseller_listing_id UUID REFERENCES reseller_listings(id),
        ADD COLUMN IF NOT EXISTS supplier_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS reseller_profit NUMERIC(12,2) NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS platform_fee NUMERIC(12,2) NOT NULL DEFAULT 0
    `);

    await query(`
      UPDATE orders
      SET original_seller_id = seller_id
      WHERE original_seller_id IS NULL
    `);

    console.log('✅ Seller + reseller migration complete');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

run();
