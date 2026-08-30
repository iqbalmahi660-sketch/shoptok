require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { pool } = require('./db');

async function migrateProductFields() {
  const client = await pool.connect();
  try {
    console.log('🔄 Adding product detail columns...\n');
    await client.query('BEGIN');

    await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS brand VARCHAR(100)`);
    await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS sku VARCHAR(60)`);
    await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS weight_grams INTEGER`);
    await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes TEXT[] DEFAULT '{}'`);
    await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS colors TEXT[] DEFAULT '{}'`);
    console.log('  ✅ brand, sku, weight_grams, sizes, colors columns added');

    await client.query('COMMIT');
    console.log('\n✅ Product fields migration completed!\n');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌ Migration failed:', err.message);
    throw err;
  } finally {
    client.release();
    pool.end();
  }
}

migrateProductFields().catch(() => process.exit(1));
