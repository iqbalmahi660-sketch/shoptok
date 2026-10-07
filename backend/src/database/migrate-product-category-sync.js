require("dotenv").config({
  path: require("path").join(
    __dirname,
    "../../.env"
  ),
});

const {
  Pool,
} = require("pg");

const databaseUrl =
  process.env.DATABASE_URL;

if (
  !databaseUrl
) {
  console.error(
    "❌ DATABASE_URL not found"
  );

  process.exit(
    1
  );
}

const isLocal =
  databaseUrl.includes(
    "localhost"
  ) ||
  databaseUrl.includes(
    "127.0.0.1"
  );

const pool =
  new Pool({
    connectionString:
      databaseUrl,

    ssl: isLocal
      ? false
      : {
          rejectUnauthorized:
            false,
        },
  });

async function run() {
  const client =
    await pool.connect();

  try {
    console.log(
      "🔄 Syncing product categories...\n"
    );

    await client.query(
      "BEGIN"
    );

    // Add subcategory field
    await client.query(`
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS subcategory VARCHAR(150);
    `);

    console.log(
      "  ✅ subcategory column"
    );

    // Normalize old category values
    await client.query(`
      UPDATE products
      SET category =
        CASE

          WHEN LOWER(category) IN (
            'fashion & clothing',
            'womenswear & underwear',
            'women''s clothing',
            'fashion'
          )
          THEN 'fashion'

          WHEN LOWER(category) IN (
            'phones & electronics',
            'electronics',
            'phones and electronics'
          )
          THEN 'electronics'

          WHEN LOWER(category) IN (
            'fashion accessories',
            'accessories'
          )
          THEN 'accessories'

          WHEN LOWER(category) IN (
            'menswear & underwear',
            'men''s clothing',
            'menswear'
          )
          THEN 'menswear'

          WHEN LOWER(category) IN (
            'home & living',
            'home supplies',
            'home'
          )
          THEN 'home'

          WHEN LOWER(category) IN (
            'beauty & skincare',
            'beauty & personal care',
            'beauty'
          )
          THEN 'beauty'

          WHEN LOWER(category) IN (
            'shoes',
            'footwear'
          )
          THEN 'shoes'

          WHEN LOWER(category) IN (
            'sports & outdoors',
            'sports & outdoor',
            'sports'
          )
          THEN 'sports'

          WHEN LOWER(category) IN (
            'bags & luggage',
            'luggage & bags',
            'bags'
          )
          THEN 'bags'

          ELSE category
        END
      WHERE category IS NOT NULL;
    `);

    console.log(
      "  ✅ old categories normalized"
    );

    await client.query(`
      CREATE INDEX IF NOT EXISTS
      idx_products_category
      ON products(category);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS
      idx_products_subcategory
      ON products(subcategory);
    `);

    console.log(
      "  ✅ category indexes"
    );

    await client.query(
      "COMMIT"
    );

    console.log(
      "\n✅ Product category sync migration completed!\n"
    );
  } catch (
    err
  ) {
    await client.query(
      "ROLLBACK"
    );

    console.error(
      "\n❌ Migration failed:",
      err.message
    );

    process.exitCode =
      1;
  } finally {
    client.release();

    await pool.end();
  }
}

run();