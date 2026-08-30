require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { pool } = require('./db');
const bcrypt   = require('bcryptjs');

async function seed() {
  const client = await pool.connect();
  try {
    console.log('🌱 Seeding database...\n');
    await client.query('BEGIN');

    // ── Super Admin ────────────────────────────────────────────────────────────
    const adminEmail = process.env.ADMIN_EMAIL    || 'admin@shoptok.pk';
    const adminPass  = process.env.ADMIN_PASSWORD || 'Admin@ShopTok2024!';
    const adminName  = process.env.ADMIN_NAME     || 'Super Admin';
    const hash       = await bcrypt.hash(adminPass, 12);

    const adminRes = await client.query(`
      INSERT INTO admins (name, email, password_hash, role)
      VALUES ($1, $2, $3, 'super_admin')
      ON CONFLICT (email) DO UPDATE SET password_hash = $3, name = $1
      RETURNING id
    `, [adminName, adminEmail, hash]);
    const adminId = adminRes.rows[0].id;

    console.log('  ✅ Super Admin created');
    console.log(`     Email:    ${adminEmail}`);
    console.log(`     Password: ${adminPass}`);

    // ── Sample Buyers ──────────────────────────────────────────────────────────
    const buyerHash = await bcrypt.hash('Test@1234', 10);
    const buyers = [
      ['Ayesha Khan',   'ayesha@gmail.com',   '0312-3456789', 'Lahore',     'active'],
      ['Ahmed Raza',    'ahmed@gmail.com',    '0333-9876543', 'Karachi',    'active'],
      ['Fatima Malik',  'fatima@yahoo.com',   '0345-1122334', 'Islamabad',  'suspended'],
      ['Bilal Tariq',   'bilal@hotmail.com',  '0301-5544332', 'Rawalpindi', 'active'],
      ['Sara Noor',     'sara@gmail.com',     '0321-6677889', 'Faisalabad', 'pending'],
    ];
    const buyerIds = [];
    for (const [name, email, phone, city, status] of buyers) {
      const r = await client.query(`
        INSERT INTO users (name, email, phone, password_hash, city, status)
        VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (email) DO UPDATE SET name=$1
        RETURNING id
      `, [name, email, phone, buyerHash, city, status]);
      buyerIds.push(r.rows[0].id);
    }
    console.log('  ✅ Sample buyers created (5)');

    // ── Sample Sellers ─────────────────────────────────────────────────────────
    const sellerUsers = [
      ['Kamran Hassan',  'trendy@gmail.com',    '0312-1111222', 'Lahore'],
      ['Rehan Shah',     'techzone@gmail.com',  '0333-3334445', 'Karachi'],
      ['Nadia Fatima',   'glow@yahoo.com',      '0345-5556667', 'Islamabad'],
      ['Asad Mirza',     'homedecor@gmail.com', '0321-7778889', 'Rawalpindi'],
      ['Tariq Mehmood',  'sports@gmail.com',    '0311-9990001', 'Faisalabad'],
    ];
    const sellerHash = await bcrypt.hash('Seller@1234', 10);
    const sellerIds = [];

    const sellerDetails = [
      ['TrendyWear PK',    'Fashion & Clothing',   'Fashion', '35202-1234567-1', 'HBL',         'Kamran Hassan',  '0123456789012', 'active'],
      ['TechZone Pakistan','Electronics Expert',    'Electronics','42101-9876543-2','Meezan Bank','Rehan Shah',    '9876543210123', 'active'],
      ['GlowSkin Studio',  'Premium Skincare',      'Beauty',  '61101-5544332-3', 'Bank Alfalah','Nadia Fatima',  '5544332211098', 'pending'],
      ['HomeDecor Hub',    'Home & Living',         'Home',    '37405-3322110-4', 'UBL',         'Asad Mirza',    '3322110099876', 'active'],
      ['SportsKing PK',    'Sports & Fitness Gear', 'Sports',  '33100-6655443-5', 'MCB',         'Tariq Mehmood', '6655443322109', 'pending'],
    ];

    for (let i = 0; i < sellerUsers.length; i++) {
      const [name, email, phone, city] = sellerUsers[i];
      const [shopName, bio, cat, cnic, bank, acTitle, acNum, status] = sellerDetails[i];

      const uRes = await client.query(`
        INSERT INTO users (name, email, phone, password_hash, city, status)
        VALUES ($1,$2,$3,$4,$5,'active') ON CONFLICT (email) DO UPDATE SET name=$1
        RETURNING id
      `, [name, email, phone, sellerHash, city]);
      const uid = uRes.rows[0].id;

      const approvedAt = status === 'active' ? 'NOW()' : 'NULL';
      const sRes = await client.query(`
        INSERT INTO sellers (user_id, shop_name, shop_bio, category, cnic, bank_name, account_title, account_number, city, status, rating, approved_at, approved_by)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,4.7,${status==='active'?'NOW()':'NULL'},${status==='active'?'$11':'NULL'})
        ON CONFLICT (user_id) DO UPDATE SET shop_name=$2
        RETURNING id
      `, status === 'active'
        ? [uid, shopName, bio, cat, cnic, bank, acTitle, acNum, city, status, adminId]
        : [uid, shopName, bio, cat, cnic, bank, acTitle, acNum, city, status]);
      sellerIds.push(sRes.rows[0].id);
    }
    console.log('  ✅ Sample sellers created (5)');

    // ── Sample Products ────────────────────────────────────────────────────────
    const sampleProducts = [
      [sellerIds[0], 'Aesthetic Oversized Hoodie', 2499, 3500, 'Fashion',     '👕', 48,  'live'],
      [sellerIds[1], 'Wireless Earbuds Pro Max',   4999, 7000, 'Electronics', '🎧', 22,  'live'],
      [sellerIds[2], 'Glass Skin Serum Kit',       1899, 2500, 'Beauty',      '✨', 67,  'pending'],
      [sellerIds[3], 'Aesthetic Desk Lamp LED',    3299, 4500, 'Home',        '💡', 15,  'live'],
      [sellerIds[4], 'Running Shoes Boost Pro',    5999, 8500, 'Sports',      '👟', 33,  'pending'],
      [sellerIds[0], 'Mini Crossbody Bag Y2K',     1599, 2200, 'Fashion',     '👜', 89,  'live'],
      [sellerIds[1], 'Smart Watch Series X',       8999, 12000,'Electronics', '⌚', 11,  'live'],
      [sellerIds[3], 'Matcha Latte Kit Premium',   2199, 3000, 'Food',        '🍵', 54,  'pending'],
    ];
    for (const [sid, title, price, orig, cat, emoji, stock, status] of sampleProducts) {
      const disc = Math.round((1 - price/orig)*100);
      await client.query(`
        INSERT INTO products (seller_id, title, price, original_price, discount_pct, category, emoji, stock, sold, rating, review_count, status, approved_at, approved_by)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,4.8,120,$10,${status==='live'?'NOW()':'NULL'},${status==='live'?'$11':'NULL'})
      `, status === 'live'
        ? [sid, title, price, orig, disc, cat, emoji, stock, Math.floor(Math.random()*2000+100), status, adminId]
        : [sid, title, price, orig, disc, cat, emoji, stock, 0, status]);
    }
    console.log('  ✅ Sample products created (8)');

    // ── Sample Orders ──────────────────────────────────────────────────────────
    const prodRes = await client.query("SELECT id, seller_id, title, emoji, price FROM products WHERE status='live' LIMIT 4");
    const statuses = ['delivered','shipped','processing','pending','cancelled'];
    const payments = ['COD','JazzCash','Easypaisa','Card'];
    const cities   = ['Karachi','Lahore','Islamabad','Rawalpindi'];

    for (let i = 0; i < 12; i++) {
      const p   = prodRes.rows[i % prodRes.rows.length];
      const qty = Math.floor(Math.random() * 2) + 1;
      const fee = (p.price * qty) >= 1000 ? 0 : 150;
      await client.query(`
        INSERT INTO orders (order_number, buyer_id, seller_id, product_id, product_title, product_emoji,
          quantity, unit_price, shipping_fee, total_amount, status, payment_method,
          shipping_name, shipping_phone, shipping_address, shipping_city)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
      `, [
        `#ORD-${String(1000+i).padStart(6,'0')}`,
        buyerIds[i % buyerIds.length],
        p.seller_id, p.id, p.title, p.emoji, qty, p.price, fee, p.price*qty+fee,
        statuses[i % statuses.length],
        payments[i % payments.length],
        'Test User', '0300-0000000', `${i+1} Test Street`, cities[i % cities.length],
      ]);
    }
    console.log('  ✅ Sample orders created (12)');

    // ── Initial notification ───────────────────────────────────────────────────
    await client.query(`
      INSERT INTO notifications (type, title, body, icon, color)
      VALUES ('system','Welcome to ShopTok Admin!','Your admin panel is ready. Start by reviewing pending sellers.','🎉','#34d399')
    `);

    await client.query('COMMIT');
    console.log('\n✅ Database seeded successfully!\n');
    console.log('──────────────────────────────');
    console.log('🚀 Next steps:');
    console.log('   npm run dev        → start server');
    console.log(`   Admin login:       ${adminEmail}`);
    console.log(`   Admin password:    ${adminPass}`);
    console.log('   API health:        http://localhost:5000/health');
    console.log('──────────────────────────────\n');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err.message);
    throw err;
  } finally {
    client.release();
    pool.end();
  }
}

seed().catch(() => process.exit(1));
