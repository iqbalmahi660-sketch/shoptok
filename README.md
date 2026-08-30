# ShopTok Admin Panel — Full Stack v2.0
## Node.js + PostgreSQL + Socket.io + React

---

## ⚡ 15-Minute Setup

### Step 1 — Free PostgreSQL (Railway)
1. **https://railway.app** → Sign Up (free)
2. **New Project** → **Add PostgreSQL**
3. PostgreSQL → **Connect** tab → copy `DATABASE_URL`
   ```
   postgresql://postgres:xxxxx@roundhouse.proxy.rlwy.net:PORT/railway
   ```

### Step 2 — Backend Setup
```bash
# 1. ZIP extract karein, backend folder mein jaein
cd shoptok-backend

# 2. Dependencies install karein
npm install

# 3. .env file banayein
cp .env.example .env

# 4. .env mein DATABASE_URL paste karein (Notepad / nano)
#    ADMIN_EMAIL aur ADMIN_PASSWORD bhi set karein

# 5. Database tables banayein
npm run db:migrate

# 6. Default admin + sample data add karein
npm run db:seed

# 7. Server start karein
npm run dev
```

✅ Backend: **http://localhost:5000**
✅ Health:  **http://localhost:5000/health**

### Step 3 — Frontend Setup
```bash
# Admin panel React app
cd shoptok-admin-frontend

# Agar Vite project hai:
npm install
npm run dev
# → http://localhost:3001
```

### Step 4 — Admin Login
| Field    | Value                   |
|----------|-------------------------|
| Email    | admin@shoptok.pk        |
| Password | Admin@ShopTok2024!      |

---

## 📁 File Structure

```
shoptok-backend/
├── src/
│   ├── server.js              ← Main entry + Socket.io
│   ├── database/
│   │   ├── db.js              ← PostgreSQL connection
│   │   ├── migrate.js         ← Create all tables
│   │   └── seed.js            ← Admin + sample data
│   ├── middleware/
│   │   └── auth.js            ← JWT + admin guard
│   ├── socket/
│   │   └── index.js           ← Real-time notifications
│   └── routes/
│       ├── auth.js            ← Login / Register
│       ├── admin.js           ← All admin APIs ⭐
│       ├── products.js        ← Product CRUD
│       ├── orders.js          ← Order management
│       └── upload.js          ← Image upload

shoptok-admin-frontend/
└── src/
    └── AdminApp.jsx           ← Complete admin panel UI
```

---

## 🔌 Complete API Reference

### Auth
| Method | Endpoint               | Body                        |
|--------|------------------------|-----------------------------|
| POST   | /api/auth/register     | name, email, password, role |
| POST   | /api/auth/login        | email, password             |
| POST   | /api/auth/admin/login  | email, password             |
| GET    | /api/auth/me           | — (requires token)          |

### Admin APIs (all require: `Authorization: Bearer <admin_token>`)
| Method | Endpoint                         | Description                  |
|--------|----------------------------------|------------------------------|
| GET    | /api/admin/dashboard             | Stats + recent orders        |
| GET    | /api/admin/buyers                | List buyers (filter/search)  |
| GET    | /api/admin/buyers/:id            | Buyer detail + orders        |
| PATCH  | /api/admin/buyers/:id/status     | active / suspended / pending |
| GET    | /api/admin/sellers               | List sellers                 |
| GET    | /api/admin/sellers/:id           | Full seller profile          |
| PATCH  | /api/admin/sellers/:id/status    | active / suspended / rejected|
| GET    | /api/admin/products              | List products                |
| PATCH  | /api/admin/products/:id/status   | live / rejected / paused     |
| GET    | /api/admin/orders                | List orders                  |
| PATCH  | /api/admin/orders/:id/status     | Update order status          |
| GET    | /api/admin/analytics             | Revenue + top sellers charts |
| GET    | /api/admin/notifications         | Real-time notif history      |
| PATCH  | /api/admin/notifications/read-all| Mark all read                |
| GET    | /api/admin/logs                  | Admin activity log           |
| GET    | /api/admin/admins                | Manage admins (super only)   |
| POST   | /api/admin/admins                | Create new admin             |

---

## 🔴 Real-Time (Socket.io)

Frontend automatically connects. Events received:

| Event           | Trigger                    | Data                |
|-----------------|----------------------------|---------------------|
| `notification`  | new seller/buyer/order/product | { type, icon, title, body, data } |
| `stats:update`  | every 60s                  | updated dashboard stats |

Connection code (already in AdminApp.jsx):
```js
import { io } from "socket.io-client";
const socket = io("http://localhost:5000");
socket.emit("admin:join");
socket.on("notification", (notif) => { /* show toast */ });
```

---

## 🚀 Deploy to Railway (Free)

### Backend on Railway:
1. GitHub pe push karein
2. railway.app → **New Project** → **Deploy from GitHub**
3. Repo select karein
4. **Variables** tab mein `.env` values add karein
5. Auto-deploy → URL milega: `https://shoptok-backend.up.railway.app`

### Frontend on Vercel (Free):
1. `API` variable mein Railway URL set karein
2. vercel.com → **Import Project** → deploy

---

## 🛡️ Security Features

| Feature             | Implementation           |
|---------------------|--------------------------|
| Password hashing    | bcrypt (12 rounds)       |
| JWT tokens          | Separate user + admin    |
| Rate limiting       | 200 req/15min per IP     |
| Helmet.js           | HTTP security headers    |
| Input validation    | express-validator        |
| CORS protection     | Whitelist only           |
| Activity logging    | Every admin action saved |
| SQL injection       | Parameterized queries    |

---

## 💡 Connecting Admin Panel to ShopTok App

In `shoptok-v7.jsx` (main app), replace mock data with API calls:

```javascript
// Login
const res = await fetch("http://localhost:5000/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password })
});
const { token, user } = await res.json();
localStorage.setItem("shopToken", token);

// Place order
const res = await fetch("http://localhost:5000/api/orders", {
  method: "POST",
  headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({ product_id, quantity, payment_method, shipping_name, ... })
});
```

---

## 💰 Cost

| Service    | Plan  | Cost   |
|------------|-------|--------|
| Railway    | Free  | $5 credit/mo (PostgreSQL + Node.js) |
| Cloudinary | Free  | 25GB storage + bandwidth |
| Vercel     | Free  | Unlimited frontend deploys |
| **Total**  |       | **Free for small scale** |
