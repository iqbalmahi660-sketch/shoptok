require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { pool } = require('./db');

async function migrateVideoFields() {
  const client = await pool.connect();
  try {
    console.log('🔄 Adding video metadata columns...\n');
    await client.query('BEGIN');

    await client.query(`ALTER TABLE videos ADD COLUMN IF NOT EXISTS title VARCHAR(150)`);
    await client.query(`ALTER TABLE videos ADD COLUMN IF NOT EXISTS hashtags TEXT[] DEFAULT '{}'`);
    await client.query(`ALTER TABLE videos ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'`);
    console.log('  ✅ title, hashtags, tags columns added');
    // Note: `caption` (description) and `product_ids` already exist from the first videos migration.

    await client.query('COMMIT');
    console.log('\n✅ Video fields migration completed!\n');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌ Migration failed:', err.message);
    throw err;
  } finally {
    client.release();
    pool.end();
  }
}

migrateVideoFields().catch(() => process.exit(1));
