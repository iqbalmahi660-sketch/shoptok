let _io = null;

// ── Initialize socket server ──────────────────────────────────────────────────
const init = (io) => {
  _io = io;

  io.on('connection', (socket) => {
    console.log(`🔌 Admin connected: ${socket.id}`);

    socket.on('admin:join', () => {
      socket.join('admins');
      console.log(`👤 Admin joined room: ${socket.id}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Admin disconnected: ${socket.id}`);
    });
  });
};

// ── Emit to all admins ────────────────────────────────────────────────────────
const emitToAdmins = (event, data) => {
  if (_io) _io.to('admins').emit(event, data);
};

// ── Notification helpers ──────────────────────────────────────────────────────
const notify = {
  newSeller:   (seller)   => emitToAdmins('notification', { type:'new_seller',   icon:'🏪', color:'#fbbf24', title:`New seller: ${seller.shop_name}`,     body:'Waiting for approval', data: seller }),
  newBuyer:    (user)     => emitToAdmins('notification', { type:'new_buyer',    icon:'👤', color:'#a78bfa', title:`New buyer: ${user.name}`,             body:'Just registered',      data: user }),
  newOrder:    (order)    => emitToAdmins('notification', { type:'new_order',    icon:'🛒', color:'#25f4ee', title:`New order ${order.order_number}`,      body:`Rs ${order.total_amount?.toLocaleString()}`, data: order }),
  newProduct:  (product)  => emitToAdmins('notification', { type:'new_product',  icon:'📦', color:'#fbbf24', title:`Product pending: ${product.title}`,   body:'Review needed',        data: product }),
  statsUpdate: (stats)    => emitToAdmins('stats:update', stats),
};

module.exports = { init, emitToAdmins, notify };
