require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { pool } = require('./db');

async function migrateVideos() {
  const client = await pool.connect();
  try {
    console.log('🔄 Adding videos table...\n');
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS videos (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        seller_id    UUID REFERENCES sellers(id) ON DELETE CASCADE,
        video_url    TEXT NOT NULL,
        thumbnail_url TEXT,
        caption      TEXT,
        product_ids  UUID[] DEFAULT '{}',
        likes        INTEGER DEFAULT 0,
        views        INTEGER DEFAULT 0,
        status       VARCHAR(20) NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending','live','rejected')),
        created_at   TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('  ✅ videos table');

    await client.query('CREATE INDEX IF NOT EXISTS idx_videos_seller ON videos(seller_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status)');
    console.log('  ✅ indexes');

    await client.query('COMMIT');
    console.log('\n✅ Videos migration completed!\n');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌ Migration failed:', err.message);
    throw err;
  } finally {
    client.release();
    pool.end();
  }
}

migrateVideos().catch(() => process.exit(1));
