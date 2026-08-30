import { useState, useEffect, useCallback, useRef } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const API   = "http://localhost:5000/api";
const WS    = "http://localhost:5000";

// ─── API HELPER ───────────────────────────────────────────────────────────────
const api = async (path, opts = {}) => {
  const token = localStorage.getItem("shopAdminToken");
  const res = await fetch(`${API}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
const Badge = ({ status }) => {
  const cfg = {
    active:     { bg:"rgba(52,211,153,.15)",  c:"#34d399", label:"Active" },
    pending:    { bg:"rgba(251,191,36,.15)",  c:"#fbbf24", label:"Pending" },
    suspended:  { bg:"rgba(254,44,85,.12)",   c:"#fe2c55", label:"Suspended" },
    rejected:   { bg:"rgba(254,44,85,.12)",   c:"#fe2c55", label:"Rejected" },
    delivered:  { bg:"rgba(52,211,153,.15)",  c:"#34d399", label:"Delivered" },
    shipped:    { bg:"rgba(37,244,238,.12)",  c:"#25f4ee", label:"Shipped" },
    processing: { bg:"rgba(251,191,36,.15)",  c:"#fbbf24", label:"Processing" },
    confirmed:  { bg:"rgba(167,139,250,.15)", c:"#a78bfa", label:"Confirmed" },
    cancelled:  { bg:"rgba(254,44,85,.12)",   c:"#fe2c55", label:"Cancelled" },
    refunded:   { bg:"rgba(251,191,36,.15)",  c:"#fbbf24", label:"Refunded" },
    live:       { bg:"rgba(52,211,153,.15)",  c:"#34d399", label:"Live" },
    paused:     { bg:"rgba(251,191,36,.15)",  c:"#fbbf24", label:"Paused" },
  }[status] || { bg:"rgba(255,255,255,.06)", c:"#888", label: status };
  return <span style={{ background:cfg.bg, color:cfg.c, fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:100, whiteSpace:"nowrap" }}>● {cfg.label}</span>;
};

const Stat = ({ icon, label, value, sub, color, trend }) => (
  <div style={{ background:"#111", border:"1px solid rgba(255,255,255,.07)", borderRadius:16, padding:"20px 22px", position:"relative", overflow:"hidden" }}>
    <div style={{ position:"absolute", top:-24, right:-24, width:80, height:80, borderRadius:"50%", background:`${color}10` }} />
    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
      <div style={{ width:42, height:42, borderRadius:12, background:`${color}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{icon}</div>
      {trend != null && <span style={{ fontSize:12, fontWeight:600, color: trend>=0?"#34d399":"#fe2c55" }}>{trend>=0?"↑":"↓"} {Math.abs(trend)}%</span>}
    </div>
    <p style={{ fontSize:11, color:"rgba(255,255,255,.4)", textTransform:"uppercase", letterSpacing:".06em", marginBottom:4 }}>{label}</p>
    <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:26, color, marginBottom:2 }}>{value}</p>
    {sub && <p style={{ fontSize:12, color:"rgba(255,255,255,.35)" }}>{sub}</p>}
  </div>
);

const Toast = ({ msg, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, []);
  const c = { success:"#34d399", error:"#fe2c55", info:"#25f4ee", warn:"#fbbf24" }[type] || "#34d399";
  return (
    <div style={{ position:"fixed", top:20, right:20, zIndex:9999, background:"#1a1a1a", border:`1px solid ${c}30`, borderLeft:`3px solid ${c}`, borderRadius:12, padding:"14px 18px", minWidth:280, display:"flex", alignItems:"center", gap:12, boxShadow:"0 8px 32px rgba(0,0,0,.5)", animation:"slideIn .3s ease" }}>
      <span style={{ fontSize:18 }}>{type==="success"?"✅":type==="error"?"❌":type==="warn"?"⚠️":"ℹ️"}</span>
      <span style={{ flex:1, fontSize:13, color:"rgba(255,255,255,.85)" }}>{msg}</span>
      <button onClick={onClose} style={{ background:"none", border:"none", color:"#555", cursor:"pointer", fontSize:18, lineHeight:1 }}>×</button>
    </div>
  );
};

const Modal = ({ title, onClose, children, width=540 }) => (
  <>
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.7)", backdropFilter:"blur(8px)", zIndex:1000 }} />
    <div style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:`min(${width}px,94vw)`, background:"#111", border:"1px solid rgba(255,255,255,.1)", borderRadius:20, zIndex:1001, animation:"fadeUp .25s ease", maxHeight:"90vh", overflowY:"auto" }}>
      <div style={{ padding:"18px 24px", borderBottom:"1px solid rgba(255,255,255,.07)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16 }}>{title}</h3>
        <button onClick={onClose} style={{ width:32, height:32, borderRadius:"50%", background:"rgba(255,255,255,.07)", border:"none", color:"#fff", cursor:"pointer", fontSize:18 }}>×</button>
      </div>
      <div style={{ padding:"22px 24px" }}>{children}</div>
    </div>
  </>
);

const SearchBar = ({ value, onChange, placeholder }) => (
  <div style={{ position:"relative" }}>
    <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,.3)", fontSize:14 }}>🔍</span>
    <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{ background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", borderRadius:10, padding:"9px 14px 9px 36px", color:"#fff", fontSize:13, fontFamily:"inherit", outline:"none", width:220 }} />
  </div>
);

const FilterTabs = ({ tabs, active, onChange, counts={} }) => (
  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
    {tabs.map(t => (
      <button key={t} onClick={()=>onChange(t)}
        style={{ padding:"7px 16px", borderRadius:100, border:"none", cursor:"pointer", fontSize:12, fontWeight:600, background: active===t?"#fe2c55":"rgba(255,255,255,.07)", color: active===t?"#fff":"rgba(255,255,255,.5)" }}>
        {t.charAt(0).toUpperCase()+t.slice(1)}
        {counts[t] > 0 && <span style={{ marginLeft:6, background:"rgba(255,255,255,.2)", borderRadius:100, padding:"0 6px", fontSize:10 }}>{counts[t]}</span>}
      </button>
    ))}
  </div>
);

const Btn = ({ children, onClick, color="#fe2c55", outline=false, small=false, disabled=false }) => (
  <button onClick={onClick} disabled={disabled}
    style={{ padding: small?"5px 12px":"9px 18px", borderRadius: small?7:10, border: outline?`1px solid ${color}40`:"none", cursor: disabled?"not-allowed":"pointer",
      background: outline?`${color}10`:disabled?"#222":color==="green"?"rgba(52,211,153,.15)":color==="red"?"rgba(254,44,85,.12)":`${color}`,
      color: outline||color==="green"||color==="red" ? (color==="green"?"#34d399":"#fe2c55") : "#fff",
      fontSize: small?11:13, fontWeight:600, opacity: disabled?.5:1 }}>
    {children}
  </button>
);

const NotifDot = ({ count }) => count > 0 ? (
  <span style={{ background:"#fe2c55", color:"#fff", fontSize:10, fontWeight:700, minWidth:18, height:18, borderRadius:9, display:"inline-flex", alignItems:"center", justifyContent:"center", padding:"0 5px" }}>{count > 99 ? "99+" : count}</span>
) : null;

// ─── MINI BAR CHART ───────────────────────────────────────────────────────────
const BarChart = ({ data, keyX="month", keyY="revenue" }) => {
  const max = Math.max(...data.map(d => d[keyY]), 1);
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:8, height:80 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
          <div style={{ width:"100%", borderRadius:"4px 4px 0 0", height:`${(d[keyY]/max)*68}px`,
            background: i===data.length-1 ? "linear-gradient(to top,#fe2c55,#ff6b35)" : "rgba(255,255,255,.1)",
            transition:"height .4s ease" }} />
          <span style={{ fontSize:10, color:"rgba(255,255,255,.3)" }}>{d[keyX]}</span>
        </div>
      ))}
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function AdminApp() {
  const [authed, setAuthed]           = useState(!!localStorage.getItem("shopAdminToken"));
  const [adminInfo, setAdminInfo]     = useState(null);
  const [tab, setTab]                 = useState("dashboard");
  const [adminDark, setAdminDark]      = useState(()=>localStorage.getItem("adminTheme")!=="light");
  const [toast, setToast]             = useState(null);
  const [modal, setModal]             = useState(null);
  const [loading, setLoading]         = useState(false);
  const [sideOpen, setSideOpen]       = useState(true);
  const [notifs, setNotifs]           = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs]   = useState(false);
  const socketRef                     = useRef(null);

  // ── data states ──
  const [dash,     setDash]     = useState(null);
  const [buyers,   setBuyers]   = useState([]);
  const [sellers,  setSellers]  = useState([]);
  const [products, setProducts] = useState([]);
  const [orders,   setOrders]   = useState([]);
  const [analytics,setAnalytics]= useState(null);
  const [logs,     setLogs]     = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [analyticsPeriod, setAnalyticsPeriod] = useState("monthly");

  // ── filter states ──
  const [buyerFilter,   setBuyerFilter]   = useState("all");
  const [sellerFilter,  setSellerFilter]  = useState("pending");
  const [productFilter, setProductFilter] = useState("all");
  const [orderFilter,   setOrderFilter]   = useState("all");
  const [search,        setSearch]        = useState("");

  const addToast = (msg, type="success") => setToast({ msg, type });

  // ── Download Analytics ────────────────────────────────────────────────────────
  const downloadAnalytics = (format = "csv") => {
    const now = new Date();
    const dayStart  = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now - 7*86400000);
    const monStart  = new Date(now.getFullYear(), now.getMonth(), 1);

    const periodOrders = orders.filter(o => {
      const d = new Date(o.created_at);
      if(analyticsPeriod==="daily")   return d >= dayStart;
      if(analyticsPeriod==="weekly")  return d >= weekStart;
      if(analyticsPeriod==="monthly") return d >= monStart;
      return true;
    });

    const periodLabel = { daily:"Today", weekly:"This Week", monthly:"This Month", all:"All Time" }[analyticsPeriod] || analyticsPeriod;
    const deliveredOrders = periodOrders.filter(o => o.status === "delivered");
    const totalRevenue    = deliveredOrders.reduce((s,o) => s+(o.total_amount||0), 0);

    // Build Buyer map
    const buyerMap = {};
    periodOrders.forEach(o => {
      if(!o.buyer_name) return;
      if(!buyerMap[o.buyer_name]) buyerMap[o.buyer_name] = { name:o.buyer_name, city:o.shipping_city||"—", orders:0, spent:0 };
      buyerMap[o.buyer_name].orders++;
      if(o.status==="delivered") buyerMap[o.buyer_name].spent += (o.total_amount||0);
    });
    const topBuyers = Object.values(buyerMap).sort((a,b)=>b.orders-a.orders).slice(0,10);

    // Build Seller map
    const sellerMap = {};
    periodOrders.forEach(o => {
      if(!o.seller_name) return;
      if(!sellerMap[o.seller_name]) sellerMap[o.seller_name] = { name:o.seller_name, orders:0, revenue:0 };
      sellerMap[o.seller_name].orders++;
      if(o.status==="delivered") sellerMap[o.seller_name].revenue += (o.total_amount||0);
    });
    const topSellers = Object.values(sellerMap).sort((a,b)=>b.revenue-a.revenue).slice(0,10);

    const statusCounts = {};
    periodOrders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status]||0)+1; });

    const filename = `ShopTok_Analytics_${periodLabel.replace(/ /g,"_")}_${now.toISOString().slice(0,10)}`;

    if (format === "json") {
      const jsonData = {
        exported_at: now.toISOString(),
        period: periodLabel,
        summary: {
          total_revenue_rs: totalRevenue,
          total_orders: periodOrders.length,
          delivered: deliveredOrders.length,
          cancelled: periodOrders.filter(o=>o.status==="cancelled").length,
          order_status_breakdown: statusCounts,
        },
        top_buyers: topBuyers,
        top_sellers: topSellers,
        monthly_revenue: analytics?.monthly || [],
        revenue_by_category: analytics?.byCategory || [],
        all_orders: periodOrders.map(o=>({
          order_number: o.order_number,
          buyer: o.buyer_name,
          seller: o.seller_name,
          product: o.product_title,
          amount_rs: o.total_amount,
          status: o.status,
          payment_method: o.payment_method,
          city: o.shipping_city,
          date: o.created_at,
        })),
      };
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type:"application/json" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a"); a.href=url; a.download=`${filename}.json`; a.click();
      URL.revokeObjectURL(url);
      addToast("JSON report downloaded ✅", "success");
    } else {
      // CSV — multiple sections separated by blank lines
      const rows = [];
      rows.push(["ShopTok Analytics Report"]);
      rows.push([`Period: ${periodLabel}`]);
      rows.push([`Exported: ${now.toLocaleString()}`]);
      rows.push([]);
      rows.push(["=== SUMMARY ==="]);
      rows.push(["Metric","Value"]);
      rows.push(["Total Revenue (Rs)", totalRevenue]);
      rows.push(["Total Orders", periodOrders.length]);
      rows.push(["Delivered", deliveredOrders.length]);
      rows.push(["Cancelled", periodOrders.filter(o=>o.status==="cancelled").length]);
      Object.entries(statusCounts).forEach(([s,c]) => rows.push([`Status: ${s}`, c]));
      rows.push([]);
      rows.push(["=== TOP BUYERS ==="]);
      rows.push(["Rank","Name","City","Orders","Spent (Rs)"]);
      topBuyers.forEach((b,i) => rows.push([i+1, b.name, b.city, b.orders, b.spent]));
      rows.push([]);
      rows.push(["=== TOP SELLERS ==="]);
      rows.push(["Rank","Shop Name","Orders","Revenue (Rs)"]);
      topSellers.forEach((s,i) => rows.push([i+1, s.name, s.orders, s.revenue]));
      rows.push([]);
      rows.push(["=== ALL ORDERS ==="]);
      rows.push(["Order No","Buyer","Seller","Product","Amount (Rs)","Status","Payment","City","Date"]);
      periodOrders.forEach(o => rows.push([
        o.order_number, o.buyer_name, o.seller_name, o.product_title,
        o.total_amount, o.status, o.payment_method, o.shipping_city,
        new Date(o.created_at).toLocaleString()
      ]));

      const csv  = rows.map(r => r.map(v => `"${String(v??'').replace(/"/g,'""')}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type:"text/csv;charset=utf-8;" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a"); a.href=url; a.download=`${filename}.csv`; a.click();
      URL.revokeObjectURL(url);
      addToast("CSV report downloaded ✅", "success");
    }
  };

  // ── Login ─────────────────────────────────────────────────────────────────────
  const [loginForm, setLF] = useState({ email:"", password:"" });
  const handleLogin = async () => {
    setLoading(true);
    try {
      const data = await api("/auth/admin/login", { method:"POST", body: loginForm });
      localStorage.setItem("shopAdminToken", data.token);
      setAdminInfo(data.admin);
      setAuthed(true);
      addToast(`Welcome back, ${data.admin.name}! 👋`, "success");
    } catch (err) {
      addToast(err.message, "error");
    } finally { setLoading(false); }
  };

  // ── Load notifications ────────────────────────────────────────────────────────
  const loadNotifs = useCallback(async () => {
    try {
      const data = await api("/admin/notifications");
      setNotifs(data.notifications || []);
      setUnreadCount(data.unread || 0);
    } catch {}
  }, []);

  // ── Socket.io live connection ─────────────────────────────────────────────────
  useEffect(() => {
    if (!authed) return;
    // Dynamic socket.io-client import
    import("https://cdn.socket.io/4.6.0/socket.io.esm.min.js").then(({ io }) => {
      const socket = io(WS, { transports:["websocket"] });
      socketRef.current = socket;
      socket.on("connect", () => { socket.emit("admin:join"); });
      socket.on("notification", (notif) => {
        setNotifs(prev => [{ ...notif, id: Date.now(), is_read:false, created_at: new Date().toISOString() }, ...prev.slice(0,49)]);
        setUnreadCount(c => c + 1);
        addToast(`${notif.icon} ${notif.title}`, "info");
        // refresh relevant data
        if (notif.type==="new_seller")  loadSection("sellers");
        if (notif.type==="new_buyer")   loadSection("buyers");
        if (notif.type==="new_order")   loadSection("orders");
        if (notif.type==="new_product") loadSection("products");
      });
      socket.on("stats:update", (stats) => setDash(prev => prev ? { ...prev, ...stats } : prev));
      return () => socket.disconnect();
    }).catch(() => {
      // Socket.io not available in this env, fall back to polling
      const interval = setInterval(() => { loadNotifs(); }, 30000);
      return () => clearInterval(interval);
    });
  }, [authed]);

  // ── Load data ─────────────────────────────────────────────────────────────────
  const loadSection = async (section, filters = {}) => {
    const bf = filters.buyerFilter   ?? buyerFilter;
    const sf = filters.sellerFilter  ?? sellerFilter;
    const pf = filters.productFilter ?? productFilter;
    const of = filters.orderFilter   ?? orderFilter;
    const sr = filters.search        ?? search;
    setDataLoading(true);
    try {
      switch (section) {
        case "dashboard": { const d = await api("/admin/dashboard"); setDash(d); break; }
        case "buyers":    { const d = await api(`/admin/buyers?status=${bf}&search=${encodeURIComponent(sr)}&limit=100`); setBuyers(d.buyers||[]); break; }
        case "sellers":   { const d = await api(`/admin/sellers?status=${sf}&search=${encodeURIComponent(sr)}&limit=100`); setSellers(d.sellers||[]); break; }
        case "products":  { const d = await api(`/admin/products?status=${pf}&search=${encodeURIComponent(sr)}&limit=100`); setProducts(d.products||[]); break; }
        case "orders":    { const d = await api(`/admin/orders?status=${of}&search=${encodeURIComponent(sr)}&limit=100`); setOrders(d.orders||[]); break; }
        case "analytics": { const d = await api("/admin/analytics"); setAnalytics(d); break; }
        case "logs":      { const d = await api("/admin/logs"); setLogs(d.logs||[]); break; }
      }
    } catch (err) {
      console.error("loadSection error:", section, err.message);
      addToast(`Failed to load ${section}: ${err.message}`, "error");
    }
    setDataLoading(false);
  };

  useEffect(() => { if (authed) { loadNotifs(); loadSection("dashboard"); } }, [authed]);
  useEffect(() => { if (authed) loadSection(tab); }, [tab]);
  useEffect(() => { if (authed && tab === "buyers")   loadSection("buyers");   }, [buyerFilter,   search]);
  useEffect(() => { if (authed && tab === "sellers")  loadSection("sellers");  }, [sellerFilter,  search]);
  useEffect(() => { if (authed && tab === "products") loadSection("products"); }, [productFilter, search]);
  useEffect(() => { if (authed && tab === "orders")   loadSection("orders");   }, [orderFilter,   search]);
  useEffect(() => {
    if (authed && tab === "analytics" && orders.length === 0) loadSection("orders");
  }, [tab]);

  // ── Actions ───────────────────────────────────────────────────────────────────
  const updateBuyer = async (id, status, reason) => {
    try {
      const d = await api(`/admin/buyers/${id}/status`, { method:"PATCH", body:{ status, reason } });
      addToast(d.message);
      setBuyers(prev => prev.map(b => b.id===id ? { ...b, status } : b));
      setModal(null);
    } catch (err) { addToast(err.message, "error"); }
  };

  const updateSeller = async (id, status, reason) => {
    try {
      const d = await api(`/admin/sellers/${id}/status`, { method:"PATCH", body:{ status, reason } });
      addToast(d.message);
      setSellers(prev => prev.map(s => s.id===id ? { ...s, status } : s));
      setModal(null);
    } catch (err) { addToast(err.message, "error"); }
  };

  const updateProduct = async (id, status, reason) => {
    try {
      const d = await api(`/admin/products/${id}/status`, { method:"PATCH", body:{ status, reason } });
      addToast(d.message);
      setProducts(prev => prev.map(p => p.id===id ? { ...p, status } : p));
    } catch (err) { addToast(err.message, "error"); }
  };

  const updateOrder = async (id, status) => {
    try {
      const d = await api(`/admin/orders/${id}/status`, { method:"PATCH", body:{ status } });
      addToast(`✅ Order status → ${status}`, "success");
      // Update local state immediately
      setOrders(prev => prev.map(o => o.id===id ? { ...o, status } : o));
      // Also refresh dashboard stats
      setTimeout(() => loadSection("dashboard"), 500);
    } catch (err) {
      addToast(err.message || "Failed to update order", "error");
    }
  };

  const markNotifsRead = async () => {
    await api("/admin/notifications/read-all", { method:"PATCH" });
    setUnreadCount(0);
    setNotifs(prev => prev.map(n => ({ ...n, is_read:true })));
  };

  // ── Logout ────────────────────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem("shopAdminToken");
    setAuthed(false);
    setAdminInfo(null);
  };

  // ── CSS ───────────────────────────────────────────────────────────────────────
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
    *{margin:0;padding:0;box-sizing:border-box;}
    body{background:#080808;color:#fff;font-family:'DM Sans',sans-serif;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
    @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
    input:focus,select:focus{outline:none!important;border-color:#fe2c55!important;}
    ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:#fe2c55;}
    .row:hover{background:rgba(255,255,255,.035)!important;}
    select{background:#1a1a1a;color:#fff;border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:7px 10px;font-family:inherit;font-size:12px;cursor:pointer;}
    table{width:100%;border-collapse:collapse;}
    th{text-align:left;padding:11px 14px;font-size:11px;color:rgba(255,255,255,.35);font-weight:600;text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid rgba(255,255,255,.06);}
    td{padding:12px 14px;font-size:13px;border-bottom:1px solid rgba(255,255,255,.04);vertical-align:middle;}
    .card{background:#111;border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:22px;}
  `;

  // ════════════════════════════════════════════════════════════════════════
  // LOGIN SCREEN
  // ════════════════════════════════════════════════════════════════════════
  if (!authed) return (
    <div style={{ minHeight:"100vh", background:"#080808", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <style>{css}</style>
      <div style={{ width:400, animation:"fadeUp .4s ease" }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ width:60, height:60, background:"linear-gradient(135deg,#fe2c55,#ff6b35)", borderRadius:18, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, margin:"0 auto 16px" }}>⚡</div>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:28, marginBottom:6 }}>ShopTok <span style={{ color:"#fe2c55" }}>Admin</span></h1>
          <p style={{ color:"rgba(255,255,255,.4)", fontSize:13 }}>Authorized access only</p>
        </div>
        <div className="card">
          {[["Admin Email","email","email",loginForm.email],["Password","password","password",loginForm.pass]].map(([lbl,type,key,val])=>(
            <div key={key} style={{ marginBottom:16 }}>
              <label style={{ fontSize:11, color:"#555", display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:".06em" }}>{lbl}</label>
              <input type={type} value={loginForm[key]||""}
                onChange={e=>setLF(f=>({...f,[key]:e.target.value}))}
                onKeyDown={e=>e.key==="Enter"&&handleLogin()}
                style={{ width:"100%", background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.1)", borderRadius:10, padding:"11px 14px", color:"#fff", fontSize:13, fontFamily:"inherit" }} />
            </div>
          ))}
          <button onClick={handleLogin} disabled={loading}
            style={{ width:"100%", background: loading?"#333":"linear-gradient(135deg,#fe2c55,#ff6b35)", border:"none", color:"#fff", padding:"13px", borderRadius:12, fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, cursor: loading?"wait":"pointer", marginTop:4 }}>
            {loading ? "Signing in…" : "Sign In →"}
          </button>
          <p style={{ textAlign:"center", fontSize:11, color:"rgba(255,255,255,.25)", marginTop:14 }}>Default: admin@shoptok.pk / Admin@ShopTok2024!</p>
        </div>
      </div>
      {toast && <Toast {...toast} onClose={()=>setToast(null)} />}
    </div>
  );

  // ── Sidebar nav items ─────────────────────────────────────────────────────────
  const NAV = [
    { key:"dashboard", icon:"📊", label:"Dashboard" },
    { key:"buyers",    icon:"👥", label:"Buyers",   badge: dash ? (dash.users?.pending||0) : 0 },
    { key:"sellers",   icon:"🏪", label:"Sellers",  badge: dash ? (dash.pendingSellers||0) : 0 },
    { key:"products",  icon:"📦", label:"Products", badge: dash ? (dash.pendingProducts||0) : 0 },
    { key:"orders",    icon:"🛒", label:"Orders",   badge: dash ? (dash.orders?.pending||0) : 0 },
    { key:"analytics", icon:"📈", label:"Analytics" },
    { key:"logs",      icon:"📋", label:"Activity Log" },
    { key:"settings",  icon:"⚙️", label:"Settings" },
  ];

  const totalBadges = NAV.reduce((a, n) => a + (n.badge||0), 0);

  // ════════════════════════════════════════════════════════════════════════
  // MAIN LAYOUT
  // ════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ minHeight:"100vh", display:"flex", background:adminDark?"#080808":"#f0f0f5", color:adminDark?"#fff":"#111" }}>
      <style>{css + (adminDark ? `
        .card{background:#111!important;border-color:rgba(255,255,255,.07)!important;}
        input,select,textarea{background:rgba(255,255,255,.05)!important;color:#fff!important;border-color:rgba(255,255,255,.1)!important;}
      ` : `
        .card{background:#fff!important;border-color:rgba(0,0,0,.08)!important;color:#111!important;}
        input,select,textarea{background:#fff!important;color:#111!important;border-color:#ddd!important;}
        aside{background:#fff!important;border-color:rgba(0,0,0,.08)!important;}
        aside p,aside span{color:#333!important;}
        header{background:rgba(255,255,255,.97)!important;border-color:rgba(0,0,0,.08)!important;}
        header h2{color:#111!important;}
        [style*="background:#111"]{background:#fff!important;}
        [style*="background:#0d0d0d"]{background:#f5f5f5!important;}
        [style*="background:#141414"]{background:#fff!important;}
        [style*="background:rgba(255,255,255,.06)"]{background:rgba(0,0,0,.05)!important;}
        [style*="background:rgba(255,255,255,.07)"]{background:rgba(0,0,0,.05)!important;}
        [style*="color:rgba(255,255,255,.4)"]{color:rgba(0,0,0,.5)!important;}
        [style*="color:rgba(255,255,255,.45)"]{color:rgba(0,0,0,.55)!important;}
        [style*="color:rgba(255,255,255,.3)"]{color:rgba(0,0,0,.4)!important;}
        [style*="color:rgba(255,255,255,.25)"]{color:rgba(0,0,0,.35)!important;}
        [style*="color:rgba(255,255,255,.5)"]{color:rgba(0,0,0,.55)!important;}
        [style*="color:rgba(255,255,255,.85)"]{color:#111!important;}
        [style*="border:1px solid rgba(255,255,255,.07)"]{border-color:rgba(0,0,0,.08)!important;}
        [style*="border:1px solid rgba(255,255,255,.1)"]{border-color:rgba(0,0,0,.1)!important;}
        [style*="borderBottom:\"1px solid rgba(255,255,255,.07)\""]{border-color:rgba(0,0,0,.08)!important;}
        [style*="color:#fff"]:not(button[style*="background:#fe2c55"]):not(button[style*="background:linear-gradient"]):not(span[style*="background:#fe2c55"]){color:#111!important;}
        [style*="color:#888"]{color:#555!important;}
        [style*="color:#555"]{color:#444!important;}
      `)}</style>

      {/* ── SIDEBAR ── */}
      <aside style={{ width: sideOpen?224:60, flexShrink:0, background:"#0d0d0d", borderRight:"1px solid rgba(255,255,255,.07)", position:"sticky", top:0, height:"100vh", display:"flex", flexDirection:"column", transition:"width .2s ease", overflowY:"auto", overflowX:"hidden" }}>
        {/* Logo */}
        <div style={{ padding:"18px 12px", borderBottom:"1px solid rgba(255,255,255,.07)", display:"flex", alignItems:"center", gap:10 }}>
          <div onClick={()=>setSideOpen(o=>!o)} style={{ width:36, height:36, background:"linear-gradient(135deg,#fe2c55,#ff6b35)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, cursor:"pointer", flexShrink:0 }}>⚡</div>
          {sideOpen && <div><p style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:14 }}>ShopTok<span style={{ color:"#fe2c55" }}>.</span></p><p style={{ fontSize:10, color:"rgba(255,255,255,.3)" }}>Admin Panel</p></div>}
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:"8px 8px" }}>
          {NAV.map(item => (
            <button key={item.key} onClick={()=>setTab(item.key)}
              style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"10px 10px", borderRadius:10, border:"none", cursor:"pointer", marginBottom:2, position:"relative",
                background: tab===item.key?"rgba(254,44,85,.12)":"transparent",
                color: tab===item.key?"#fe2c55":"rgba(255,255,255,.5)", textAlign:"left" }}>
              <span style={{ fontSize:18, flexShrink:0 }}>{item.icon}</span>
              {sideOpen && <>
                <span style={{ fontSize:13, fontWeight: tab===item.key?600:400, flex:1 }}>{item.label}</span>
                {item.badge>0 && <NotifDot count={item.badge} />}
              </>}
              {!sideOpen && item.badge>0 && <span style={{ position:"absolute", top:7, right:7, width:8, height:8, borderRadius:"50%", background:"#fe2c55" }} />}
            </button>
          ))}
        </nav>

        {/* Admin info */}
        <div style={{ padding:"12px 10px", borderTop:"1px solid rgba(255,255,255,.07)", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:"50%", background:"rgba(254,44,85,.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>👤</div>
          {sideOpen && <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:12, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{adminInfo?.name||"Admin"}</p>
            <p style={{ fontSize:10, color:"rgba(255,255,255,.3)" }}>{adminInfo?.role}</p>
          </div>}
          {sideOpen && <button onClick={logout} title="Logout" style={{ background:"none", border:"none", color:"rgba(255,255,255,.3)", cursor:"pointer", fontSize:16 }}>🚪</button>}
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column" }}>
        {/* Top bar */}
        <header style={{ position:"sticky", top:0, zIndex:100, background:"rgba(8,8,8,.97)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(255,255,255,.07)", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 28px" }}>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:17 }}>
            {{ dashboard:"Dashboard",buyers:"Buyers",sellers:"Sellers",products:"Products",orders:"Orders",analytics:"Analytics",logs:"Activity Log",settings:"Settings" }[tab]}
          </h2>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            {/* Live indicator */}
            <div style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(52,211,153,.1)", border:"1px solid rgba(52,211,153,.2)", borderRadius:100, padding:"5px 12px" }}>
              <span style={{ width:7, height:7, borderRadius:"50%", background:"#34d399", animation:"pulse 2s infinite" }} />
              <span style={{ fontSize:11, color:"#34d399", fontWeight:600 }}>Live</span>
            </div>
            {/* Notifications */}
            <div style={{ position:"relative" }}>
              <button onClick={()=>setAdminDark(d=>{ localStorage.setItem("adminTheme",d?"light":"dark"); return !d; })} title="Toggle Theme" style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"50%",width:38,height:38,cursor:"pointer",fontSize:16,color:adminDark?"#fff":"#333",display:"flex",alignItems:"center",justifyContent:"center"}}>
                {adminDark?"☀️":"🌙"}
              </button>
              <button onClick={()=>{ setShowNotifs(v=>!v); if(unreadCount>0) markNotifsRead(); }}
                style={{ width:38, height:38, borderRadius:"50%", background:"rgba(255,255,255,.06)", border: unreadCount>0?"1px solid rgba(254,44,85,.4)":"1px solid transparent", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", position:"relative" }}>
                🔔
                {unreadCount > 0 && <span style={{ position:"absolute", top:4, right:4, width:8, height:8, borderRadius:"50%", background:"#fe2c55" }} />}
              </button>
              {showNotifs && (
                <div style={{ position:"absolute", right:0, top:48, width:340, background:"#141414", border:"1px solid rgba(255,255,255,.1)", borderRadius:14, zIndex:200, maxHeight:480, overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,.6)" }}>
                  <div style={{ padding:"14px 16px", borderBottom:"1px solid rgba(255,255,255,.07)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14 }}>Notifications</p>
                    <button onClick={()=>setShowNotifs(false)} style={{ background:"none", border:"none", color:"#555", cursor:"pointer", fontSize:18 }}>×</button>
                  </div>
                  {notifs.length === 0 && <p style={{ padding:24, textAlign:"center", color:"rgba(255,255,255,.3)", fontSize:13 }}>No notifications</p>}
                  {notifs.map((n,i) => (
                    <div key={i} style={{ padding:"12px 16px", borderBottom:"1px solid rgba(255,255,255,.04)", background: n.is_read?"transparent":"rgba(254,44,85,.04)", display:"flex", gap:12, alignItems:"flex-start" }}>
                      <span style={{ fontSize:20, flexShrink:0 }}>{n.icon||"🔔"}</span>
                      <div>
                        <p style={{ fontSize:13, fontWeight:600, marginBottom:2 }}>{n.title}</p>
                        {n.body && <p style={{ fontSize:12, color:"rgba(255,255,255,.45)" }}>{n.body}</p>}
                        <p style={{ fontSize:11, color:"rgba(255,255,255,.25)", marginTop:3 }}>{new Date(n.created_at).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={()=>loadSection(tab)} title="Refresh"
              style={{ width:38, height:38, borderRadius:"50%", background:"rgba(255,255,255,.06)", border:"none", cursor:"pointer", fontSize:16 }}>↻</button>
          </div>
        </header>

        <div style={{ flex:1, padding:28, overflowY:"auto" }}>

          {/* ════════════════════════════════════════════
              DASHBOARD
          ════════════════════════════════════════════ */}
          {tab==="dashboard" && (
            <div style={{ animation:"fadeUp .35s ease" }}>
              {/* Stats grid */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:16, marginBottom:24 }}>
                <Stat icon="💰" label="Total Revenue" value={`Rs ${((dash?.revenue?.total||0)/1000).toFixed(0)}K`} sub={`Rs ${((dash?.revenue?.this_month||0)/1000).toFixed(0)}K this month`} color="#fe2c55" trend={18} />
                <Stat icon="🛒" label="Total Orders"  value={dash?.orders?.total||0}   sub={`${dash?.orders?.pending||0} pending`}  color="#25f4ee" trend={12} />
                <Stat icon="👥" label="Total Buyers"  value={dash?.users?.total||0}    sub={`${dash?.users?.active||0} active`}     color="#a78bfa" trend={8} />
                <Stat icon="🏪" label="Active Sellers" value={dash?.sellers?.active||0} sub={`${dash?.sellers?.pending||0} pending`} color="#fbbf24" />
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:20, marginBottom:20 }}>
                {/* Revenue chart */}
                <div className="card">
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                    <div>
                      <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15 }}>Revenue — Last 6 Months</h3>
                      <p style={{ fontSize:12, color:"rgba(255,255,255,.35)", marginTop:2 }}>Delivered orders only</p>
                    </div>
                    <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, color:"#fe2c55" }}>
                      Rs {((dash?.revenue?.today||0)/1000).toFixed(0)}K today
                    </span>
                  </div>
                  {dash?.monthlyRevenue?.length > 0
                    ? <BarChart data={dash.monthlyRevenue} keyX="month" keyY="revenue" />
                    : <div style={{ height:80, display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,.2)", fontSize:13 }}>No data yet</div>
                  }
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginTop:20 }}>
                    {[["This Week", `Rs ${((dash?.revenue?.this_week||0)/1000).toFixed(0)}K`, "#25f4ee"],
                      ["This Month",`Rs ${((dash?.revenue?.this_month||0)/1000).toFixed(0)}K`, "#a78bfa"],
                      ["All Time",  `Rs ${((dash?.revenue?.total||0)/1000).toFixed(0)}K`,      "#fe2c55"]
                    ].map(([l,v,c])=>(
                      <div key={l} style={{ background:"rgba(255,255,255,.04)", borderRadius:10, padding:"10px 14px" }}>
                        <p style={{ fontSize:11, color:"rgba(255,255,255,.4)", marginBottom:4 }}>{l}</p>
                        <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, color:c }}>{v}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick actions */}
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  <div className="card" style={{ flex:1 }}>
                    <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, marginBottom:16 }}>Quick Actions</h3>
                    {[
                      { label:"Review Pending Sellers",  count:dash?.pendingSellers||0,  color:"#fbbf24", goto:"sellers" },
                      { label:"Approve Products",        count:dash?.pendingProducts||0, color:"#25f4ee", goto:"products" },
                      { label:"Pending Buyers",          count:dash?.users?.pending||0,  color:"#a78bfa", goto:"buyers" },
                      { label:"Pending Orders",          count:dash?.orders?.pending||0, color:"#fe2c55", goto:"orders" },
                    ].map(a=>(
                      <button key={a.label} onClick={()=>setTab(a.goto)}
                        style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:10, border:"none", cursor:"pointer", background:"rgba(255,255,255,.04)", marginBottom:7, textAlign:"left" }}
                        onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.08)"}
                        onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.04)"}>
                        <span style={{ flex:1, fontSize:13, color:"rgba(255,255,255,.7)" }}>{a.label}</span>
                        {a.count > 0 && <span style={{ background:`${a.color}20`, color:a.color, fontSize:11, fontWeight:700, padding:"2px 9px", borderRadius:100 }}>{a.count}</span>}
                      </button>
                    ))}
                  </div>
                  {/* Order status bars */}
                  <div className="card">
                    <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, marginBottom:14 }}>Order Breakdown</h3>
                    {(dash?.orderStatus||[]).map(({ status, count }) => {
                      const total = dash.orders.total || 1;
                      const c = { delivered:"#34d399",shipped:"#25f4ee",processing:"#fbbf24",cancelled:"#fe2c55",pending:"#a78bfa",confirmed:"#4ade80" }[status]||"#666";
                      return (
                        <div key={status} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                          <span style={{ fontSize:12, color:c, minWidth:80, textTransform:"capitalize" }}>{status}</span>
                          <div style={{ flex:1, height:6, background:"rgba(255,255,255,.06)", borderRadius:100 }}>
                            <div style={{ height:"100%", width:`${(count/total)*100}%`, background:c, borderRadius:100, transition:"width .4s" }} />
                          </div>
                          <span style={{ fontSize:12, color:"rgba(255,255,255,.4)", minWidth:24, textAlign:"right" }}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Recent orders */}
              <div className="card">
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
                  <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15 }}>Recent Orders</h3>
                  <button onClick={()=>setTab("orders")} style={{ fontSize:12, color:"#fe2c55", background:"none", border:"none", cursor:"pointer" }}>View all →</button>
                </div>
                <table>
                  <thead><tr>{["Order","Buyer","Product","Amount","Status","Date"].map(h=><th key={h}>{h}</th>)}</tr></thead>
                  <tbody>
                    {(dash?.recentOrders||[]).map(o=>(
                      <tr key={o.id} className="row">
                        <td style={{ color:"#25f4ee", fontWeight:600 }}>{o.order_number}</td>
                        <td>{o.buyer_name}</td>
                        <td style={{ color:"rgba(255,255,255,.6)" }}>{o.product_emoji} {o.product_title}</td>
                        <td style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:"#fe2c55" }}>Rs {o.total_amount?.toLocaleString()}</td>
                        <td><Badge status={o.status} /></td>
                        <td style={{ color:"rgba(255,255,255,.4)" }}>{new Date(o.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════
              BUYERS
          ════════════════════════════════════════════ */}
          {tab==="buyers" && (
            <div style={{ animation:"fadeUp .3s ease" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18, flexWrap:"wrap", gap:10 }}>
                <FilterTabs tabs={["all","active","pending","suspended"]} active={buyerFilter} onChange={setBuyerFilter}
                  counts={{ pending: dash?.users?.pending||0, suspended: dash?.users?.suspended||0 }} />
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <SearchBar value={search} onChange={setSearch} placeholder="Search buyers…" />
                  <button onClick={()=>loadSection("buyers")} style={{ width:36, height:36, borderRadius:"50%", background:"rgba(255,255,255,.06)", border:"none", cursor:"pointer", fontSize:16, color:"#fff" }}>↻</button>
                </div>
              </div>
              <div className="card" style={{ padding:0 }}>
                <table>
                  <thead><tr>{["Buyer","Contact","City","Orders","Spent","Status","Actions"].map(h=><th key={h}>{h}</th>)}</tr></thead>
                  <tbody>
                    {buyers.map(b=>(
                      <tr key={b.id} className="row">
                        <td>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <div style={{ width:34, height:34, borderRadius:"50%", background:"rgba(254,44,85,.12)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{b.avatar||"👤"}</div>
                            <div>
                              <p style={{ fontWeight:600 }}>{b.name}</p>
                              <p style={{ fontSize:11, color:"rgba(255,255,255,.35)" }}>{b.id.slice(0,8)}… · {new Date(b.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </td>
                        <td><p>{b.email}</p><p style={{ fontSize:11, color:"rgba(255,255,255,.4)" }}>{b.phone}</p></td>
                        <td style={{ color:"rgba(255,255,255,.6)" }}>{b.city}</td>
                        <td style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:"#25f4ee" }}>{b.total_orders||0}</td>
                        <td style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:"#fe2c55" }}>Rs {(b.total_spent||0).toLocaleString()}</td>
                        <td><Badge status={b.status} /></td>
                        <td>
                          <div style={{ display:"flex", gap:6 }}>
                            <Btn small onClick={()=>setModal({ type:"buyer", data:b })}>View</Btn>
                            {b.status!=="active"    && <Btn small color="green" onClick={()=>updateBuyer(b.id,"active")}>Approve</Btn>}
                            {b.status!=="suspended" && <Btn small color="red"   onClick={()=>updateBuyer(b.id,"suspended")}>Suspend</Btn>}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {buyers.length===0 && <tr><td colSpan={8} style={{ textAlign:"center", padding:40, color:"rgba(255,255,255,.3)" }}>{dataLoading ? "⏳ Loading buyers..." : "No buyers found"}</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════
              SELLERS
          ════════════════════════════════════════════ */}
          {tab==="sellers" && (
            <div style={{ animation:"fadeUp .3s ease" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18, flexWrap:"wrap", gap:10 }}>
                <FilterTabs tabs={["all","active","pending","suspended","rejected"]} active={sellerFilter} onChange={setSellerFilter}
                  counts={{ pending: dash?.pendingSellers||0 }} />
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <SearchBar value={search} onChange={setSearch} placeholder="Search sellers…" />
                  <button onClick={()=>loadSection("sellers")} style={{ width:36, height:36, borderRadius:"50%", background:"rgba(255,255,255,.06)", border:"none", cursor:"pointer", fontSize:16, color:"#fff" }}>↻</button>
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {sellers.map(s=>(
                  <div key={s.id} style={{ background:"#111", border:`1px solid ${s.status==="pending"?"rgba(251,191,36,.3)":"rgba(255,255,255,.07)"}`, borderRadius:16, padding:"18px 20px", display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
                    <div style={{ width:52, height:52, borderRadius:14, background:"rgba(254,44,85,.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0, overflow:"hidden" }}>
                      {s.shop_logo ? <img src={s.shop_logo} alt="logo" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : "🏪"}
                    </div>
                    <div style={{ flex:1, minWidth:180 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                        <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15 }}>{s.shop_name}</p>
                        <Badge status={s.status} />
                        {s.category && <span style={{ fontSize:11, background:"rgba(255,255,255,.06)", color:"rgba(255,255,255,.5)", borderRadius:100, padding:"2px 9px" }}>{s.category}</span>}
                      </div>
                      <p style={{ fontSize:12, color:"rgba(255,255,255,.45)" }}>Owner: {s.owner_name} · {s.email}</p>
                      <p style={{ fontSize:11, color:"rgba(255,255,255,.3)", marginTop:2 }}>CNIC: {s.cnic||"—"} · {s.city} · Joined {new Date(s.created_at).toLocaleDateString()}</p>
                    </div>
                    <div style={{ display:"flex", gap:20 }}>
                      {[["Products",s.product_count||s.total_products,"#25f4ee"],["Orders",s.order_count||s.total_orders,"#a78bfa"],["Revenue",`Rs ${((s.revenue||s.total_revenue||0)/1000).toFixed(0)}K`,"#fe2c55"]].map(([l,v,c])=>(
                        <div key={l} style={{ textAlign:"center" }}>
                          <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, color:c }}>{v}</p>
                          <p style={{ fontSize:11, color:"rgba(255,255,255,.35)" }}>{l}</p>
                        </div>
                      ))}
                    </div>
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                      <Btn onClick={()=>setModal({ type:"seller", data:s })} outline>View Details</Btn>
                      {s.status==="pending"  && <Btn color="green" onClick={()=>updateSeller(s.id,"active")}>✓ Approve</Btn>}
                      {s.status==="pending"  && <Btn color="red"   onClick={()=>setModal({ type:"rejectSeller", data:s })}>✕ Reject</Btn>}
                      {s.status==="active"   && <Btn color="red"   onClick={()=>updateSeller(s.id,"suspended")}>Suspend</Btn>}
                      {s.status==="suspended"&& <Btn color="green" onClick={()=>updateSeller(s.id,"active")}>Reinstate</Btn>}
                      {s.status==="rejected" && <Btn color="green" onClick={()=>updateSeller(s.id,"active")}>Approve</Btn>}
                    </div>
                  </div>
                ))}
                {sellers.length===0 && <div style={{ textAlign:"center", padding:60, color:"rgba(255,255,255,.3)" }}>{dataLoading ? "⏳ Loading sellers..." : "No sellers found"}</div>}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════
              PRODUCTS
          ════════════════════════════════════════════ */}
          {tab==="products" && (
            <div style={{ animation:"fadeUp .3s ease" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18, flexWrap:"wrap", gap:10 }}>
                <FilterTabs tabs={["all","live","pending","rejected","paused"]} active={productFilter} onChange={setProductFilter}
                  counts={{ pending: dash?.pendingProducts||0 }} />
                <SearchBar value={search} onChange={setSearch} placeholder="Search products…" />
              </div>
              <div className="card" style={{ padding:0 }}>
                <table>
                  <thead><tr>{["Product","Seller","Category","Price","Stock","Sold","Status","Actions"].map(h=><th key={h}>{h}</th>)}</tr></thead>
                  <tbody>
                    {products.map(p=>(
                      <tr key={p.id} className="row">
                        <td>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <div style={{ width:34, height:34, borderRadius:9, background:"rgba(255,255,255,.06)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{p.emoji}</div>
                            <p style={{ maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.title}</p>
                          </div>
                        </td>
                        <td style={{ color:"rgba(255,255,255,.55)" }}>{p.seller_name}</td>
                        <td><span style={{ background:"rgba(255,255,255,.06)", borderRadius:100, padding:"3px 9px", fontSize:11, color:"rgba(255,255,255,.5)" }}>{p.category}</span></td>
                        <td style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:"#fe2c55" }}>Rs {p.price?.toLocaleString()}</td>
                        <td style={{ color: p.stock<20?"#fbbf24":"rgba(255,255,255,.6)" }}>{p.stock}</td>
                        <td style={{ fontFamily:"'Syne',sans-serif", fontWeight:600, color:"#25f4ee" }}>{(p.sold||0).toLocaleString()}</td>
                        <td><Badge status={p.status} /></td>
                        <td>
                          <div style={{ display:"flex", gap:6 }}>
                            {p.status==="pending"  && <Btn small color="green" onClick={()=>updateProduct(p.id,"live")}>Approve</Btn>}
                            {p.status==="pending"  && <Btn small color="red"   onClick={()=>setModal({ type:"rejectProduct", data:p })}>Reject</Btn>}
                            {p.status==="live"     && <Btn small color="red"   onClick={()=>updateProduct(p.id,"paused")}>Pause</Btn>}
                            {p.status==="paused"   && <Btn small color="green" onClick={()=>updateProduct(p.id,"live")}>Restore</Btn>}
                            {p.status==="rejected" && <Btn small color="green" onClick={()=>updateProduct(p.id,"live")}>Approve</Btn>}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {products.length===0 && <tr><td colSpan={8} style={{ textAlign:"center", padding:40, color:"rgba(255,255,255,.3)" }}>No products found</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════
              ORDERS
          ════════════════════════════════════════════ */}
          {tab==="orders" && (
            <div style={{ animation:"fadeUp .3s ease" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18, flexWrap:"wrap", gap:10 }}>
                <FilterTabs tabs={["all","pending","confirmed","processing","shipped","delivered","cancelled"]} active={orderFilter} onChange={setOrderFilter}
                  counts={{ pending: dash?.orders?.pending||0 }} />
                <SearchBar value={search} onChange={setSearch} placeholder="Search orders…" />
              </div>
              <div style={{ marginBottom:12, display:"flex", gap:12 }}>
                {[
                  ["Total",orders.length,"#25f4ee"],
                  ["Revenue","Rs "+(orders.filter(o=>o.status==="delivered").reduce((s,o)=>s+(o.total_amount||0),0)/1000).toFixed(0)+"K","#34d399"],
                  ["Pending",orders.filter(o=>o.status==="pending").length,"#fbbf24"],
                  ["Delivered",orders.filter(o=>o.status==="delivered").length,"#34d399"],
                  ["Cancelled",orders.filter(o=>o.status==="cancelled").length,"#fe2c55"],
                ].map(([l,v,c])=>(
                  <div key={l} style={{ background:"#111", border:`1px solid ${c}20`, borderRadius:10, padding:"10px 16px", textAlign:"center", flex:1 }}>
                    <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, color:c }}>{v}</p>
                    <p style={{ fontSize:11, color:"rgba(255,255,255,.4)", marginTop:2 }}>{l}</p>
                  </div>
                ))}
              </div>
              <div className="card" style={{ padding:0 }}>
                <table>
                  <thead><tr>{["Order","Buyer","Product","Amount","Payment","Status","Date","Actions"].map(h=><th key={h}>{h}</th>)}</tr></thead>
                  <tbody>
                    {orders.map(o=>(
                      <tr key={o.id} className="row">
                        <td>
                          <p style={{ color:"#25f4ee", fontWeight:600 }}>{o.order_number}</p>
                          <p style={{ fontSize:11, color:"rgba(255,255,255,.3)" }}>{o.shipping_city}</p>
                        </td>
                        <td>
                          <p style={{ fontWeight:500 }}>{o.buyer_name}</p>
                          <p style={{ fontSize:11, color:"rgba(255,255,255,.4)" }}>{o.buyer_phone}</p>
                        </td>
                        <td style={{ maxWidth:160 }}>
                          <p style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", color:"rgba(255,255,255,.8)" }}>{o.product_emoji} {o.product_title}</p>
                          <p style={{ fontSize:11, color:"rgba(255,255,255,.35)" }}>🏪 {o.seller_name}</p>
                        </td>
                        <td>
                          <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:"#fe2c55" }}>Rs {o.total_amount?.toLocaleString()}</p>
                          <p style={{ fontSize:11, color:"rgba(255,255,255,.35)" }}>Ship: {o.shipping_fee===0||o.shipping_fee==="0"?"Free":"Rs "+o.shipping_fee}</p>
                        </td>
                        <td><span style={{ background:"rgba(255,255,255,.06)", borderRadius:100, padding:"3px 9px", fontSize:11, textTransform:"uppercase" }}>{o.payment_method}</span></td>
                        <td><Badge status={o.status} /></td>
                        <td style={{ color:"rgba(255,255,255,.35)", fontSize:12, whiteSpace:"nowrap" }}>{new Date(o.created_at).toLocaleDateString("en-PK",{day:"2-digit",month:"short",year:"numeric"})}</td>
                        <td>
                          {(() => {
                            const statusColors = {
                              pending:"#fbbf24", confirmed:"#a78bfa", processing:"#25f4ee",
                              shipped:"#60a5fa", delivered:"#34d399", cancelled:"#fe2c55", refunded:"#f97316"
                            };
                            const c = statusColors[o.status] || "#fff";
                            return (
                              <select
                                value={o.status}
                                onChange={e=>updateOrder(o.id, e.target.value)}
                                style={{ background:"#1a1a1a", border:`1px solid ${c}50`, borderRadius:8,
                                  padding:"6px 10px", color:c, fontSize:12, fontFamily:"inherit",
                                  cursor:"pointer", minWidth:130, fontWeight:600,
                                  outline:"none", appearance:"auto" }}>
                                {["pending","confirmed","processing","shipped","delivered","cancelled","refunded"].map(s=>(
                                  <option key={s} value={s} style={{ color: statusColors[s]||"#fff", background:"#1a1a1a" }}>
                                    {s.charAt(0).toUpperCase()+s.slice(1)}
                                  </option>
                                ))}
                              </select>
                            );
                          })()}
                        </td>
                      </tr>
                    ))}
                    {orders.length===0 && <tr><td colSpan={7} style={{ textAlign:"center", padding:40, color:"rgba(255,255,255,.3)" }}>{dataLoading?"⏳ Loading orders...":"No orders found"}</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════
              ANALYTICS
          ════════════════════════════════════════════ */}
          {tab==="analytics" && (
            <div style={{ animation:"fadeUp .3s ease" }}>
              {(()=>{
                const period = analyticsPeriod;
                const setPeriod = setAnalyticsPeriod;
                const now = new Date();
                const dayStart  = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const weekStart = new Date(now - 7*86400000);
                const monStart  = new Date(now.getFullYear(), now.getMonth(), 1);

                const periodOrders = orders.filter(o=>{
                  const d = new Date(o.created_at);
                  if(period==="daily")   return d >= dayStart;
                  if(period==="weekly")  return d >= weekStart;
                  if(period==="monthly") return d >= monStart;
                  return true;
                });

                const deliveredP  = periodOrders.filter(o=>o.status==="delivered");
                const periodRev   = deliveredP.reduce((s,o)=>s+(o.total_amount||0),0);
                const periodOrdsN = periodOrders.length;

                // Top Buyers from orders
                const buyerMap = {};
                orders.forEach(o=>{
                  if(!o.buyer_name) return;
                  const d = new Date(o.created_at);
                  const inPeriod = period==="daily"?d>=dayStart:period==="weekly"?d>=weekStart:period==="monthly"?d>=monStart:true;
                  if(!inPeriod) return;
                  if(!buyerMap[o.buyer_name]) buyerMap[o.buyer_name]={name:o.buyer_name,city:o.shipping_city,orders:0,spent:0};
                  buyerMap[o.buyer_name].orders++;
                  if(o.status==="delivered") buyerMap[o.buyer_name].spent += (o.total_amount||0);
                });
                const topBuyers = Object.values(buyerMap).sort((a,b)=>b.orders-a.orders).slice(0,8);

                // Top Sellers from orders
                const sellerMap = {};
                orders.forEach(o=>{
                  if(!o.seller_name) return;
                  const d = new Date(o.created_at);
                  const inPeriod = period==="daily"?d>=dayStart:period==="weekly"?d>=weekStart:period==="monthly"?d>=monStart:true;
                  if(!inPeriod) return;
                  if(!sellerMap[o.seller_name]) sellerMap[o.seller_name]={name:o.seller_name,orders:0,revenue:0};
                  sellerMap[o.seller_name].orders++;
                  if(o.status==="delivered") sellerMap[o.seller_name].revenue += (o.total_amount||0);
                });
                const topSellers = Object.values(sellerMap).sort((a,b)=>b.revenue-a.revenue).slice(0,8);

                return(<>
                {/* Period tabs + Download */}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:10 }}>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    {[["daily","Today"],["weekly","This Week"],["monthly","This Month"],["all","All Time"]].map(([k,l])=>(
                      <button key={k} onClick={()=>setPeriod(k)}
                        style={{ padding:"8px 20px", borderRadius:100, border:"none", cursor:"pointer", fontSize:13, fontWeight:600,
                          background:period===k?"#fe2c55":"rgba(255,255,255,.07)",
                          color:period===k?"#fff":"rgba(255,255,255,.5)" }}>{l}</button>
                    ))}
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={()=>downloadAnalytics("csv")}
                      style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 16px", borderRadius:10, border:"1px solid rgba(52,211,153,.3)", cursor:"pointer",
                        background:"rgba(52,211,153,.08)", color:"#34d399", fontSize:12, fontWeight:700, fontFamily:"inherit" }}>
                      ⬇️ CSV Download
                    </button>
                    <button onClick={()=>downloadAnalytics("json")}
                      style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 16px", borderRadius:10, border:"1px solid rgba(251,191,36,.3)", cursor:"pointer",
                        background:"rgba(251,191,36,.08)", color:"#fbbf24", fontSize:12, fontWeight:700, fontFamily:"inherit" }}>
                      ⬇️ JSON Download
                    </button>
                  </div>
                </div>

                {/* Summary stats */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
                  <Stat icon="💰" label="Revenue" value={`Rs ${(periodRev/1000).toFixed(0)}K`} sub="delivered orders" color="#fe2c55"/>
                  <Stat icon="🛒" label="Orders"  value={periodOrdsN} sub="all statuses" color="#25f4ee"/>
                  <Stat icon="✅" label="Delivered" value={deliveredP.length} sub="completed" color="#34d399"/>
                  <Stat icon="❌" label="Cancelled" value={periodOrders.filter(o=>o.status==="cancelled").length} sub="cancelled" color="#ef4444"/>
                </div>

                {/* Top Buyers + Top Sellers */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>

                  {/* Top Buyers */}
                  <div className="card">
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
                      <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15 }}>👥 Top Buyers</h3>
                      <span style={{ fontSize:11, color:"rgba(255,255,255,.35)" }}>by order count</span>
                    </div>
                    {topBuyers.length===0
                      ?<p style={{ color:"rgba(255,255,255,.3)", fontSize:13, textAlign:"center", padding:24 }}>No data for this period</p>
                      :topBuyers.map((b,i)=>(
                        <div key={i} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12, padding:"10px 12px", background:"rgba(255,255,255,.03)", borderRadius:10 }}>
                          <div style={{ width:28, height:28, borderRadius:"50%", background:i===0?"rgba(251,191,36,.2)":i===1?"rgba(255,255,255,.08)":"rgba(255,255,255,.04)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                            <span style={{ fontSize:12, fontWeight:700, color:i===0?"#fbbf24":i===1?"#aaa":"#555" }}>{i+1}</span>
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <p style={{ fontSize:13, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{b.name}</p>
                            <p style={{ fontSize:11, color:"rgba(255,255,255,.35)" }}>{b.city||"—"} · {b.orders} orders</p>
                          </div>
                          <div style={{ textAlign:"right", flexShrink:0 }}>
                            <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, color:"#25f4ee" }}>{b.orders}</p>
                            <p style={{ fontSize:10, color:"rgba(255,255,255,.3)" }}>Rs {(b.spent/1000).toFixed(0)}K</p>
                          </div>
                        </div>
                      ))
                    }
                  </div>

                  {/* Top Sellers */}
                  <div className="card">
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
                      <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15 }}>🏪 Top Sellers</h3>
                      <span style={{ fontSize:11, color:"rgba(255,255,255,.35)" }}>by revenue</span>
                    </div>
                    {topSellers.length===0
                      ?<p style={{ color:"rgba(255,255,255,.3)", fontSize:13, textAlign:"center", padding:24 }}>No data for this period</p>
                      :topSellers.map((s,i)=>(
                        <div key={i} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12, padding:"10px 12px", background:"rgba(255,255,255,.03)", borderRadius:10 }}>
                          <div style={{ width:28, height:28, borderRadius:"50%", background:i===0?"rgba(251,191,36,.2)":i===1?"rgba(255,255,255,.08)":"rgba(255,255,255,.04)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                            <span style={{ fontSize:12, fontWeight:700, color:i===0?"#fbbf24":i===1?"#aaa":"#555" }}>{i+1}</span>
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <p style={{ fontSize:13, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.name}</p>
                            <p style={{ fontSize:11, color:"rgba(255,255,255,.35)" }}>{s.orders} orders</p>
                          </div>
                          <div style={{ textAlign:"right", flexShrink:0 }}>
                            <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, color:"#fe2c55" }}>Rs {(s.revenue/1000).toFixed(0)}K</p>
                            <p style={{ fontSize:10, color:"rgba(255,255,255,.3)" }}>revenue</p>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>

                {/* Monthly Revenue Chart from backend */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
                  <div className="card">
                    <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, marginBottom:18 }}>📈 Monthly Revenue</h3>
                    {analytics?.monthly?.length > 0
                      ? <>
                          <BarChart data={analytics.monthly} keyX="month" keyY="revenue" />
                          <div style={{ marginTop:16 }}>
                            {analytics.monthly.map((d,i)=>(
                              <div key={i} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                                <span style={{ fontSize:12, color:"rgba(255,255,255,.5)", minWidth:60 }}>{d.month}</span>
                                <div style={{ flex:1, height:6, background:"rgba(255,255,255,.06)", borderRadius:100 }}>
                                  <div style={{ height:"100%", borderRadius:100, width:`${(d.revenue/Math.max(...analytics.monthly.map(x=>x.revenue),1))*100}%`,
                                    background:i===analytics.monthly.length-1?"linear-gradient(to right,#fe2c55,#ff6b35)":"rgba(255,255,255,.18)" }} />
                                </div>
                                <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:12, color:"#fe2c55", minWidth:56, textAlign:"right" }}>
                                  Rs {(d.revenue/1000).toFixed(0)}K
                                </span>
                              </div>
                            ))}
                          </div>
                        </>
                      : <p style={{ color:"rgba(255,255,255,.3)", fontSize:13, textAlign:"center", padding:40 }}>No data yet</p>
                    }
                  </div>

                  {/* Revenue by Category */}
                  <div className="card">
                    <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, marginBottom:18 }}>🗂️ Revenue by Category</h3>
                    {(analytics?.byCategory||[]).length===0
                      ?<p style={{ color:"rgba(255,255,255,.3)", fontSize:13, textAlign:"center", padding:40 }}>No data yet</p>
                      :(analytics?.byCategory||[]).map((c,i)=>{
                        const cols=["#4facfe","#ff6b9d","#43e97b","#f6d365","#84fab0","#a18cd1","#fa709a"];
                        const col=cols[i%cols.length];
                        const maxRev=Math.max(...(analytics.byCategory||[]).map(x=>x.revenue),1);
                        return(
                          <div key={i} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                            <span style={{ fontSize:12, color:"rgba(255,255,255,.5)", minWidth:100, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.category||"Other"}</span>
                            <div style={{ flex:1, height:8, background:"rgba(255,255,255,.06)", borderRadius:100 }}>
                              <div style={{ height:"100%", width:`${(c.revenue/maxRev)*100}%`, background:col, borderRadius:100 }}/>
                            </div>
                            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:12, color:col, minWidth:52, textAlign:"right" }}>
                              Rs {(c.revenue/1000).toFixed(0)}K
                            </span>
                          </div>
                        );
                      })
                    }
                  </div>
                </div>
                </>);
              })()}
            </div>
          )}

          {/* ════════════════════════════════════════════
              ACTIVITY LOG
          ════════════════════════════════════════════ */}
          {tab==="logs" && (
            <div style={{ animation:"fadeUp .3s ease" }}>
              <div className="card" style={{ padding:0 }}>
                <table>
                  <thead><tr>{["Admin","Action","Target","Details","Time"].map(h=><th key={h}>{h}</th>)}</tr></thead>
                  <tbody>
                    {logs.map(l=>(
                      <tr key={l.id} className="row">
                        <td style={{ fontWeight:600 }}>{l.admin_name}</td>
                        <td>
                          <span style={{ background:"rgba(254,44,85,.1)", color:"#fe2c55", fontSize:11, fontWeight:600, padding:"3px 9px", borderRadius:100 }}>{l.action}</span>
                        </td>
                        <td style={{ color:"rgba(255,255,255,.6)" }}>{l.target_type}: {l.target_name||l.target_id?.slice(0,8)}</td>
                        <td style={{ color:"rgba(255,255,255,.4)", fontSize:12 }}>{l.details && Object.keys(l.details).length>0 ? JSON.stringify(l.details).slice(0,60) : "—"}</td>
                        <td style={{ color:"rgba(255,255,255,.35)", fontSize:12, whiteSpace:"nowrap" }}>{new Date(l.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                    {logs.length===0 && <tr><td colSpan={5} style={{ textAlign:"center", padding:40, color:"rgba(255,255,255,.3)" }}>No activity yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════
              SETTINGS
          ════════════════════════════════════════════ */}
          {tab==="settings" && (
            <SettingsPanel
              addToast={addToast}
              buyers={buyers} sellers={sellers} products={products} orders={orders}
              analytics={analytics}
            />
          )}
        </div>
      </main>

      {/* ════════════════════════════════════════════
          MODALS
      ════════════════════════════════════════════ */}
      {modal?.type==="buyer" && (
        <Modal title="Buyer Profile" onClose={()=>setModal(null)}>
          {(() => { const b = modal.data; return (
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:16, background:"rgba(255,255,255,.04)", borderRadius:14, padding:16, marginBottom:20 }}>
                <div style={{ width:52, height:52, borderRadius:"50%", background:"rgba(254,44,85,.12)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>{b.avatar||"👤"}</div>
                <div><h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:18, marginBottom:4 }}>{b.name}</h3><Badge status={b.status}/></div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
                {[["Email",b.email],["Phone",b.phone||"—"],["City",b.city||"—"],["Joined",new Date(b.created_at).toLocaleDateString()],["Total Orders",b.total_orders||0],["Total Spent",`Rs ${(b.total_spent||0).toLocaleString()}`]].map(([l,v])=>(
                  <div key={l} style={{ background:"rgba(255,255,255,.04)", borderRadius:10, padding:"12px 14px" }}>
                    <p style={{ fontSize:11, color:"rgba(255,255,255,.4)", marginBottom:3, textTransform:"uppercase", letterSpacing:".05em" }}>{l}</p>
                    <p style={{ fontSize:13, fontWeight:600 }}>{v}</p>
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", gap:10 }}>
                {b.status!=="active"    && <Btn color="green" onClick={()=>updateBuyer(b.id,"active")}>✓ Activate</Btn>}
                {b.status!=="suspended" && <Btn color="red"   onClick={()=>updateBuyer(b.id,"suspended")}>Suspend Account</Btn>}
              </div>
            </div>
          );})()}
        </Modal>
      )}

      {modal?.type==="seller" && (
        <Modal title="Seller Application" onClose={()=>setModal(null)} width={580}>
          {(() => { const s = modal.data; return (
            <div>
              {/* Shop Header */}
              <div style={{ display:"flex", alignItems:"center", gap:16, background:"rgba(255,255,255,.04)", borderRadius:14, padding:16, marginBottom:20 }}>
                <div style={{ width:64, height:64, borderRadius:14, background:"rgba(254,44,85,.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, flexShrink:0, overflow:"hidden", border:"2px solid rgba(254,44,85,.2)" }}>
                  {s.shop_logo ? <img src={s.shop_logo} alt="shop logo" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : "🏪"}
                </div>
                <div>
                  <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:18, marginBottom:4 }}>{s.shop_name||"—"}</h3>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    <Badge status={s.status}/>
                    {s.category&&<span style={{ fontSize:11, background:"rgba(255,255,255,.07)", color:"rgba(255,255,255,.6)", borderRadius:100, padding:"3px 9px" }}>{s.category}</span>}
                  </div>
                  {s.shop_bio&&<p style={{fontSize:12,color:"rgba(255,255,255,.45)",marginTop:4}}>{s.shop_bio}</p>}
                </div>
              </div>

              {/* Info Grid */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
                {[["Owner",s.owner_name||"—"],["Email",s.email||"—"],["Phone",s.phone||"—"],["City",s.city||"—"],["CNIC / ID",s.cnic||"—"],["Bank",s.bank_name||"—"],["Account Title",s.account_title||"—"],["Account No.",s.account_number||"—"],["Joined",new Date(s.created_at).toLocaleDateString()],["Rating",s.rating||"New"]].map(([l,v])=>(
                  <div key={l} style={{ background:"rgba(255,255,255,.04)", borderRadius:10, padding:"11px 14px" }}>
                    <p style={{ fontSize:11, color:"rgba(255,255,255,.4)", marginBottom:3, textTransform:"uppercase", letterSpacing:".05em" }}>{l}</p>
                    <p style={{ fontSize:13, fontWeight:500, wordBreak:"break-all" }}>{v}</p>
                  </div>
                ))}
              </div>

              {/* CNIC / ID Document Images */}
              {(s.cnic_front || s.cnic_back || s.cnic_selfie || s.doc_front || s.doc_back || s.doc_selfie) && (
                <div style={{ marginBottom:20 }}>
                  <p style={{ fontSize:11, color:"rgba(255,255,255,.4)", textTransform:"uppercase", letterSpacing:".05em", marginBottom:10 }}>ID / CNIC Documents</p>
                  <div style={{ display:"flex", gap:10 }}>
                    {[
                      ["Front", s.cnic_front||s.doc_front],
                      ["Back",  s.cnic_back||s.doc_back],
                      ["Selfie",s.cnic_selfie||s.doc_selfie]
                    ].map(([label,url])=> url ? (
                      <div key={label} style={{ flex:1 }}>
                        <a href={url} target="_blank" rel="noreferrer">
                          <img src={url} alt={label} style={{ width:"100%", aspectRatio:"4/3", objectFit:"cover", borderRadius:10, border:"1px solid rgba(255,255,255,.1)", cursor:"pointer" }}/>
                        </a>
                        <p style={{ fontSize:11, color:"rgba(255,255,255,.4)", textAlign:"center", marginTop:4 }}>{label}</p>
                      </div>
                    ) : null)}
                  </div>
                </div>
              )}

              {/* If no doc images, show placeholder message */}
              {!(s.cnic_front || s.cnic_back || s.cnic_selfie || s.doc_front || s.doc_back || s.doc_selfie) && (
                <div style={{ background:"rgba(255,255,255,.03)", borderRadius:10, padding:"12px 14px", marginBottom:20, border:"1px dashed rgba(255,255,255,.1)" }}>
                  <p style={{ fontSize:12, color:"rgba(255,255,255,.3)", textAlign:"center" }}>📄 No ID documents uploaded yet</p>
                </div>
              )}
              {s.rejection_reason && <div style={{ background:"rgba(254,44,85,.08)", border:"1px solid rgba(254,44,85,.2)", borderRadius:10, padding:"12px 14px", marginBottom:16 }}><p style={{ fontSize:12, color:"#fe2c55" }}>❌ Rejection reason: {s.rejection_reason}</p></div>}
              <div style={{ display:"flex", gap:10 }}>
                {["pending","rejected"].includes(s.status) && <Btn color="green" onClick={()=>updateSeller(s.id,"active")}>✓ Approve Seller</Btn>}
                {s.status==="pending"   && <Btn color="red"   onClick={()=>setModal({ type:"rejectSeller", data:s })}>✕ Reject</Btn>}
                {s.status==="active"    && <Btn color="red"   onClick={()=>updateSeller(s.id,"suspended")}>Suspend</Btn>}
                {s.status==="suspended" && <Btn color="green" onClick={()=>updateSeller(s.id,"active")}>Reinstate</Btn>}
              </div>
            </div>
          );})()}
        </Modal>
      )}

      {modal?.type==="rejectSeller" && (
        <RejectModal
          title={`Reject: ${modal.data.shop_name}`}
          onClose={()=>setModal(null)}
          onConfirm={(reason)=>updateSeller(modal.data.id,"rejected",reason)}
        />
      )}

      {modal?.type==="rejectProduct" && (
        <RejectModal
          title={`Reject: ${modal.data.title}`}
          onClose={()=>setModal(null)}
          onConfirm={(reason)=>updateProduct(modal.data.id,"rejected",reason)}
        />
      )}

      {toast && <Toast {...toast} onClose={()=>setToast(null)} />}
    </div>
  );
}

// ─── Settings Panel ───────────────────────────────────────────────────────────
function SettingsPanel({ addToast, buyers, sellers, products, orders, analytics }) {
  const [toggles, setToggles] = useState({
    autoApprove: false,
    maintenance: false,
    registration: true,
    notifications: true,
  });
  const [saving, setSaving] = useState(null);

  const toggle = async (key) => {
    setSaving(key);
    const newVal = !toggles[key];
    // Try to save to backend
    try {
      await fetch(`${API}/admin/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("shopAdminToken")}`,
        },
        body: JSON.stringify({ key, value: newVal }),
      });
    } catch {}
    setToggles(prev => ({ ...prev, [key]: newVal }));
    addToast(`${newVal ? "✅ Enabled" : "⛔ Disabled"}: ${{
      autoApprove:"Auto-Approval", maintenance:"Maintenance Mode",
      registration:"User Registration", notifications:"Order Notifications"
    }[key]}`, newVal ? "success" : "warn");
    setSaving(null);
  };

  const exportAllData = () => {
    const now = new Date();
    const rows = [];
    rows.push(["ShopTok Full Export — " + now.toLocaleString()]);
    rows.push([]);

    rows.push(["=== ORDERS ==="]);
    rows.push(["Order No","Buyer","Seller","Product","Amount (Rs)","Status","Payment","City","Date"]);
    orders.forEach(o => rows.push([
      o.order_number, o.buyer_name, o.seller_name, o.product_title,
      o.total_amount, o.status, o.payment_method, o.shipping_city,
      new Date(o.created_at).toLocaleString()
    ]));
    rows.push([]);

    rows.push(["=== BUYERS ==="]);
    rows.push(["Name","Email","Phone","City","Status","Total Orders","Total Spent (Rs)","Joined"]);
    buyers.forEach(b => rows.push([
      b.name, b.email, b.phone||"—", b.city||"—", b.status,
      b.total_orders||0, b.total_spent||0,
      new Date(b.created_at).toLocaleDateString()
    ]));
    rows.push([]);

    rows.push(["=== SELLERS ==="]);
    rows.push(["Shop Name","Owner","Email","Phone","City","Status","CNIC","Bank","Account No","Joined"]);
    sellers.forEach(s => rows.push([
      s.shop_name, s.owner_name, s.email, s.phone||"—", s.city||"—",
      s.status, s.cnic||"—", s.bank_name||"—", s.account_number||"—",
      new Date(s.created_at).toLocaleDateString()
    ]));
    rows.push([]);

    rows.push(["=== PRODUCTS ==="]);
    rows.push(["Title","Seller","Category","Price (Rs)","Stock","Sold","Status"]);
    products.forEach(p => rows.push([
      p.title, p.seller_name, p.category, p.price, p.stock, p.sold||0, p.status
    ]));

    const csv = rows.map(r => r.map(v => `"${String(v??'').replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type:"text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `ShopTok_Full_Export_${now.toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast("Full data exported ✅", "success");
  };

  const settingsList = [
    { key:"autoApprove",   label:"New Seller Auto-Approval",   desc:"Automatically approve seller registrations" },
    { key:"maintenance",   label:"Maintenance Mode",           desc:"Take platform offline for maintenance" },
    { key:"registration",  label:"New User Registration",      desc:"Allow new users to sign up" },
    { key:"notifications", label:"Order Notifications",        desc:"Real-time order alerts for admins" },
  ];

  return (
    <div style={{ animation:"fadeUp .3s ease", maxWidth:680 }}>
      <div className="card" style={{ marginBottom:16 }}>
        <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, marginBottom:20 }}>⚙️ Platform Settings</h3>
        {settingsList.map(({ key, label, desc }) => {
          const on = toggles[key];
          const isSaving = saving === key;
          return (
            <div key={key} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 0", borderBottom:"1px solid rgba(255,255,255,.05)" }}>
              <div>
                <p style={{ fontWeight:500, fontSize:13, marginBottom:2 }}>{label}</p>
                <p style={{ fontSize:12, color:"rgba(255,255,255,.4)" }}>{desc}</p>
              </div>
              <div
                onClick={() => !isSaving && toggle(key)}
                style={{ width:48, height:26, borderRadius:13, background: on?"#fe2c55":"rgba(255,255,255,.15)",
                  position:"relative", cursor: isSaving?"wait":"pointer",
                  transition:"background .25s", flexShrink:0,
                  opacity: isSaving ? 0.6 : 1 }}>
                <div style={{ position:"absolute", top:3, left: on?25:3, width:20, height:20,
                  borderRadius:"50%", background:"#fff", transition:"left .25s",
                  boxShadow:"0 1px 4px rgba(0,0,0,.4)" }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="card" style={{ marginBottom:16 }}>
        <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, marginBottom:20 }}>💰 Commission Settings</h3>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          {[["Platform Commission","8%","Per sale percentage"],["Payment Processing Fee","2%","Per transaction"],["Free Shipping Threshold","Rs 1,000","Minimum for free shipping"],["COD Fee","Rs 150","Cash on delivery charge"]].map(([l,v,d])=>(
            <div key={l} style={{ background:"rgba(255,255,255,.04)", borderRadius:10, padding:"14px 16px" }}>
              <p style={{ fontSize:11, color:"rgba(255,255,255,.4)", marginBottom:4 }}>{l}</p>
              <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:18, color:"#fe2c55", marginBottom:2 }}>{v}</p>
              <p style={{ fontSize:11, color:"rgba(255,255,255,.3)" }}>{d}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background:"rgba(52,211,153,.05)", border:"1px solid rgba(52,211,153,.15)", borderRadius:16, padding:20, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <p style={{ fontWeight:600, fontSize:14, marginBottom:2 }}>📦 Export Data</p>
          <p style={{ fontSize:12, color:"rgba(255,255,255,.4)" }}>Download all orders, buyers, sellers & products as CSV</p>
        </div>
        <button onClick={exportAllData}
          style={{ padding:"10px 22px", borderRadius:10, border:"1px solid rgba(52,211,153,.4)", cursor:"pointer",
            background:"rgba(52,211,153,.12)", color:"#34d399", fontSize:13, fontWeight:700, fontFamily:"inherit" }}>
          ⬇️ Export CSV
        </button>
      </div>
    </div>
  );
}

// ─── Reject with reason modal ─────────────────────────────────────────────────
function RejectModal({ title, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  return (
    <Modal title={title} onClose={onClose} width={440}>
      <p style={{ fontSize:13, color:"rgba(255,255,255,.5)", marginBottom:16 }}>Please provide a reason (will be shown to the seller):</p>
      <textarea value={reason} onChange={e=>setReason(e.target.value)} rows={4}
        placeholder="e.g. Documents are incomplete, CNIC unclear, category mismatch…"
        style={{ width:"100%", background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", borderRadius:10, padding:"11px 14px", color:"#fff", fontSize:13, fontFamily:"inherit", outline:"none", resize:"vertical", marginBottom:16 }} />
      <div style={{ display:"flex", gap:10 }}>
        <button onClick={onClose} style={{ flex:1, padding:11, borderRadius:10, border:"1px solid rgba(255,255,255,.1)", background:"transparent", color:"rgba(255,255,255,.6)", fontSize:13, cursor:"pointer" }}>Cancel</button>
        <button onClick={()=>{ if(reason.trim()) onConfirm(reason); }}
          style={{ flex:1, padding:11, borderRadius:10, border:"none", background: reason.trim()?"rgba(254,44,85,.8)":"#333", color:"#fff", fontSize:13, fontWeight:600, cursor: reason.trim()?"pointer":"not-allowed" }}>
          Confirm Rejection
        </button>
      </div>
    </Modal>
  );
}
