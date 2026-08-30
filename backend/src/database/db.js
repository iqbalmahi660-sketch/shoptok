const { Pool } = require('pg');

// Local Postgres installs usually don't support SSL, while most cloud
// providers (Neon, Supabase, Render, Railway, etc.) require it. Detect
// localhost automatically so this works for both without manual toggling.
const isLocalDb = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL || '');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocalDb ? false : { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

pool.on('error', (err) => console.error('Unexpected DB error:', err));

const query = (text, params) => pool.query(text, params);
const getClient = () => pool.connect();

module.exports = { query, getClient, pool };
