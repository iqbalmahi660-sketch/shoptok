require('dotenv').config({
  path: require('path').join(__dirname, '../../.env')
});

const { Pool } = require('pg');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found in backend/.env');
  process.exit(1);
}

const isLocalDatabase =
  databaseUrl.includes('localhost') ||
  databaseUrl.includes('127.0.0.1');

const pool = new Pool({
  connectionString: databaseUrl,

  // Local PostgreSQL usually does not use SSL.
  // Railway PostgreSQL requires SSL.
  ssl: isLocalDatabase
    ? false
    : {
        rejectUnauthorized: false,
      },
});

async function migrateSellerProfileFields() {
  const client = await pool.connect();

  try {
    console.log('🔄 Adding seller profile fields...\n');

    console.log(
      isLocalDatabase
        ? '📍 Database: Local PostgreSQL (SSL disabled)'
        : '☁️ Database: Remote/Railway PostgreSQL (SSL enabled)'
    );

    await client.query('BEGIN');

    await client.query(`
      ALTER TABLE sellers
        ADD COLUMN IF NOT EXISTS legal_name VARCHAR(255),
        ADD COLUMN IF NOT EXISTS shop_address TEXT,
        ADD COLUMN IF NOT EXISTS country VARCHAR(150),
        ADD COLUMN IF NOT EXISTS shop_logo TEXT,
        ADD COLUMN IF NOT EXISTS cnic_front TEXT,
        ADD COLUMN IF NOT EXISTS cnic_back TEXT,
        ADD COLUMN IF NOT EXISTS cnic_selfie TEXT,
        ADD COLUMN IF NOT EXISTS invite_code VARCHAR(150);
    `);

    console.log('  ✅ seller profile columns');

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_sellers_country
      ON sellers(country);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_sellers_invite_code
      ON sellers(invite_code);
    `);

    console.log('  ✅ seller profile indexes');

    await client.query('COMMIT');

    console.log('\n✅ Seller profile migration completed!\n');
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch (_) {}

    console.error(
      '\n❌ Seller profile migration failed:',
      err.message
    );

    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

migrateSellerProfileFields();