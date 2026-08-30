require('dotenv').config();
const express     = require('express');
const http        = require('http');
const { Server }  = require('socket.io');
const cors        = require('cors');
const helmet      = require('helmet');
const morgan      = require('morgan');
const rateLimit   = require('express-rate-limit');
const socketMgr   = require('./socket');

const app    = express();
const server = http.createServer(app);

// ── Socket.io setup ───────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: function(origin, callback) { callback(null, true); },
    methods: ['GET','POST'],
  },
});
socketMgr.init(io);

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan(process.env.NODE_ENV==='production' ? 'combined' : 'dev'));
app.use(cors({
  origin: function(origin, callback) { callback(null, true); },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(rateLimit({ windowMs: 15*60*1000, max: 200, message: { success:false, message:'Too many requests' } }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/admin',    require('./routes/admin'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/upload',   require('./routes/upload'));
app.use('/api/videos',   require('./routes/videos'));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status:'ok', env: process.env.NODE_ENV, time: new Date() }));

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ success:false, message:'Not found' }));

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌', err.message);
  res.status(err.status||500).json({ success:false, message: err.message||'Server error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 ShopTok Backend v2.0`);
  console.log(`   Port:   ${PORT}`);
  console.log(`   Env:    ${process.env.NODE_ENV}`);
  console.log(`   Health: http://localhost:${PORT}/health\n`);
});

module.exports = { app, io };
