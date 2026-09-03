import { useState, useEffect, useRef } from "react";
import  SingaporeStyleHome  from "./SingaporeStyleHome.jsx";
import { API, CATALOGUE, CATS, S, VIDS } from "../data/catalogue.js";
import Btn from "../components/common/Btn.jsx";
import { AddProductModal } from "../components/modals/AddProductModal.jsx";
import { CheckoutFlow } from "../components/checkout/CheckoutFlow.jsx";
import { EditProductModal } from "../components/modals/EditProductModal.jsx";
import { FullProductPage } from "./shop/FullProductPage.jsx";
import { Landing } from "./auth/Landing.jsx";
import { Login } from "./auth/Login.jsx";
import { PolicyPage } from "./legal/PolicyPage.jsx";
import { CategorySitemap } from "./CategorySitemap.jsx";
import { ProductMiniCard } from "../components/products/ProductMiniCard.jsx";
import { ProfileEditModal } from "../components/modals/ProfileEditModal.jsx";
import { Register } from "./auth/Register.jsx";
import { SellerOnboard } from "./seller/SellerOnboard.jsx";
import { ShopSections } from "../components/shop/ShopSections.jsx";
import { Sidebar } from "../components/layout/Sidebar.jsx";
import { StorePanel } from "../components/shop/StorePanel.jsx";
import { UploadVideoModal } from "../components/modals/UploadVideoModal.jsx";
import { Verify } from "./auth/Verify.jsx";

export const MainApp=({user,setUser,goAuth,darkMode=true,setDarkMode})=>{
 const [showTop,setShowTop]=useState(false);
 useEffect(()=>{
 const onScroll=()=>setShowTop(window.scrollY>400);
 window.addEventListener("scroll",onScroll);
 return ()=>window.removeEventListener("scroll",onScroll);
 },[]);
 const [page,setPage] = useState(localStorage.getItem("shopPage")||"shop");
 // Store Setting states (moved from IIFE to fix React hooks rules)
 const [storeForm,setStoreForm] = useState({storeName:"",contactPerson:"",storeMobile:"",storeProfile:"Welcome to our store.",welcomeMsg:"WELCOME! WELCOME!",newPassword:"",confirmPassword:""});
 const [storeLogo,setStoreLogo] = useState(null);
 const [banners,setBanners] = useState([null,null,null]);
 const [storeNotifs,setStoreNotifs] = useState({orders:true,payouts:true,promos:false});
 const [storeSaving,setStoreSaving] = useState(false);
 const [cart,setCart] = useState([]);
 const [loginPopup,setLoginPopup] = useState(false);
 const [cartOpen,setCO] = useState(false);
 const [checkout,setCheckout]= useState(false);
 const [likedP,setLP] = useState(new Set());
 const [likedV,setLV] = useState(new Set());
 const [cat,setCat] = useState("all");
 const [toast,setToast] = useState(null);
 const [search,setSearch] = useState("");
 const [searchMode,setSearchMode] = useState("products");
 const [selProd,setSP] = useState(null);
 const [profileTab,setPT] = useState(localStorage.getItem("shopProfileTab")||"orders");
 const [sellerTab,setST] = useState(localStorage.getItem("shopSellerTab")||"overview");
 useEffect(()=>{localStorage.setItem("shopPage",page);},[page]);
 useEffect(()=>{localStorage.setItem("shopSellerTab",sellerTab);},[sellerTab]);
 useEffect(()=>{localStorage.setItem("shopProfileTab",profileTab);},[profileTab]);
 const [expandedOrder,setExpandedOrder] = useState(null);
 const [sellerOrders,setSO] = useState([]);
 const [sellerProds,setSP2] = useState([]);
 const [sellerVideos,setSellerVideos] = useState([]);
 const [showUploadVideo,setShowUploadVideo] = useState(false);
 const [buyerOrders,setBO] = useState([]);
 const [showAddProd,setAP] = useState(false);
 const [showProfEdit,setPE] = useState(false);
 const [editProd,setEditProd] = useState(null);
 const [profileImg,setPImg] = useState(()=>{
 // Priority: user prop > localStorage > null
 if(user?.profileImg) return user.profileImg;
 try{ const u=JSON.parse(localStorage.getItem("shopUser")||"{}"); return u.profileImg||null; }catch{ return null; }
 });
 useEffect(()=>{
 if(user?.profileImg) setPImg(user.profileImg);
 },[user?.profileImg]);
 useEffect(()=>{
 if(user) setStoreForm(f=>({...f,storeName:user.seller?.shop_name||user.name||"",contactPerson:user.name||"",storeMobile:user.phone||""}));
 if(user?.profileImg) setStoreLogo(user.profileImg);
 },[user]);
 const [selStore,setSelStore] = useState(null);
 const [storeDetail,setStoreDetail] = useState({products:[],loading:false});

 const showToast=(msg)=>{setToast(msg);setTimeout(()=>setToast(null),2500);};
 const addToCart=(p)=>{setCart(prev=>{const ex=prev.find(i=>i.id===p.id);return ex?prev.map(i=>i.id===p.id?{...i,qty:i.qty+1}:i):[...prev,{...p,qty:1}];});showToast(`${p.emoji} Added to cart!`);};
 const removeFromCart=(id)=>setCart(prev=>prev.filter(i=>i.id!==id));
 const updateQty=(id,d)=>setCart(prev=>prev.map(i=>i.id===id?{...i,qty:Math.max(1,i.qty+d)}:i));
 const cartTotal=cart.reduce((s,i)=>s+i.price*i.qty,0);
 const cartCount=cart.reduce((s,i)=>s+i.qty,0);
 const toggleLP=(id)=>setLP(prev=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);return n;});
 const toggleLV=(id)=>setLV(prev=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);return n;});

 // DB products for shop page
 const [dbProducts,setDbProducts]=useState([]);
 const [dbLoading,setDbLoading]=useState(false);
 useEffect(()=>{
 setDbLoading(true);
 fetch(`${API}/products?limit=100`)
 .then(r=>r.json()).then(d=>{
 if(d.products) setDbProducts(d.products.map(p=>({
 ...p,
 price:Number(p.price)||0,
 orig:Number(p.original_price||p.price)||0,
 disc:Number(p.discount_pct)||0,
 cat:p.category?.toLowerCase().split(" ")[0]||"all",
 color:"#fe2c55",
 rating:Number(p.rating)||0,
 sold:Number(p.sold)||0,
 emoji:p.emoji||"",
 img:p.image_url||p.image||p.thumbnail||p.img||null,
 })));
 setDbLoading(false);
 }).catch(()=>setDbLoading(false));
 },[]);

 const filtered=dbProducts.filter(p=>(cat==="all"||p.cat===cat||p.category?.toLowerCase().includes(cat))&&(!search||p.title?.toLowerCase().includes(search.toLowerCase())));
 const [stores,setStores] = useState([]);
 const [allStores,setAllStores] = useState([]);
 const [storesLoading,setStoresLoading] = useState(false);
 useEffect(()=>{
 if(searchMode!=="stores") return;
 setStoresLoading(true);
 fetch(`${API}/admin/sellers/public?limit=50`)
 .then(r=>r.json()).then(d=>{setAllStores(d.sellers||[]);setStores(d.sellers||[]);setStoresLoading(false);}).catch(()=>setStoresLoading(false));
 },[searchMode]);
 useEffect(()=>{
 if(searchMode!=="stores") return;
 if(!search){setStores(allStores);return;}
 setStores(allStores.filter(s=>s.shop_name?.toLowerCase().includes(search.toLowerCase())||s.category?.toLowerCase().includes(search.toLowerCase())));
 },[search,allStores,searchMode]);
 const totalRev=sellerOrders.reduce((s,o)=>s+o.total,0);
 const activePrds=sellerProds.filter(p=>p.status==="active"||p.status==="live").length;
 const pendingPrds=sellerProds.filter(p=>p.status==="pending").length;
 const pendingOrd=sellerOrders.filter(o=>o.status==="Processing").length;
 const logout=()=>{setUser(null);setPImg(null);localStorage.removeItem('shopToken');localStorage.removeItem('shopPage');localStorage.removeItem('shopUser');setPage('shop');goAuth(S.APP);};

 const onOrderDone=async()=>{
 const shipping=cartTotal>=1000?0:150;
 const o={id:`#ORD-${Date.now().toString().slice(-6)}`,items:[...cart],total:cartTotal+shipping,status:"Processing",date:new Date().toLocaleDateString("en-PK",{day:"2-digit",month:"short",year:"numeric"}),statusColor:"#fbbf24"};
 setBO(prev=>[o,...prev]);setSO(prev=>[o,...prev]);setCart([]);
 // Fetch updated orders from backend
 try{
 const token=localStorage.getItem("shopToken");
 if(token){
 const res=await fetch(`${API}/orders/my`,{headers:{Authorization:`Bearer ${token}`}});
 const data=await res.json();
 if(data.orders){
 const mapped=data.orders.map(ord=>({
 id:ord.order_number||`#ORD-${ord.id}`,
 items:[{title:ord.product_title,emoji:ord.product_emoji||"",qty:ord.quantity,price:ord.unit_price}],
 total:ord.total_amount,
 status:ord.status==="pending"?"Processing":ord.status.charAt(0).toUpperCase()+ord.status.slice(1),
 date:new Date(ord.created_at).toLocaleDateString("en-PK",{day:"2-digit",month:"short",year:"numeric"}),
 statusColor:ord.status==="delivered"?"#34d399":ord.status==="shipped"?"#25f4ee":"#fbbf24"
 }));
 setBO(mapped);
 }
 }
 }catch(e){console.log("Order sync failed",e);}
 };

 // Load buyer orders from backend on mount
 useEffect(()=>{
 const loadBuyerOrders=async()=>{
 try{
 const token=localStorage.getItem("shopToken");
 if(token){
 const res=await fetch(`${API}/orders/my`,{headers:{Authorization:`Bearer ${token}`}});
 const data=await res.json();
 if(data.orders&&data.orders.length>0){
 const mapped=data.orders.map(ord=>({
 id:ord.order_number||`#ORD-${ord.id}`,
 items:[{title:ord.product_title,emoji:ord.product_emoji||"",qty:ord.quantity,price:ord.unit_price}],
 total:Number(ord.total_amount)||0,
 status:ord.status==="pending"?"Processing":ord.status.charAt(0).toUpperCase()+ord.status.slice(1),
 date:new Date(ord.created_at).toLocaleDateString("en-PK",{day:"2-digit",month:"short",year:"numeric"}),
 statusColor:ord.status==="delivered"?"#34d399":ord.status==="shipped"?"#25f4ee":ord.status==="cancelled"?"#fe2c55":"#fbbf24"
 }));
 setBO(mapped);
 }
 }
 }catch(e){console.log("Orders load failed",e);}
 };
 loadBuyerOrders();
 // Auto refresh every 30 seconds
 const interval=setInterval(loadBuyerOrders,30000);
 return ()=>clearInterval(interval);
 },[user]);

 // Load seller products and orders from backend
 useEffect(()=>{
 if(!user||user.role!=="seller") return;
 const token=localStorage.getItem("shopToken");
 if(!token) return;

 const loadSellerData = () => {
 // Load seller's own products
 fetch(`${API}/products/my`,{headers:{Authorization:`Bearer ${token}`}})
 .then(r=>r.json()).then(d=>{
 if(d.products){
 setSP2(d.products.map(p=>({
 ...p,
 price:Number(p.price)||0,
 orig:Number(p.original_price||p.price)||0,
 disc:Number(p.discount_pct)||0,
 cat:p.category?.toLowerCase().split(" ")[0]||"all",
 color:"#fe2c55",
 rating:Number(p.rating)||0,
 sold:Number(p.sold)||0,
 stock:Number(p.stock)||0,
 // normalize status: backend uses "live", frontend uses "active"
 status: p.status==="live" ? "active" : p.status,
 })));
 }
 }).catch(e=>console.log("Seller products load failed",e));

 // Load seller's orders
 fetch(`${API}/orders/seller`,{headers:{Authorization:`Bearer ${token}`}})
 .then(r=>r.json()).then(d=>{
 if(d.orders){
 setSO(d.orders.map(o=>({
 ...o,
 id:o.order_number||`#ORD-${o.id}`,
 items:[{title:o.product_title,emoji:o.product_emoji||"",qty:o.quantity,price:Number(o.unit_price)||0}],
 total:Number(o.total_amount)||0,
 status:o.status==="pending"?"Processing":o.status.charAt(0).toUpperCase()+o.status.slice(1),
 date:new Date(o.created_at).toLocaleDateString("en-PK",{day:"2-digit",month:"short",year:"numeric"}),
 statusColor:o.status==="delivered"?"#34d399":o.status==="shipped"?"#25f4ee":o.status==="cancelled"?"#fe2c55":"#fbbf24"
 })));
 }
 }).catch(e=>console.log("Seller orders load failed",e));
 };

 loadSellerData();
 // Auto refresh every 30 seconds
 const interval = setInterval(loadSellerData, 30000);
 return () => clearInterval(interval);
 },[user]);

 // Load seller products from backend
 useEffect(()=>{
 if(!user||user.role!=="seller")return;
 const loadSellerProds=async()=>{
 try{
 const token=localStorage.getItem("shopToken");
 const res=await fetch(`${API}/products/my`,{headers:{Authorization:`Bearer ${token}`}});
 const data=await res.json();
 if(data.products){
 setSP2(data.products.map(p=>({
 ...p,
 price:Number(p.price)||0,
 orig:p.original_price||p.price,
 disc:p.discount_pct||0,
 emoji:p.emoji||"",
 rating:Number(p.rating)||0,
 sold:Number(p.sold)||0,
 })));
 }
 }catch(e){console.log("Seller products load failed",e);}
 };
 loadSellerProds();
 },[user]);

 // Load seller videos from backend
 const loadSellerVideos=async()=>{
 if(!user||user.role!=="seller")return;
 try{
 const token=localStorage.getItem("shopToken");
 const res=await fetch(`${API}/videos/mine`,{headers:{Authorization:`Bearer ${token}`}});
 const data=await res.json();
 if(data.videos)setSellerVideos(data.videos);
 }catch(e){console.log("Seller videos load failed",e);}
 };
 useEffect(()=>{loadSellerVideos();},[user]);

 const SELLER_TABS=[
 {key:"overview", icon:"", label:"Dashboard", badge:0},
 {key:"orders", icon:"", label:"Shop Orders", badge:pendingOrd},
 {key:"financial", icon:"", label:"Financial Statement", badge:0},
 {key:"wallet", icon:"", label:"My Wallet", badge:0},
 {key:"funds", icon:"", label:"Fund Record", badge:0},
 {key:"products", icon:"", label:"Store Products", badge:0},
 {key:"videos", icon:"", label:"Videos", badge:0},
 {key:"refunds", icon:"↩", label:"Refund Request", badge:0},
 {key:"reviews", icon:"⭐", label:"Product Review", badge:0},
 {key:"warehouse", icon:"", label:"Product Warehouse", badge:0},
 {key:"bestsellers",icon:"", label:"Best Sellers", badge:0},
 {key:"storesetting",icon:"",label:"Store Setting", badge:0},
 {key:"venture", icon:"", label:"Venture Alliance", badge:0},
 ];
 const BUYER_TABS=[
 {key:"orders", icon:"",label:"My Orders",badge:0},
 {key:"wishlist",icon:"",label:"Wishlist",badge:likedP.size},
 {key:"reviews", icon:"⭐",label:"Reviews",badge:0},
 {key:"settings",icon:"",label:"Settings",badge:0},
 ];

 return(
 <div style={{fontFamily:"'Poppins',sans-serif",background:"#f7f7f8",color:"#111",minHeight:"100vh"}}><style>{`
 @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
 *{margin:0;padding:0;box-sizing:border-box;}
 ::-webkit-scrollbar{width:8px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:#d0d0d0;border-radius:4px;}
 @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
 @keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}
 @keyframes spin{to{transform:rotate(360deg)}}
 @keyframes toastIn{from{opacity:0;transform:translateY(-10px) translateX(-50%)}to{opacity:1;transform:translateY(0) translateX(-50%)}}
 .hcard:hover{transform:translateY(-3px)!important;border-color:rgba(254,44,85,0.4)!important;}
 .hscroll::-webkit-scrollbar{height:0px;}
 .hscroll::-webkit-scrollbar-thumb{background:transparent;}
 .hscroll{scrollbar-width:none;}
 .fixed-left-sidebar{display:flex;}
 .content-with-sidebar{margin-left:220px;}
 @media(max-width:860px){
 .fixed-left-sidebar{display:none!important;}
 .content-with-sidebar{margin-left:0!important;}
 }
 input:focus{outline:none;} select option{background:#fff;color:#111;}
 .hero-h1{font-size:clamp(30px,9vw,48px)!important;}
 .product-page-grid{grid-template-columns:1fr 1fr!important;}
 @media(max-width:900px){.product-page-grid{grid-template-columns:1fr!important;} .product-page-grid>div:first-child{position:relative!important;height:280px!important;}}
 @media(max-width:768px){
 .desktop-nav-links{display:none!important;}
 .hero-h1{font-size:clamp(28px,9vw,40px)!important;letter-spacing:-1px!important;}
 .hero-stats{gap:16px!important;}
 .trust-strip{grid-template-columns:1fr 1fr!important;}
 .trust-strip>div{border-right:none!important;border-bottom:1px solid rgba(0,0,0,0.07)!important;}
 .trending-grid{grid-template-columns:repeat(2,1fr)!important;gap:10px!important;}
 .how-grid{grid-template-columns:1fr!important;gap:12px!important;}
 .cat-grid{grid-template-columns:repeat(2,1fr)!important;}
 .testimonials-grid{grid-template-columns:1fr!important;}
 .seller-cta{padding:28px 20px!important;}
 .footer-grid{grid-template-columns:1fr 1fr!important;gap:24px!important;}
 .footer-bottom{flex-direction:column!important;align-items:flex-start!important;}
 .hero-btns{flex-wrap:wrap!important;}
 .hero-btns button{flex:1!important;min-width:140px!important;}
 .page-inner{padding:0 16px!important;}
 .home-padding{padding:40px 0 32px!important;}
 .checkout-steps{gap:2px!important;}
 .product-page-grid{grid-template-columns:1fr!important;}
 .related-grid{grid-template-columns:1fr 1fr!important;}
 .sidebar-wrap{flex-direction:column!important;}
 .sidebar-col{width:100%!important;border-right:none!important;border-bottom:1px solid rgba(0,0,0,0.07)!important;flex-shrink:0!important;}
 .sidebar-nav-items{display:flex!important;flex-direction:row!important;overflow-x:auto!important;padding:8px!important;gap:4px!important;}
 .sidebar-profile-section{flex-direction:row!important;align-items:center!important;gap:12px!important;padding:14px!important;}
 .product-panel-emoji{font-size:90px!important;}
 .size-row{flex-wrap:wrap!important;}
 .shop-grid{grid-template-columns:repeat(2,1fr)!important;}
 .feed-container{padding:8px 0 60px!important;}
 .feed-card{width:calc(100vw - 32px)!important;max-width:100%!important;}
 .navbar-search{width:120px!important;}
 .shop-search-row{flex-wrap:wrap!important;}
 }
 @media(max-width:480px){
 .shop-grid{grid-template-columns:repeat(2,1fr)!important;gap:8px!important;}
 .shop-search-input{min-width:100px!important;}
 .feed-container{padding:8px 0 60px!important;}
 .trust-strip{grid-template-columns:1fr!important;}
 .cat-grid{grid-template-columns:repeat(2,1fr)!important;}
 .hero-btns{flex-direction:column!important;}
 .hero-btns button{width:100%!important;}
 .footer-grid{grid-template-columns:1fr!important;}
 .footer-newsletter-row{flex-direction:column!important;}
 .newsletter-input-row{flex-direction:column!important;}
 .newsletter-input-row input{width:100%!important;}
 .page-inner{padding:0 12px!important;}
 .trending-grid{gap:8px!important;}
 }
 `}</style>

 {/* Checkout full-page flow */}
 {checkout&&(
 <CheckoutFlow
 cart={cart}
 cartTotal={cartTotal}
 user={user}
 onDone={()=>{onOrderDone();setCheckout(false);setCO(false);setPage("profile");setPT("orders");showToast(" Order placed successfully!");}}
 onBack={()=>setCheckout(false)}
 />
 )}

 {toast&&<div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",zIndex:999,background:"#f2f2f2",border:"1px solid rgba(0,0,0,0.1)",padding:"11px 22px",borderRadius:100,fontSize:13,fontWeight:500,display:"flex",alignItems:"center",gap:8,boxShadow:"0 8px 32px rgba(0,0,0,0.5)",animation:"toastIn 0.3s ease",whiteSpace:"nowrap"}}>{toast}</div>}

 {showAddProd&&<AddProductModal onClose={()=>setAP(false)} onAdd={p=>{setSP2(prev=>[...prev,p]);showToast(`${p.emoji} Product added — pending review`);}}/>}
 {editProd&&<EditProductModal prod={editProd} onClose={()=>setEditProd(null)} onSave={p=>{setSP2(prev=>prev.map(x=>x.id===p.id?p:x));showToast(" Product updated!");setEditProd(null);}}/>}
 {showProfEdit&&<ProfileEditModal onClose={()=>setPE(false)} onSave={async(f,newImgFile)=>{
 try{
 const token=localStorage.getItem("shopToken");
 // If new profile image selected, upload to Cloudinary first
 let imgUrl=profileImg;
 if(newImgFile){
 const fd=new FormData();fd.append("image",newImgFile);
 const upRes=await fetch(`${API}/upload/image`,{method:"POST",headers:{Authorization:`Bearer ${token}`},body:fd});
 const upData=await upRes.json();
 if(upData.url){
 imgUrl=upData.url;
 setPImg(imgUrl);
 // Save immediately to localStorage so it persists
 try{const u=JSON.parse(localStorage.getItem("shopUser")||"{}");u.profileImg=imgUrl;localStorage.setItem("shopUser",JSON.stringify(u));}catch{}
 }
 }
 // Update profile
 const res=await fetch(`${API}/auth/profile`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
 body:JSON.stringify({name:f.name,phone:f.phone,city:f.city,profileImg:imgUrl,password:f.password||undefined})});
 const data=await res.json();
 if(!res.ok)throw new Error(data.message||"Failed");
 setUser(u=>{
 const updated={...u,name:f.name||u.name,phone:f.phone||u.phone,city:f.city||u.city,profileImg:imgUrl||u.profileImg};
 localStorage.setItem("shopUser",JSON.stringify({name:updated.name,email:updated.email,phone:updated.phone,city:updated.city,role:updated.role,profileImg:updated.profileImg}));
 return updated;
 });
 showToast(" Profile saved!");
 }catch(err){showToast(" "+err.message);}
 setPE(false);
 }} user={user} profileImg={profileImg} setProfileImg={setPImg}/>}

 {/* Product Detail Panel */}
 {selProd&&(
 <div className="content-with-sidebar" style={{position:"fixed",top:0,right:0,bottom:0,left:0,background:"#f7f7f8",zIndex:120,overflowY:"auto"}}><FullProductPage
 prod={selProd}
 onClose={()=>setSP(null)}
 addToCart={addToCart}
 setCart={setCart}
 onBuyNow={()=>{setCO(false);setCheckout(true);}}
 likedP={likedP}
 toggleLP={toggleLP}
 showToast={showToast}
 /></div>
 )}

 {/* Store Detail Panel */}
 {selStore&&(
 <StorePanel
 store={selStore}
 detail={storeDetail}
 onClose={()=>setSelStore(null)}
 addToCart={addToCart}
 showToast={showToast}
 setSP={setSP}
 />
 )}

 {/* CART SIDEBAR */}
 {cartOpen&&!checkout&&(
 <><div onClick={()=>setCO(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(4px)",zIndex:200}}/><div style={{position:"fixed",top:0,right:0,bottom:0,width:360,background:"#ffffff",borderLeft:"1px solid rgba(0,0,0,0.08)",zIndex:201,display:"flex",flexDirection:"column",animation:"slideIn 0.3s ease"}}><div style={{padding:"18px 20px",borderBottom:"1px solid rgba(0,0,0,0.08)",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontFamily:"Poppins,sans-serif",fontWeight:700,fontSize:15}}>Cart ({cartCount})</span><button onClick={()=>setCO(false)} style={{background:"rgba(0,0,0,0.08)",border:"none",color:"#111",width:28,height:28,borderRadius:"50%",cursor:"pointer",fontSize:16}}>×</button></div><div style={{flex:1,overflowY:"auto",padding:"12px 20px",display:"flex",flexDirection:"column",gap:10}}>
 {cart.length===0
 ?<div style={{textAlign:"center",paddingTop:60}}><div style={{fontSize:46,marginBottom:12}}></div><p style={{color:"rgba(0,0,0,0.4)"}}>Cart is empty</p><button onClick={()=>{setCO(false);setPage("shop");}} style={{marginTop:16,background:"#fe2c55",color:"#fff",border:"none",padding:"10px 22px",borderRadius:100,cursor:"pointer",fontFamily:"Poppins,sans-serif",fontWeight:600,fontSize:13}}>Browse Shop</button></div>
 :cart.map(item=>(
 <div key={item.id} style={{background:"rgba(0,0,0,0.04)",border:"1px solid rgba(0,0,0,0.08)",borderRadius:12,padding:12,display:"flex",gap:11}}><div style={{width:50,height:50,borderRadius:10,background:`${item.color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{item.emoji}</div><div style={{flex:1,minWidth:0}}><p style={{fontSize:12,fontWeight:600,lineHeight:1.4,marginBottom:6,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{item.title}</p><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontFamily:"Poppins,sans-serif",fontWeight:700,color:"#fe2c55",fontSize:13}}>Rs {(item.price*item.qty).toLocaleString()}</span><div style={{display:"flex",alignItems:"center",gap:5}}><button onClick={()=>updateQty(item.id,-1)} style={{width:22,height:22,borderRadius:"50%",background:"rgba(0,0,0,0.1)",border:"none",color:"#111",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button><span style={{fontSize:12,fontWeight:600,minWidth:14,textAlign:"center"}}>{item.qty}</span><button onClick={()=>updateQty(item.id,1)} style={{width:22,height:22,borderRadius:"50%",background:"rgba(0,0,0,0.1)",border:"none",color:"#111",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button><button onClick={()=>removeFromCart(item.id)} style={{color:"#fe2c55",background:"none",border:"none",cursor:"pointer",fontSize:15}}></button></div></div></div></div>
 ))
 }
 </div>
 {cart.length>0&&(
 <div style={{padding:"16px 20px",borderTop:"1px solid rgba(0,0,0,0.08)"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{color:"rgba(0,0,0,0.4)"}}>Subtotal</span><span style={{fontFamily:"Poppins,sans-serif",fontWeight:800,fontSize:16}}>Rs {cartTotal.toLocaleString()}</span></div><p style={{fontSize:11,color:"rgba(0,0,0,0.3)",marginBottom:14}}>{cartTotal>=1000?" Free shipping!":"Add Rs "+(1000-cartTotal)+" for free shipping"}</p><button onClick={()=>{setCO(false);setCheckout(true);}} style={{width:"100%",background:"linear-gradient(135deg,#fe2c55,#ff6b35)",color:"#fff",border:"none",padding:"14px",borderRadius:100,fontFamily:"Poppins,sans-serif",fontWeight:700,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>Checkout — Rs {(cartTotal+(cartTotal>=1000?0:150)).toLocaleString()}
 </button></div>
 )}
 </div></>
 )}

 {/* FIXED LEFT SIDEBAR */}
 <div className="fixed-left-sidebar" style={{position:"fixed",left:0,top:0,bottom:0,width:220,background:"#fff",borderRight:"1px solid rgba(0,0,0,0.08)",display:"flex",flexDirection:"column",padding:"20px 20px",zIndex:110,overflowY:"auto"}}><div onClick={()=>setPage("shop")} style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer",flexShrink:0,marginBottom:26}}><span style={{fontFamily:"Poppins,sans-serif",fontWeight:800,fontSize:19,letterSpacing:"-0.5px",color:"#111"}}>ShopTok</span></div><button onClick={()=>setPage("seller")} style={{display:"flex",alignItems:"center",gap:10,background:"none",border:"none",cursor:"pointer",color:"#111",fontSize:14,fontFamily:"inherit",padding:"9px 0",textAlign:"left"}}>Sell
 </button><button onClick={()=>setPage("sitemap")} style={{display:"flex",alignItems:"center",gap:10,background:"none",border:"none",cursor:"pointer",color:"#111",fontSize:14,fontFamily:"inherit",padding:"9px 0",textAlign:"left"}}>More
 </button>
 {!user&&(
 <button onClick={()=>goAuth(S.LOGIN)} style={{width:"100%",background:"#fe2c55",color:"#fff",border:"none",padding:"10px",borderRadius:100,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"Poppins,sans-serif",marginTop:14}}>Log in</button>
 )}
 {user&&(
 <div onClick={()=>user.role==="seller"?setPage("seller"):setPage("profile")} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",marginTop:14}}><div style={{width:32,height:32,borderRadius:"50%",overflow:"hidden",flexShrink:0,background:"#fe2c55",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"#fff"}}>
 {profileImg?<img src={profileImg} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:(user.name?.[0]?.toUpperCase()||"U")}
 </div><span style={{fontSize:13,fontWeight:600,color:"#111"}}>{user.name}</span></div>
 )}
 <div style={{flex:1}}/><div style={{display:"flex",flexDirection:"column",gap:14,fontSize:13,paddingBottom:10}}>
 {[["Shop","shop"],["Sell","seller"],["About",null],["Customer support",null],["Legal",null]].map(([l,p])=>(
 <span key={l} onClick={()=>p&&setPage(p)} style={{cursor:"pointer",color:"#555",transition:"color 0.15s"}}
 onMouseEnter={e=>e.currentTarget.style.color="#111"}
 onMouseLeave={e=>e.currentTarget.style.color="#555"}>{l}</span>
 ))}
 <span style={{fontSize:11,color:"#999",marginTop:2}}>© 2026 ShopTok</span></div></div><div className="content-with-sidebar">

 {/* TOP NAV */}
 <nav style={{position:"sticky",top:0,zIndex:100,background:"rgba(255,255,255,0.97)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(0,0,0,0.08)",padding:"0 24px",height:60,display:"flex",alignItems:"center",gap:16}}><div style={{marginLeft:"auto",display:"flex",gap:14,alignItems:"center"}}>
 {(user||cartCount>0)&&(
 <button onClick={()=>setCO(o=>!o)} style={{position:"relative",background:"none",border:"none",color:"#111",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontFamily:"inherit",flexShrink:0}}>Cart{cartCount>0&&<span style={{position:"absolute",top:-8,right:-14,background:"#fe2c55",color:"#fff",fontSize:9,fontWeight:700,width:16,height:16,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}>{cartCount}</span>}
 </button>
 )}
 {user
 ?<div onClick={()=>user.role==="seller"?setPage("seller"):setPage("profile")} style={{width:36,height:36,borderRadius:"50%",overflow:"hidden",cursor:"pointer",border:"2px solid rgba(0,0,0,0.15)",flexShrink:0}}>
 {profileImg?<img src={profileImg} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
 :<div style={{width:"100%",height:"100%",background:"#fe2c55",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{user.avatar}</div>}
 </div>
 :<div style={{display:"flex",alignItems:"center",gap:8,position:"relative"}}><button style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:"rgba(0,0,0,0.55)",fontSize:13,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>Get app</button><button onClick={()=>setLoginPopup(o=>!o)} style={{background:"#fe2c55",color:"#fff",border:"none",padding:"8px 22px",borderRadius:100,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"Poppins,sans-serif",flexShrink:0}}>Log in</button>
 {loginPopup&&(
 <><div onClick={()=>setLoginPopup(false)} style={{position:"fixed",inset:0,zIndex:150}}/><div style={{position:"absolute",top:46,right:0,width:300,background:"#fff",color:"#111",borderRadius:14,padding:20,boxShadow:"0 20px 50px rgba(0,0,0,0.18)",border:"1px solid #eee",zIndex:151,animation:"fadeUp 0.2s ease both"}}><p style={{fontWeight:700,fontSize:15,marginBottom:6}}>Welcome! Ready for Some Savings?</p><p style={{fontSize:12.5,color:"#666",marginBottom:16,lineHeight:1.5}}>Log in to see your exclusive discounts.</p><div style={{display:"flex",alignItems:"center",gap:16}}><button onClick={()=>{setLoginPopup(false);goAuth(S.LOGIN);}} style={{background:"#fe2c55",color:"#fff",border:"none",padding:"9px 26px",borderRadius:100,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"Poppins,sans-serif"}}>Log in</button><button onClick={()=>{setLoginPopup(false);goAuth(S.REG);}} style={{background:"none",border:"none",color:"#fe2c55",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Create Account</button></div></div></>
 )}
 </div>
 }
 </div></nav>

 {/* PAGES */}
 <div style={{width:"100%",maxWidth:"100%",margin:0,padding:page==="seller"||page==="profile"?0:"0 24px",boxSizing:"border-box",display:"block"}} className="page-inner">

 {/* SHOP */}
 {page==="shop"&&(
   <SingaporeStyleHome
     products={dbProducts.length ? dbProducts : CATALOGUE}
     vids={VIDS}
     onOpen={setSP}
     onAdd={addToCart}
     search={search}
     setSearch={setSearch}
     cat={cat}
     setCat={setCat}
     loading={dbLoading}
   />
 )}
 {/* SELLER DASHBOARD */}
 {page==="seller"&&(
 <div style={{display:"flex",width:"100%",minHeight:"calc(100vh - 60px)"}}><Sidebar user={user} profileImg={profileImg} tab={sellerTab} setTab={setST} onAddProduct={()=>setAP(true)} onLogout={logout} onEditProfile={()=>setPE(true)} tabs={SELLER_TABS} showAdd={true}/><div style={{flex:1,overflowY:"auto",overflowX:"hidden",padding:"26px 28px 60px",minWidth:0}}><div style={{marginBottom:22}}><h1 style={{fontFamily:"Poppins,sans-serif",fontWeight:800,fontSize:22,marginBottom:3}}>
 {{
 overview:" Dashboard",
 orders:" Shop Orders",
 financial:" Financial Statement",
 wallet:" My Wallet",
 funds:" Fund Record",
 products:" Store Products",
 refunds:"↩ Refund Request",
 reviews:"⭐ Product Review",
 warehouse:" Product Warehouse",
 bestsellers:" Best Sellers",
 storesetting:" Store Setting",
 venture:" Venture Alliance"
 }[sellerTab]}
 </h1><p style={{color:"rgba(0,0,0,0.4)",fontSize:13}}>Welcome back, {user?.name} </p></div>

 {sellerTab==="overview"&&<div><div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14,marginBottom:22}}>
 {[{icon:"",label:"Revenue",val:`Rs ${totalRev.toLocaleString()}`,color:"#fe2c55",goto:"revenue"},{icon:"",label:"Orders",val:sellerOrders.length.toString(),color:"#25f4ee",goto:"orders"},{icon:"",label:"Active Products",val:activePrds.toString(),color:"#a78bfa",goto:"products"},{icon:"⏳",label:"Pending",val:(pendingPrds+pendingOrd).toString(),color:"#fbbf24",goto:"pending"}].map(s=>(
 <div key={s.label} onClick={()=>setST(s.goto)} style={{background:"#ffffff",border:"1px solid rgba(0,0,0,0.07)",borderRadius:14,padding:18,cursor:"pointer",transition:"all 0.2s"}}
 onMouseEnter={e=>{e.currentTarget.style.borderColor=s.color+"50";e.currentTarget.style.transform="translateY(-2px)";}}
 onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(0,0,0,0.07)";e.currentTarget.style.transform="translateY(0)";}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div><p style={{fontSize:10,color:"rgba(0,0,0,0.35)",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:8}}>{s.label}</p><p style={{fontFamily:"Poppins,sans-serif",fontWeight:800,fontSize:22,marginBottom:3}}>{s.val}</p></div><div style={{width:42,height:42,borderRadius:11,background:`${s.color}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{s.icon}</div></div><p style={{marginTop:10,fontSize:10,color:s.color}}>View details →</p></div>
 ))}
 </div><div style={{background:"#ffffff",border:"1px solid rgba(0,0,0,0.07)",borderRadius:14,padding:20,marginBottom:20}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><h3 style={{fontFamily:"Poppins,sans-serif",fontWeight:700,fontSize:14}}>My Products</h3><button onClick={()=>setAP(true)} style={{background:"rgba(254,44,85,0.1)",border:"1px solid rgba(254,44,85,0.25)",color:"#fe2c55",padding:"6px 12px",borderRadius:100,fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>+ Add</button></div>
 {sellerProds.length===0
 ?<div style={{textAlign:"center",padding:"24px 0"}}><p style={{fontSize:28,marginBottom:8}}></p><p style={{fontSize:12,color:"#444",marginBottom:12}}>No products yet</p><button onClick={()=>setAP(true)} style={{background:"#fe2c55",color:"#fff",border:"none",padding:"8px 16px",borderRadius:100,fontSize:12,cursor:"pointer",fontFamily:"Poppins,sans-serif",fontWeight:600}}>+ Add First Product</button></div>
 :sellerProds.slice(0,4).map((p,i)=>(
 <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}><span style={{fontSize:11,color:"#333",width:16}}>#{i+1}</span><div style={{width:34,height:34,borderRadius:8,background:"rgba(254,44,85,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{p.emoji}</div><div style={{flex:1,minWidth:0}}><p style={{fontSize:12,fontWeight:500,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{p.title}</p><p style={{fontSize:10,color:"rgba(0,0,0,0.3)"}}>Stock: {p.stock}</p></div><div style={{textAlign:"right"}}><p style={{fontFamily:"Poppins,sans-serif",fontWeight:700,fontSize:12,color:"#fe2c55"}}>Rs {p.price.toLocaleString()}</p><span style={{fontSize:9,color:(p.status==="active"||p.status==="live")?"#34d399":"#fbbf24"}}>{(p.status==="active"||p.status==="live")?"● Live":"● Pending"}</span></div></div>
 ))
 }
 </div>

 {/* ── Best Sellers on Dashboard ── */}
 {(()=>{
 const sorted=[...sellerProds].sort((a,b)=>(b.sold||0)-(a.sold||0)).slice(0,10);
 const totalOrders=sellerOrders.length;
 const inProcess=sellerOrders.filter(o=>o.status==="Processing"||o.status==="Confirmed").length;
 const completed=sellerOrders.filter(o=>o.status==="Delivered").length;
 const cancelled=sellerOrders.filter(o=>o.status==="Cancelled").length;
 return(
 <div style={{display:"grid",gridTemplateColumns:"1fr 260px",gap:16,alignItems:"start"}}><div style={{background:"#ffffff",border:"1px solid #1a1a1a",borderRadius:14,overflow:"hidden"}}><div style={{padding:"16px 20px",borderBottom:"1px solid rgba(0,0,0,0.06)"}}><p style={{fontWeight:700,fontSize:15,color:"#fe2c55"}}>TOP 10 Best-Selling Items</p></div><div style={{display:"grid",gridTemplateColumns:"44px 1fr 110px 120px",padding:"10px 20px",background:"rgba(0,0,0,0.03)",borderBottom:"1px solid rgba(0,0,0,0.06)"}}>
 {["#","Product Name","Price","Sales Volume"].map(h=><p key={h} style={{fontSize:11,color:"#555",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.04em"}}>{h}</p>)}
 </div>
 {sorted.length===0
 ?<div style={{textAlign:"center",padding:"30px 0"}}><p style={{fontSize:32,marginBottom:8}}></p><p style={{color:"#555",fontSize:13}}>Add products to see best sellers</p></div>
 :<div>
 {sorted.map((p,i)=>(
 <div key={i} style={{display:"grid",gridTemplateColumns:"44px 1fr 110px 120px",padding:"12px 20px",borderBottom:"1px solid rgba(0,0,0,0.04)",alignItems:"center",background:i%2===0?"transparent":"rgba(0,0,0,0.02)"}}><div style={{width:24,height:24,borderRadius:"50%",background:i===0?"rgba(251,191,36,0.15)":i===1?"rgba(0,0,0,0.06)":"rgba(0,0,0,0.04)",display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{fontSize:11,fontWeight:700,color:i===0?"#fbbf24":i===1?"#888":"#555"}}>{i+1}</p></div><p style={{fontSize:13,color:"#ddd",lineHeight:1.4,paddingRight:12}}>{p.emoji} {p.title}</p><p style={{fontSize:13,color:"#888"}}>Rs {(p.price||0).toLocaleString()}</p><p style={{fontSize:13,color:"#34d399",fontWeight:600}}>{(p.sold||0).toLocaleString()}</p></div>
 ))}
 </div>
 }
 </div><div style={{background:"#ffffff",border:"1px solid #1a1a1a",borderRadius:14,overflow:"hidden"}}><div style={{padding:"16px 20px",borderBottom:"1px solid rgba(0,0,0,0.06)"}}><p style={{fontWeight:700,fontSize:15,color:"#fe2c55"}}>Order Statistics</p></div><div style={{padding:"16px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
 {[[totalOrders,"Total Orders","#334155"],[inProcess,"In Process","#334155"],[completed,"Completed","#14a37f"],[cancelled,"Cancelled","#334155"]].map(([v,l,c])=>(
 <div key={l} style={{textAlign:"center",padding:"12px 8px",background:"rgba(0,0,0,0.03)",borderRadius:10,border:`1px solid ${c}20`}}><p style={{fontFamily:"Poppins,sans-serif",fontWeight:800,fontSize:24,color:c,marginBottom:3}}>{v}</p><p style={{fontSize:11,color:"#555"}}>{l}</p></div>
 ))}
 </div><div style={{padding:"14px 20px",borderTop:"1px solid rgba(0,0,0,0.06)",display:"flex",justifyContent:"center"}}><div style={{width:72,height:72,borderRadius:"50%",border:"2px solid #14a37f",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:1}}><p style={{fontSize:9,color:"#14a37f",fontWeight:700}}></p><p style={{fontSize:11,color:"#14a37f",fontWeight:800}}>Verified</p><p style={{fontSize:9,color:"#14a37f",fontWeight:700}}></p></div></div></div></div>
 );
 })()}
 </div>}

 {sellerTab==="revenue"&&<div><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:18}}>
 {[["Today",totalRev,"#fe2c55"],["This Week",totalRev,"#25f4ee"],["This Month",totalRev,"#34d399"]].map(([l,v,c])=>(
 <div key={l} style={{background:"#ffffff",border:"1px solid #1a1a1a",borderRadius:12,padding:16,textAlign:"center"}}><p style={{fontSize:11,color:"#555",marginBottom:6}}>{l}</p><p style={{fontFamily:"Poppins,sans-serif",fontWeight:800,fontSize:16,color:c}}>Rs {v.toLocaleString()}</p></div>
 ))}
 </div>
 {sellerOrders.length===0
 ?<div style={{textAlign:"center",padding:"60px 0"}}><p style={{fontSize:48,marginBottom:12}}></p><p style={{color:"#555"}}>No revenue yet</p></div>
 :<div style={{display:"flex",flexDirection:"column",gap:8}}>{sellerOrders.map((o,i)=>(
 <div key={i} style={{background:"#ffffff",border:"1px solid #1a1a1a",borderRadius:12,padding:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><p style={{fontSize:13,fontWeight:600,marginBottom:2}}>{o.id}</p><p style={{fontSize:11,color:"#555"}}>{o.date}</p></div><div style={{textAlign:"right"}}><p style={{fontFamily:"Poppins,sans-serif",fontWeight:700,fontSize:14,color:"#34d399"}}>+Rs {o.total.toLocaleString()}</p></div></div>
 ))}</div>}
 </div>}

 {sellerTab==="orders"&&<div>
 {sellerOrders.length===0
 ?<div style={{textAlign:"center",padding:"60px 0"}}><p style={{fontSize:48,marginBottom:12}}></p><p style={{color:"#555"}}>No orders yet</p></div>
 :<div style={{display:"flex",flexDirection:"column",gap:10}}>
 {sellerOrders.map((o,i)=>(
 <div key={i} style={{background:"#ffffff",border:"1px solid #1a1a1a",borderRadius:14,overflow:"hidden"}}><div onClick={()=>setExpandedOrder(expandedOrder===i?null:i)} style={{padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}
 onMouseEnter={e=>e.currentTarget.style.background="rgba(0,0,0,0.03)"}
 onMouseLeave={e=>e.currentTarget.style.background="transparent"}><div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:22}}>{o.items?o.items[0]?.emoji:o.product_emoji||""}</span><div><div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontFamily:"Poppins,sans-serif",fontWeight:700,fontSize:13,color:"#fe2c55"}}>{o.id||o.order_number}</span><span style={{fontSize:11,color:"#555"}}>{o.date||new Date(o.created_at).toLocaleDateString("en-PK",{day:"2-digit",month:"short",year:"numeric"})}</span></div><p style={{fontSize:12,color:"rgba(0,0,0,0.5)",marginTop:2}}>{o.items?o.items[0]?.title:o.product_title}</p></div></div><div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:11,fontWeight:700,color:o.statusColor||"#fbbf24",background:(o.statusColor||"#fbbf24")+"18",padding:"4px 10px",borderRadius:100}}>● {o.status}</span><span style={{fontFamily:"Poppins,sans-serif",fontWeight:700,fontSize:13,color:"#34d399"}}>Rs {Number(o.total||o.total_amount||0).toLocaleString()}</span><span style={{fontSize:11,color:"#555"}}>{expandedOrder===i?"▲":"▼"}</span></div></div>
 {expandedOrder===i&&(
 <div style={{borderTop:"1px solid rgba(254,44,85,0.2)"}}><div style={{padding:"12px 18px",borderBottom:"1px solid #1a1a1a",display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:28}}>{o.items?o.items[0]?.emoji:o.product_emoji||""}</span><div style={{flex:1}}><p style={{fontSize:13,fontWeight:600,marginBottom:2}}>{o.items?o.items[0]?.title:o.product_title}</p><p style={{fontSize:11,color:"#555"}}>Qty: {o.items?o.items[0]?.qty:o.quantity} · Rs {Number(o.items?o.items[0]?.price:o.unit_price||0).toLocaleString()} each</p></div><div style={{textAlign:"right"}}><p style={{fontSize:11,color:"#555",marginBottom:2}}>Shipping</p><p style={{fontSize:12,fontWeight:600,color:Number(o.shipping_fee)===0?"#34d399":"#fff"}}>{Number(o.shipping_fee)===0?"FREE":"Rs "+Number(o.shipping_fee||150).toLocaleString()}</p></div></div><div style={{padding:"12px 18px",borderBottom:"1px solid #1a1a1a"}}><p style={{fontSize:11,color:"#fe2c55",fontWeight:700,marginBottom:8}}>BUYER DETAILS</p><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
 {[["Name",o.shipping_name||o.buyer_name],["Phone",o.shipping_phone||o.buyer_phone],["City",o.shipping_city||o.buyer_city],["Payment",(o.payment_method||"COD").toUpperCase()]].map(([l,v])=>(
 <div key={l} style={{background:"rgba(0,0,0,0.03)",borderRadius:8,padding:"8px 12px"}}><p style={{fontSize:10,color:"#555",marginBottom:3}}>{l}</p><p style={{fontSize:13,fontWeight:600}}>{v||"—"}</p></div>
 ))}
 </div>
 {o.shipping_address&&<div style={{marginTop:8,background:"rgba(0,0,0,0.03)",borderRadius:8,padding:"8px 12px"}}><p style={{fontSize:10,color:"#555",marginBottom:3}}>Address</p><p style={{fontSize:13}}>{o.shipping_address}, {o.shipping_city}</p>{o.rider_note&&<p style={{fontSize:11,color:"#fbbf24",marginTop:4}}> {o.rider_note}</p>}</div>}
 </div><div style={{padding:"12px 18px"}}><p style={{fontSize:11,color:"#25f4ee",fontWeight:700,marginBottom:10}}>DELIVERY STATUS</p><div style={{display:"flex",alignItems:"center",gap:10,background:"rgba(0,0,0,0.03)",borderRadius:10,padding:"12px 16px"}}><span style={{fontSize:22}}>{
 (o.status||"").toLowerCase()==="delivered"?"":
 (o.status||"").toLowerCase()==="shipped"?"":
 (o.status||"").toLowerCase()==="cancelled"?"":"⏳"
 }</span><div><p style={{fontSize:13,fontWeight:700,color:
 (o.status||"").toLowerCase()==="delivered"?"#34d399":
 (o.status||"").toLowerCase()==="shipped"?"#25f4ee":
 (o.status||"").toLowerCase()==="cancelled"?"#ef4444":"#fbbf24"
 }}>{o.status||"Processing"}</p><p style={{fontSize:11,color:"#555",marginTop:2}}>Status is managed by admin</p></div></div></div></div>
 )}
 </div>
 ))}
 </div>}
 </div>}

 {sellerTab==="products"&&<div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><p style={{fontSize:13,color:"#555"}}>{sellerProds.length} total · {activePrds} live · {pendingPrds} pending</p><button onClick={()=>setAP(true)} style={{background:"#fe2c55",color:"#fff",border:"none",padding:"9px 18px",borderRadius:100,fontSize:12,cursor:"pointer",fontFamily:"Poppins,sans-serif",fontWeight:700}}>+ Add Product</button></div>
 {sellerProds.length===0
 ?<div style={{textAlign:"center",padding:"60px 0"}}><p style={{fontSize:48,marginBottom:12}}></p><p style={{color:"#555",marginBottom:16}}>No products yet</p><button onClick={()=>setAP(true)} style={{background:"#fe2c55",color:"#fff",border:"none",padding:"11px 24px",borderRadius:100,fontSize:13,cursor:"pointer",fontFamily:"Poppins,sans-serif",fontWeight:600}}>+ Add First Product</button></div>
 :<div style={{display:"flex",flexDirection:"column",gap:10}}>{sellerProds.map((p,i)=>(
 <div key={i} style={{background:"#ffffff",border:"1px solid #1a1a1a",borderRadius:12,padding:14,display:"flex",gap:12,alignItems:"center"}}><div style={{width:50,height:50,borderRadius:11,background:"rgba(254,44,85,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>{p.emoji}</div><div style={{flex:1,minWidth:0}}><p style={{fontSize:13,fontWeight:600,marginBottom:3}}>{p.title}</p><div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}><p style={{fontSize:11,color:"#555"}}>Stock: {p.stock}</p>
 {p.flashSale&&(<span style={{fontSize:10,background:"rgba(254,44,85,0.1)",color:"#fe2c55",padding:"2px 7px",borderRadius:100}}>Flash Sale</span>)}
 {p.freeShipping&&(<span style={{fontSize:10,background:"rgba(37,244,238,0.1)",color:"#25f4ee",padding:"2px 7px",borderRadius:100}}>Free Ship</span>)}
 {p.featured&&(<span style={{fontSize:10,background:"rgba(251,191,36,0.1)",color:"#fbbf24",padding:"2px 7px",borderRadius:100}}>Featured</span>)}
 {p.promoCode&&<span style={{fontSize:10,background:"rgba(52,211,153,0.1)",color:"#34d399",padding:"2px 7px",borderRadius:100}}> {p.promoCode}</span>}
 </div></div><div style={{textAlign:"right",flexShrink:0,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}><p style={{fontFamily:"Poppins,sans-serif",fontWeight:700,fontSize:13,color:"#fe2c55"}}>Rs {p.price.toLocaleString()}</p><span style={{fontSize:10,padding:"3px 9px",background:(p.status==="active"||p.status==="live")?"rgba(52,211,153,0.1)":"rgba(251,191,36,0.1)",color:(p.status==="active"||p.status==="live")?"#34d399":"#fbbf24",border:`1px solid ${(p.status==="active"||p.status==="live")?"#34d39930":"#fbbf2430"}`,borderRadius:100}}>{(p.status==="active"||p.status==="live")?" Live":"⏳ Pending"}</span><button onClick={()=>setEditProd(p)}
 style={{background:"rgba(37,244,238,0.1)",border:"1px solid rgba(37,244,238,0.2)",color:"#25f4ee",padding:"5px 12px",borderRadius:8,fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>Edit
 </button></div></div>
 ))}</div>}
 </div>}

 {sellerTab==="videos"&&<div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:12}}>
 {sellerVideos.map(v=>(
 <div key={v.id} style={{borderRadius:14,overflow:"hidden",position:"relative",aspectRatio:"9/16",background:"#000",border:"1px solid rgba(0,0,0,0.08)"}}><video src={v.video_url} muted style={{width:"100%",height:"100%",objectFit:"cover"}}/><div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.85),transparent)"}}/><span style={{position:"absolute",top:8,left:8,fontSize:9,fontWeight:700,padding:"3px 8px",borderRadius:100,color:"#fff",background:v.status==="live"?"rgba(37,244,238,0.9)":v.status==="pending"?"rgba(254,44,85,0.9)":"rgba(0,0,0,0.6)"}}>{v.status}</span><div style={{position:"absolute",bottom:9,left:9,right:9}}><p style={{fontSize:10,color:"#fff",fontWeight:600,lineHeight:1.4,marginBottom:2,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:1,WebkitBoxOrient:"vertical"}}>{v.title||"Untitled"}</p><p style={{fontSize:9,color:"rgba(255,255,255,0.75)",lineHeight:1.4,marginBottom:4,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:1,WebkitBoxOrient:"vertical"}}>{(v.hashtags||[]).map(h=>"#"+h).join(" ")}</p><div style={{display:"flex",gap:8}}><span style={{fontSize:10,color:"#fe2c55"}}> {v.likes||0}</span></div></div></div>
 ))}
 <button onClick={()=>setShowUploadVideo(true)} style={{borderRadius:14,aspectRatio:"9/16",background:"#0a0a0a",border:"2px dashed #fe2c5540",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,cursor:"pointer",transition:"all 0.2s"}}
 onMouseEnter={e=>{e.currentTarget.style.borderColor="#fe2c55";e.currentTarget.style.background="rgba(254,44,85,0.05)";}}
 onMouseLeave={e=>{e.currentTarget.style.borderColor="#fe2c5540";e.currentTarget.style.background="#0a0a0a";}}><span style={{fontSize:28}}></span><span style={{fontSize:11,color:"#fe2c55",fontWeight:600}}>Upload Video</span><span style={{fontSize:10,color:"#999",textAlign:"center",padding:"0 8px"}}>MP4, MOV<br/>Max 100MB</span></button></div></div>}

 {sellerTab==="pending"&&<div>
 {pendingPrds===0&&pendingOrd===0
 ?<div style={{textAlign:"center",padding:"60px 0"}}><p style={{fontSize:48,marginBottom:12}}></p><p style={{color:"#555"}}>All caught up!</p></div>
 :<div style={{display:"flex",flexDirection:"column",gap:10}}>
 {sellerProds.filter(p=>p.status==="pending").map((p,i)=>(
 <div key={i} style={{background:"rgba(251,191,36,0.05)",border:"1px solid rgba(251,191,36,0.2)",borderRadius:12,padding:14,display:"flex",gap:12,alignItems:"center"}}><span style={{fontSize:26}}>{p.emoji}</span><div style={{flex:1}}><p style={{fontSize:13,fontWeight:600,marginBottom:2}}>{p.title}</p><p style={{fontSize:11,color:"#fbbf24"}}>⏳ Awaiting admin review</p></div><span style={{fontSize:11,color:"#fbbf24",background:"rgba(251,191,36,0.1)",padding:"5px 12px",borderRadius:100,fontWeight:600}}>Pending</span></div>
 ))}
 {sellerOrders.filter(o=>o.status==="Processing").map((o,i)=>(
 <div key={i} style={{background:"rgba(37,244,238,0.05)",border:"1px solid rgba(37,244,238,0.2)",borderRadius:12,padding:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><p style={{fontSize:13,fontWeight:600,marginBottom:2}}>{o.id}</p><p style={{fontSize:11,color:"#25f4ee"}}>⏳ Processing — admin will update status</p></div><span style={{fontSize:11,color:"#25f4ee",background:"rgba(37,244,238,0.1)",padding:"5px 12px",borderRadius:100,fontWeight:600}}>Processing</span></div>
 ))}
 </div>}
 </div>}

 {/* FINANCIAL STATEMENT */}
 {sellerTab==="financial"&&(()=>{
 const downloadAnalytics=(period)=>{
 const now=new Date();
 let filteredOrders=sellerOrders;
 if(period==="daily") filteredOrders=sellerOrders.filter(o=>new Date(o.date||o.created_at).toDateString()===now.toDateString());
 else if(period==="weekly"){const w=new Date(now-7*86400000);filteredOrders=sellerOrders.filter(o=>new Date(o.date||o.created_at)>=w);}
 else if(period==="monthly"){const m=new Date(now.getFullYear(),now.getMonth(),1);filteredOrders=sellerOrders.filter(o=>new Date(o.date||o.created_at)>=m);}
 else if(period==="yearly"){const y=new Date(now.getFullYear(),0,1);filteredOrders=sellerOrders.filter(o=>new Date(o.date||o.created_at)>=y);}
 const totalAmt=filteredOrders.reduce((s,o)=>s+(o.total||0),0);
 const rows=[
 ["ShopTok - Sales Analytics Report"],
 [`Period: ${period.charAt(0).toUpperCase()+period.slice(1)}`,`Generated: ${now.toLocaleString("en-PK")}`],
 [""],
 ["Order ID","Product","Quantity","Price","Total","Status","Date"],
 ...filteredOrders.map(o=>[
 o.id||"",
 o.items?.[0]?.title||o.product_title||"",
 o.items?.[0]?.qty||o.quantity||1,
 o.items?.[0]?.price||o.unit_price||0,
 o.total||o.total_amount||0,
 o.status||"",
 o.date||new Date(o.created_at).toLocaleDateString("en-PK")||""
 ]),
 [""],
 ["SUMMARY"],
 ["Total Orders",filteredOrders.length],
 ["Total Revenue","Rs "+totalAmt.toLocaleString()],
 ["Average Order Value","Rs "+(filteredOrders.length?Math.round(totalAmt/filteredOrders.length):0).toLocaleString()],
 ];
 const csv=rows.map(r=>r.map(c=>`"${c}"`).join(",")).join("\n");
 const blob=new Blob([csv],{type:"text/csv"});
 const url=URL.createObjectURL(blob);
 const a=document.createElement("a");
 a.href=url;a.download=`shoptok-analytics-${period}-${now.toISOString().slice(0,10)}.csv`;
 a.click();URL.revokeObjectURL(url);
 };
 return(
 <div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
 {[["Total Revenue","Rs "+totalRev.toLocaleString(),"#34d399"],["Total Orders",sellerOrders.length.toString(),"#25f4ee"],["Pending Payout","Rs 0","#fbbf24"],["Withdrawn","Rs 0","#a78bfa"]].map(([l,v,c])=>(
 <div key={l} style={{background:"#ffffff",border:"1px solid #1a1a1a",borderRadius:14,padding:18}}><p style={{fontSize:11,color:"#555",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em"}}>{l}</p><p style={{fontFamily:"Poppins,sans-serif",fontWeight:800,fontSize:22,color:c}}>{v}</p></div>
 ))}
 </div>

 {/* Download Analytics */}
 <div style={{background:"#ffffff",border:"1px solid rgba(52,211,153,0.2)",borderRadius:14,padding:20,marginBottom:20}}><p style={{fontWeight:700,marginBottom:6,color:"#34d399"}}>Download Analytics (Excel/CSV)</p><p style={{fontSize:12,color:"#555",marginBottom:16}}>Download your sales data for any time period</p><div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
 {[["Daily","daily",""],["Weekly","weekly",""],["Monthly","monthly",""],["Yearly","yearly",""]].map(([label,period,icon])=>(
 <button key={period} onClick={()=>downloadAnalytics(period)}
 style={{padding:"12px 8px",background:"rgba(52,211,153,0.08)",border:"1px solid rgba(52,211,153,0.25)",borderRadius:10,color:"#34d399",cursor:"pointer",fontFamily:"Poppins,sans-serif",fontWeight:700,fontSize:12,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}
 onMouseEnter={e=>e.currentTarget.style.background="rgba(52,211,153,0.15)"}
 onMouseLeave={e=>e.currentTarget.style.background="rgba(52,211,153,0.08)"}><span style={{fontSize:20}}>{icon}</span>
 {label}
 </button>
 ))}
 </div></div><div style={{background:"#ffffff",border:"1px solid #1a1a1a",borderRadius:14,padding:20}}><p style={{fontWeight:700,marginBottom:16,color:"#fe2c55"}}>Monthly Summary</p>
 {["January","February","March","April","May","June"].map((m,i)=>(
 <div key={m} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid rgba(0,0,0,0.05)"}}><span style={{fontSize:13,color:"rgba(0,0,0,0.6)"}}>{m} 2026</span><span style={{fontSize:13,fontWeight:600,color:"#34d399"}}>Rs {(i*2500).toLocaleString()}</span></div>
 ))}
 </div></div>
 );
 })()}

 {/* MY WALLET */}
 {sellerTab==="wallet"&&<div><div style={{background:"linear-gradient(135deg,#fe2c55,#ff6b35)",borderRadius:20,padding:28,marginBottom:20,position:"relative",overflow:"hidden"}}><div style={{position:"absolute",top:-20,right:-20,width:120,height:120,borderRadius:"50%",background:"rgba(0,0,0,0.1)"}}/><p style={{fontSize:12,color:"rgba(0,0,0,0.7)",marginBottom:8}}>Available Balance</p><p style={{fontFamily:"Poppins,sans-serif",fontWeight:800,fontSize:36,color:"#111",marginBottom:4}}>Rs 0</p><p style={{fontSize:12,color:"rgba(0,0,0,0.7)"}}>ShopTok Seller Wallet</p></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}><button style={{padding:"14px",background:"#fe2c55",border:"none",borderRadius:12,color:"#fff",fontFamily:"Poppins,sans-serif",fontWeight:700,fontSize:14,cursor:"pointer"}}>Withdraw</button><button style={{padding:"14px",background:"#ffffff",border:"1px solid #1a1a1a",borderRadius:12,color:"#111",fontFamily:"Poppins,sans-serif",fontWeight:700,fontSize:14,cursor:"pointer"}}>Add Funds</button></div><div style={{background:"#ffffff",border:"1px solid #1a1a1a",borderRadius:14,padding:20}}><p style={{fontWeight:700,marginBottom:16,color:"#fe2c55"}}>Transaction History</p><div style={{textAlign:"center",padding:"30px 0"}}><p style={{fontSize:32,marginBottom:8}}></p><p style={{color:"#555",fontSize:13}}>No transactions yet</p></div></div></div>}

 {/* FUND RECORD */}
 {sellerTab==="funds"&&<div><div style={{background:"#ffffff",border:"1px solid #1a1a1a",borderRadius:14,padding:20}}><p style={{fontWeight:700,marginBottom:16,color:"#fe2c55"}}>Fund Records</p><div style={{display:"flex",gap:8,marginBottom:16}}>
 {["All","Deposit","Withdrawal","Refund"].map(f=>(
 <button key={f} style={{padding:"6px 14px",borderRadius:100,border:"1px solid rgba(0,0,0,0.1)",background:"transparent",color:"rgba(0,0,0,0.5)",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>{f}</button>
 ))}
 </div><div style={{textAlign:"center",padding:"40px 0"}}><p style={{fontSize:40,marginBottom:8}}></p><p style={{color:"#555",fontSize:13}}>No fund records found</p></div></div></div>}

 {/* REFUND REQUEST */}
 {sellerTab==="refunds"&&<div><div style={{background:"#ffffff",border:"1px solid #1a1a1a",borderRadius:14,padding:20}}><p style={{fontWeight:700,marginBottom:16,color:"#fe2c55"}}>↩ Refund Requests</p><div style={{display:"flex",gap:8,marginBottom:16}}>
 {["All","Pending","Approved","Rejected"].map(f=>(
 <button key={f} style={{padding:"6px 14px",borderRadius:100,border:"1px solid rgba(0,0,0,0.1)",background:"transparent",color:"rgba(0,0,0,0.5)",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>{f}</button>
 ))}
 </div><div style={{textAlign:"center",padding:"40px 0"}}><p style={{fontSize:40,marginBottom:8}}></p><p style={{color:"#555",fontSize:13}}>No refund requests</p></div></div></div>}

 {/* PRODUCT REVIEW */}
 {sellerTab==="reviews"&&<div><div style={{background:"#ffffff",border:"1px solid #1a1a1a",borderRadius:14,padding:20}}><p style={{fontWeight:700,marginBottom:16,color:"#fe2c55"}}>⭐ Product Reviews</p><div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:20,textAlign:"center"}}>
 {[5,4,3,2,1].map(s=>(
 <div key={s} style={{background:"rgba(254,44,85,0.05)",border:"1px solid rgba(254,44,85,0.15)",borderRadius:10,padding:"12px 8px"}}><p style={{fontSize:18,marginBottom:4}}>{"⭐".repeat(s)}</p><p style={{fontFamily:"Poppins,sans-serif",fontWeight:700,color:"#fe2c55"}}>0</p></div>
 ))}
 </div><div style={{textAlign:"center",padding:"20px 0"}}><p style={{color:"#555",fontSize:13}}>No reviews yet — reviews appear after buyers purchase</p></div></div></div>}

 {/* PRODUCT WAREHOUSE */}
 {sellerTab==="warehouse"&&<div><div style={{background:"#ffffff",border:"1px solid #1a1a1a",borderRadius:14,padding:20}}><p style={{fontWeight:700,marginBottom:16,color:"#fe2c55"}}>Product Warehouse</p><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:20}}>
 {[["Total Stock",sellerProds.reduce((s,p)=>s+(p.stock||0),0).toString(),"#25f4ee"],["Active Products",activePrds.toString(),"#34d399"],["Low Stock","0","#fbbf24"]].map(([l,v,c])=>(
 <div key={l} style={{background:"rgba(0,0,0,0.03)",border:"1px solid rgba(0,0,0,0.07)",borderRadius:12,padding:16,textAlign:"center"}}><p style={{fontFamily:"Poppins,sans-serif",fontWeight:800,fontSize:24,color:c,marginBottom:4}}>{v}</p><p style={{fontSize:11,color:"#555"}}>{l}</p></div>
 ))}
 </div>
 {sellerProds.length===0
 ?<div style={{textAlign:"center",padding:"30px 0"}}><p style={{fontSize:40,marginBottom:8}}></p><p style={{color:"#555",fontSize:13}}>No products in warehouse</p></div>
 :<div style={{display:"flex",flexDirection:"column",gap:8}}>
 {sellerProds.map((p,i)=>(
 <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:14,background:"rgba(0,0,0,0.02)",borderRadius:12,border:"1px solid rgba(0,0,0,0.06)"}}><div style={{width:42,height:42,borderRadius:10,background:`${p.color||"#fe2c55"}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{p.emoji||""}</div><div style={{flex:1}}><p style={{fontSize:13,fontWeight:600}}>{p.title}</p><p style={{fontSize:11,color:"#555"}}>Stock: {p.stock||0} units</p></div><span style={{fontSize:12,fontWeight:700,color:p.stock>10?"#34d399":p.stock>0?"#fbbf24":"#fe2c55"}}>{p.stock>10?"In Stock":p.stock>0?"Low Stock":"Out of Stock"}</span></div>
 ))}
 </div>
 }
 </div></div>}

 {/* BEST SELLERS */}
 {sellerTab==="bestsellers"&&(()=>{
 const sorted=[...sellerProds].sort((a,b)=>(b.sold||0)-(a.sold||0)).slice(0,10);
 const totalOrders=sellerOrders.length;
 const inProcess=sellerOrders.filter(o=>o.status==="Processing"||o.status==="Confirmed").length;
 const completed=sellerOrders.filter(o=>o.status==="Delivered").length;
 const cancelled=sellerOrders.filter(o=>o.status==="Cancelled").length;
 return(
 <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:16,alignItems:"start"}}>

 {/* LEFT: Top 10 Table */}
 <div style={{background:"#ffffff",border:"1px solid #1a1a1a",borderRadius:14,overflow:"hidden"}}><div style={{padding:"16px 20px",borderBottom:"1px solid rgba(0,0,0,0.06)"}}><p style={{fontWeight:700,fontSize:15,color:"#fe2c55"}}>TOP 10 Best-Selling Items</p></div><div style={{display:"grid",gridTemplateColumns:"44px 1fr 110px 120px",padding:"10px 20px",background:"rgba(0,0,0,0.03)",borderBottom:"1px solid rgba(0,0,0,0.06)"}}>
 {["#","Product Name","Price","Sales Volume"].map(h=>(
 <p key={h} style={{fontSize:11,color:"#555",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.04em"}}>{h}</p>
 ))}
 </div>
 {sorted.length===0
 ?<div style={{textAlign:"center",padding:"50px 0"}}><p style={{fontSize:40,marginBottom:10}}></p><p style={{color:"#555",fontSize:13}}>No products yet — add products to see best sellers</p></div>
 :<div>
 {sorted.map((p,i)=>(
 <div key={i} style={{display:"grid",gridTemplateColumns:"44px 1fr 110px 120px",padding:"13px 20px",borderBottom:"1px solid rgba(0,0,0,0.04)",alignItems:"center",background:i%2===0?"transparent":"rgba(0,0,0,0.02)"}}><div style={{width:26,height:26,borderRadius:"50%",background:i===0?"rgba(251,191,36,0.15)":i===1?"rgba(0,0,0,0.06)":i===2?"rgba(254,44,85,0.1)":"rgba(0,0,0,0.04)",display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{fontSize:12,fontWeight:700,color:i===0?"#fbbf24":i===1?"#888":i===2?"#fe2c55":"#555"}}>{i+1}</p></div><p style={{fontSize:13,color:"#ddd",lineHeight:1.4,paddingRight:12}}>{p.emoji} {p.title}</p><p style={{fontSize:13,color:"#888"}}>Rs {(p.price||0).toLocaleString()}</p><p style={{fontSize:13,color:"#34d399",fontWeight:600}}>{(p.sold||0).toLocaleString()}</p></div>
 ))}
 </div>
 }
 </div>

 {/* RIGHT: Order Statistics */}
 <div style={{background:"#ffffff",border:"1px solid #1a1a1a",borderRadius:14,overflow:"hidden"}}><div style={{padding:"16px 20px",borderBottom:"1px solid rgba(0,0,0,0.06)"}}><p style={{fontWeight:700,fontSize:15,color:"#fe2c55"}}>Order Statistics</p></div><div style={{padding:"20px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
 {[
 [totalOrders,"Total Orders","#334155"],
 [inProcess,"In Process","#334155"],
 [completed,"Completed","#14a37f"],
 [cancelled,"Cancelled","#334155"],
 ].map(([val,label,color])=>(
 <div key={label} style={{textAlign:"center",padding:"14px 10px",background:"rgba(0,0,0,0.03)",borderRadius:12,border:`1px solid ${color}20`}}><p style={{fontFamily:"Poppins,sans-serif",fontWeight:800,fontSize:28,color,marginBottom:4}}>{val}</p><p style={{fontSize:11,color:"#555"}}>{label}</p></div>
 ))}
 </div><div style={{padding:"16px 20px",borderTop:"1px solid rgba(0,0,0,0.06)",display:"flex",justifyContent:"center"}}><div style={{width:80,height:80,borderRadius:"50%",border:"2px solid #14a37f",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:2}}><p style={{fontSize:10,color:"#14a37f",fontWeight:700}}></p><p style={{fontSize:12,color:"#14a37f",fontWeight:800}}>Verified</p><p style={{fontSize:10,color:"#14a37f",fontWeight:700}}></p></div></div></div></div>
 );
 })()}

 {/* STORE SETTING */}
 {sellerTab==="storesetting"&&(()=>{
 const handleLogoChange=e=>{const fi=e.target.files[0];if(!fi)return;const r=new FileReader();r.onload=ev=>setStoreLogo(ev.target.result);r.readAsDataURL(fi);};
 const handleBanner=(idx,e)=>{const fi=e.target.files[0];if(!fi)return;const r=new FileReader();r.onload=ev=>{const b=[...banners];b[idx]=ev.target.result;setBanners(b);};r.readAsDataURL(fi);};
 const handleSave=async()=>{
 setStoreSaving(true);
 try{
 const token=localStorage.getItem("shopToken");
 await fetch(`${API}/auth/profile`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
 body:JSON.stringify({name:storeForm.contactPerson,phone:storeForm.storeMobile,password:storeForm.newPassword&&storeForm.newPassword===storeForm.confirmPassword?storeForm.newPassword:undefined})});
 showToast(" Store settings saved!");
 }catch(e){showToast(" Save failed");}
 setStoreSaving(false);
 };
 return(
 <div style={{display:"flex",flexDirection:"column",gap:0,background:"#ffffff",minHeight:"100%"}}>

 {/* Header */}
 <div style={{display:"flex",alignItems:"center",gap:12,padding:"16px 0 20px"}}><button onClick={()=>setST("overview")} style={{background:"rgba(0,0,0,0.06)",border:"none",color:"#111",width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>←</button><div><h2 style={{fontFamily:"Poppins,sans-serif",fontWeight:800,fontSize:18}}>Store Setting</h2><p style={{fontSize:12,color:"rgba(0,0,0,0.4)"}}>Filters · Store Setting</p></div></div>

 {/* Store Information */}
 <div style={{background:"#ffffff",border:"1px solid #1a1a1a",borderRadius:14,padding:22,marginBottom:14}}><h3 style={{fontFamily:"Poppins,sans-serif",fontWeight:700,fontSize:14,marginBottom:18,color:"#111"}}>Store Information</h3>

 {/* Store Name */}
 <div style={{display:"grid",gridTemplateColumns:"140px 1fr",alignItems:"center",gap:12,marginBottom:14}}><label style={{fontSize:12,color:"rgba(0,0,0,0.5)",textAlign:"right"}}>Store Name</label><input value={storeForm.storeName} onChange={e=>setStoreForm({...storeForm,storeName:e.target.value})}
 style={{background:"rgba(0,0,0,0.06)",border:"1px solid rgba(0,0,0,0.1)",borderRadius:8,padding:"9px 12px",color:"#111",fontSize:13,fontFamily:"inherit",outline:"none",width:"100%"}}/></div>

 {/* Store Logo */}
 <div style={{display:"grid",gridTemplateColumns:"140px 1fr",alignItems:"flex-start",gap:12,marginBottom:14}}><label style={{fontSize:12,color:"rgba(0,0,0,0.5)",textAlign:"right",paddingTop:8}}>Store Logo</label><label style={{cursor:"pointer",display:"inline-block"}}><div style={{width:80,height:80,borderRadius:10,background:"rgba(0,0,0,0.06)",border:"2px dashed rgba(0,0,0,0.15)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",position:"relative"}}>
 {storeLogo?<img src={storeLogo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
 :<div style={{textAlign:"center"}}><p style={{fontSize:22}}></p><p style={{fontSize:10,color:"#555",marginTop:4}}>Upload</p></div>}
 </div><input type="file" accept="image/*" style={{display:"none"}} onChange={handleLogoChange}/></label></div>

 {/* Contact Person */}
 <div style={{display:"grid",gridTemplateColumns:"140px 1fr",alignItems:"center",gap:12,marginBottom:14}}><label style={{fontSize:12,color:"rgba(0,0,0,0.5)",textAlign:"right"}}>Contact Person</label><input value={storeForm.contactPerson} onChange={e=>setStoreForm({...storeForm,contactPerson:e.target.value})}
 style={{background:"rgba(0,0,0,0.06)",border:"1px solid rgba(0,0,0,0.1)",borderRadius:8,padding:"9px 12px",color:"#111",fontSize:13,fontFamily:"inherit",outline:"none",width:"100%"}}/></div>

 {/* Store Mobile */}
 <div style={{display:"grid",gridTemplateColumns:"140px 1fr",alignItems:"center",gap:12,marginBottom:14}}><label style={{fontSize:12,color:"rgba(0,0,0,0.5)",textAlign:"right"}}>Store Mobile</label><input value={storeForm.storeMobile} onChange={e=>setStoreForm({...storeForm,storeMobile:e.target.value})} placeholder="03001234567"
 style={{background:"rgba(0,0,0,0.06)",border:"1px solid rgba(0,0,0,0.1)",borderRadius:8,padding:"9px 12px",color:"#111",fontSize:13,fontFamily:"inherit",outline:"none",width:"100%"}}/></div>

 {/* Store Profile */}
 <div style={{display:"grid",gridTemplateColumns:"140px 1fr",alignItems:"flex-start",gap:12,marginBottom:14}}><label style={{fontSize:12,color:"rgba(0,0,0,0.5)",textAlign:"right",paddingTop:8}}>Store Profile</label><div><textarea value={storeForm.storeProfile} onChange={e=>setStoreForm({...storeForm,storeProfile:e.target.value})} rows={3}
 style={{background:"rgba(0,0,0,0.06)",border:"1px solid rgba(0,0,0,0.1)",borderRadius:8,padding:"9px 12px",color:"#111",fontSize:13,fontFamily:"inherit",outline:"none",width:"100%",resize:"vertical"}}/><p style={{fontSize:10,color:"rgba(0,0,0,0.3)",marginTop:3}}>up to 500 words</p></div></div>

 {/* Welcome Message */}
 <div style={{display:"grid",gridTemplateColumns:"140px 1fr",alignItems:"flex-start",gap:12,marginBottom:20}}><label style={{fontSize:12,color:"rgba(0,0,0,0.5)",textAlign:"right",paddingTop:8}}>Welcome to the store</label><div><textarea value={storeForm.welcomeMsg} onChange={e=>setStoreForm({...storeForm,welcomeMsg:e.target.value})} rows={3}
 style={{background:"rgba(0,0,0,0.06)",border:"1px solid rgba(0,0,0,0.1)",borderRadius:8,padding:"9px 12px",color:"#111",fontSize:13,fontFamily:"inherit",outline:"none",width:"100%",resize:"vertical"}}/><p style={{fontSize:10,color:"rgba(0,0,0,0.3)",marginTop:3}}>up to 500 words</p></div></div><div style={{display:"flex",justifyContent:"flex-end"}}><button onClick={handleSave} disabled={storeSaving}
 style={{background:"linear-gradient(135deg,#fe2c55,#ff6b35)",border:"none",color:"#fff",padding:"10px 28px",borderRadius:8,fontFamily:"Poppins,sans-serif",fontWeight:700,fontSize:13,cursor:"pointer"}}>
 {storeSaving?"Saving...":"Save"}
 </button></div></div>

 {/* Banner Settings */}
 <div style={{background:"#ffffff",border:"1px solid #1a1a1a",borderRadius:14,padding:22,marginBottom:14}}><h3 style={{fontFamily:"Poppins,sans-serif",fontWeight:700,fontSize:14,marginBottom:18,color:"#111"}}>Banner Settings</h3>
 {["Store Banner 1 (1190x300)","Store Banner 2 (1190x300)","Store Banner 3 (1190x300)"].map((label,idx)=>(
 <div key={idx} style={{marginBottom:16}}><p style={{fontSize:12,color:"rgba(0,0,0,0.5)",marginBottom:8}}>{label}</p><label style={{cursor:"pointer",display:"block"}}><div style={{width:"100%",height:120,borderRadius:10,background:"rgba(0,0,0,0.04)",border:"2px dashed rgba(0,0,0,0.1)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",position:"relative"}}>
 {banners[idx]
 ?<img src={banners[idx]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
 :<div style={{textAlign:"center"}}><p style={{fontSize:28,marginBottom:6}}></p><p style={{fontSize:12,color:"rgba(0,0,0,0.3)"}}>Click to upload banner</p><p style={{fontSize:11,color:"rgba(0,0,0,0.2)",marginTop:3}}>1190×300px recommended</p></div>}
 </div><input type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleBanner(idx,e)}/></label></div>
 ))}
 </div>

 {/* Personal Information */}
 <div style={{background:"#ffffff",border:"1px solid #1a1a1a",borderRadius:14,padding:22,marginBottom:14}}><h3 style={{fontFamily:"Poppins,sans-serif",fontWeight:700,fontSize:14,marginBottom:18,color:"#111"}}>Personal Information</h3>

 {/* Avatar */}
 <div style={{display:"grid",gridTemplateColumns:"140px 1fr",alignItems:"center",gap:12,marginBottom:16}}><label style={{fontSize:12,color:"rgba(0,0,0,0.5)",textAlign:"right"}}>Avatar</label><div style={{display:"flex",alignItems:"center",gap:12}}><div style={{width:48,height:48,borderRadius:"50%",overflow:"hidden",border:"2px solid #fe2c55",flexShrink:0}}>
 {profileImg?<img src={profileImg} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
 :<div style={{width:"100%",height:"100%",background:"linear-gradient(135deg,#fe2c55,#ff6b35)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{user?.avatar||""}</div>}
 </div><button onClick={()=>setPE(true)} style={{background:"rgba(254,44,85,0.1)",border:"1px solid rgba(254,44,85,0.3)",color:"#fe2c55",padding:"6px 14px",borderRadius:8,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Change</button></div></div>

 {/* Name */}
 <div style={{display:"grid",gridTemplateColumns:"140px 1fr",alignItems:"center",gap:12,marginBottom:16}}><label style={{fontSize:12,color:"rgba(0,0,0,0.5)",textAlign:"right"}}>Name</label><div style={{display:"flex",alignItems:"center",gap:10}}><input value={storeForm.contactPerson} onChange={e=>setStoreForm({...storeForm,contactPerson:e.target.value})}
 style={{background:"rgba(0,0,0,0.06)",border:"1px solid rgba(0,0,0,0.1)",borderRadius:8,padding:"9px 12px",color:"#111",fontSize:13,fontFamily:"inherit",outline:"none",flex:1}}/><span style={{background:"rgba(52,211,153,0.1)",color:"#34d399",fontSize:11,padding:"4px 10px",borderRadius:100,whiteSpace:"nowrap"}}>Verified</span><button style={{background:"transparent",border:"none",color:"#fe2c55",fontSize:12,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>New</button></div></div>

 {/* Phone/Password */}
 <div style={{display:"grid",gridTemplateColumns:"140px 1fr",alignItems:"center",gap:12,marginBottom:16}}><label style={{fontSize:12,color:"rgba(0,0,0,0.5)",textAlign:"right"}}>Phone/Password</label><div style={{display:"flex",alignItems:"center",gap:10}}><input value={storeForm.storeMobile} onChange={e=>setStoreForm({...storeForm,storeMobile:e.target.value})}
 style={{background:"rgba(0,0,0,0.06)",border:"1px solid rgba(0,0,0,0.1)",borderRadius:8,padding:"9px 12px",color:"#111",fontSize:13,fontFamily:"inherit",outline:"none",flex:1}}/><button onClick={()=>setPE(true)} style={{background:"transparent",border:"none",color:"#fe2c55",fontSize:12,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>Change</button></div></div>

 {/* Login Password */}
 <div style={{display:"grid",gridTemplateColumns:"140px 1fr",alignItems:"center",gap:12,marginBottom:20}}><label style={{fontSize:12,color:"rgba(0,0,0,0.5)",textAlign:"right"}}>Login Password</label><div style={{display:"flex",alignItems:"center",gap:10}}><input type="password" placeholder="••••••••"
 style={{background:"rgba(0,0,0,0.06)",border:"1px solid rgba(0,0,0,0.1)",borderRadius:8,padding:"9px 12px",color:"#111",fontSize:13,fontFamily:"inherit",outline:"none",flex:1}}/><button onClick={()=>setPE(true)} style={{background:"transparent",border:"none",color:"#fe2c55",fontSize:12,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>Change</button></div></div><div style={{display:"flex",justifyContent:"flex-end"}}><button onClick={handleSave} disabled={storeSaving}
 style={{background:"linear-gradient(135deg,#fe2c55,#ff6b35)",border:"none",color:"#fff",padding:"10px 28px",borderRadius:8,fontFamily:"Poppins,sans-serif",fontWeight:700,fontSize:13,cursor:"pointer"}}>
 {storeSaving?"Saving...":"Save"}
 </button></div></div></div>
 );
 })()}

 {/* VENTURE ALLIANCE */}
 {sellerTab==="venture"&&<div><div style={{background:"linear-gradient(135deg,#0a0a1a,#1a0a2e)",border:"1px solid rgba(167,139,250,0.2)",borderRadius:20,padding:28,marginBottom:16,textAlign:"center"}}><p style={{fontSize:40,marginBottom:12}}></p><h2 style={{fontFamily:"Poppins,sans-serif",fontWeight:800,fontSize:22,marginBottom:8,color:"#a78bfa"}}>Venture Alliance Program</h2><p style={{fontSize:13,color:"rgba(255,255,255,0.65)",lineHeight:1.7,marginBottom:20}}>Partner with ShopTok and grow your business. Earn commissions, get priority support, and access exclusive seller benefits.</p><button style={{padding:"12px 28px",background:"linear-gradient(135deg,#a78bfa,#6d28d9)",border:"none",borderRadius:12,color:"#fff",fontFamily:"Poppins,sans-serif",fontWeight:700,fontSize:14,cursor:"pointer"}}>Join Alliance →</button></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
 {[[" Priority Support","Get dedicated seller support 24/7"],[" Higher Commissions","Earn up to 15% commission on sales"],[" Marketing Boost","Feature your products in ads"],[" Elite Badge","Display verified alliance badge on store"]].map(([t,d])=>(
 <div key={t} style={{background:"#ffffff",border:"1px solid rgba(167,139,250,0.2)",borderRadius:14,padding:16}}><p style={{fontWeight:700,marginBottom:6}}>{t}</p><p style={{fontSize:12,color:"#555",lineHeight:1.6}}>{d}</p></div>
 ))}
 </div></div>}

 {sellerTab==="settings"&&<div style={{display:"flex",flexDirection:"column",gap:14}}><div style={{background:"#ffffff",border:"1px solid #1a1a1a",borderRadius:14,padding:20}}><p style={{fontSize:13,fontWeight:700,color:"#fe2c55",marginBottom:14}}>Notifications</p>
 {[["New order alerts",true],["Payout updates",true],["Promotions",false]].map(([t,on])=>(
 <div key={t} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><span style={{fontSize:13,color:"rgba(0,0,0,0.7)"}}>{t}</span><div style={{width:40,height:22,borderRadius:11,background:on?"#fe2c55":"#222",position:"relative",cursor:"pointer"}}><div style={{position:"absolute",top:3,left:on?19:3,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/></div></div>
 ))}
 </div><div style={{background:"rgba(254,44,85,0.05)",border:"1px solid rgba(254,44,85,0.15)",borderRadius:14,padding:18}}><p style={{fontSize:13,fontWeight:700,color:"#fe2c55",marginBottom:12}}>Account</p><div style={{display:"flex",gap:10}}><Btn variant="ghost" small onClick={()=>setPE(true)}>Edit Profile</Btn><Btn variant="danger" small onClick={logout}>Log Out</Btn></div></div></div>}
 </div></div>
 )}

 {showUploadVideo&&<UploadVideoModal onClose={()=>setShowUploadVideo(false)} onUploaded={loadSellerVideos} showToast={showToast}/>}

 {/* BUYER PROFILE */}
 {page==="profile"&&(
 <div style={{display:"flex",width:"100%",minHeight:"calc(100vh - 60px)"}}><Sidebar user={user} profileImg={profileImg} tab={profileTab} setTab={setPT} onAddProduct={()=>{}} onLogout={logout} onEditProfile={()=>setPE(true)} tabs={BUYER_TABS} showAdd={false}/><div style={{flex:1,overflowY:"auto",overflowX:"hidden",padding:"26px 28px 60px",minWidth:0}}><div style={{marginBottom:18}}><h1 style={{fontFamily:"Poppins,sans-serif",fontWeight:800,fontSize:22,marginBottom:3}}>
 {{orders:" My Orders",wishlist:" Wishlist",reviews:"⭐ Reviews",settings:" Settings"}[profileTab]}
 </h1><p style={{color:"rgba(0,0,0,0.4)",fontSize:13}}>Welcome, {user?.name} </p></div><div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:22,background:"#ffffff",border:"1px solid #1a1a1a",borderRadius:12,padding:16}}>
 {[[buyerOrders.length.toString(),"Orders"],[likedP.size.toString(),"Wishlist"],["0","Reviews"],["Rs "+buyerOrders.reduce((s,o)=>s+o.total,0).toLocaleString(),"Spent"]].map(([n,l])=>(
 <div key={l} style={{textAlign:"center"}}><div style={{fontFamily:"Poppins,sans-serif",fontWeight:800,fontSize:16,color:"#fe2c55"}}>{n}</div><div style={{fontSize:11,color:"rgba(0,0,0,0.35)",marginTop:2}}>{l}</div></div>
 ))}
 </div>

 {profileTab==="orders"&&<div>
 {buyerOrders.length===0
 ?<div style={{textAlign:"center",padding:"60px 0"}}><p style={{fontSize:48,marginBottom:12}}></p><p style={{color:"rgba(0,0,0,0.4)",marginBottom:16}}>No orders yet</p><button onClick={()=>setPage("shop")} style={{background:"#fe2c55",color:"#fff",border:"none",padding:"11px 22px",borderRadius:100,cursor:"pointer",fontFamily:"Poppins,sans-serif",fontWeight:600,fontSize:13}}>Browse Shop</button></div>
 :<div style={{display:"flex",flexDirection:"column",gap:12}}>{buyerOrders.map((order,i)=>(
 <div key={i} style={{background:"#ffffff",border:"1px solid #1a1a1a",borderRadius:14,overflow:"hidden"}}><div style={{padding:"13px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #1a1a1a"}}><div><span style={{fontFamily:"Poppins,sans-serif",fontWeight:700,fontSize:14}}>{order.id}</span><span style={{fontSize:11,color:"rgba(0,0,0,0.35)",marginLeft:10}}>{order.date}</span></div><div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:11,fontWeight:700,color:order.statusColor,background:order.statusColor+"18",padding:"4px 9px",borderRadius:100}}>● {order.status}</span><span style={{fontFamily:"Poppins,sans-serif",fontWeight:700,fontSize:13,color:"#fe2c55"}}>Rs {order.total.toLocaleString()}</span></div></div><div style={{padding:"12px 16px",display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}><div style={{display:"flex",gap:6}}>{order.items.map((p,j)=>(<div key={j} style={{width:36,height:36,borderRadius:8,background:`${p.color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{p.emoji}</div>))}</div><div style={{flex:1}}><p style={{fontSize:12,color:"rgba(0,0,0,0.5)"}}>{order.items.map(p=>p.title).join(", ")}</p></div><button onClick={()=>{order.items.forEach(p=>addToCart(p));showToast(" Re-added!");}} style={{padding:"7px 14px",background:"rgba(254,44,85,0.1)",border:"1px solid rgba(254,44,85,0.25)",borderRadius:100,color:"#fe2c55",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Reorder</button></div>
 {/* Tracking bar */}
 <div style={{padding:"10px 16px 14px"}}><div style={{display:"flex",alignItems:"center",gap:0}}>
 {["Placed","Confirmed","Shipped","Delivered"].map((s,si)=>{
 const done=["Placed","Confirmed"].includes(order.status)||si===0||(order.status==="Shipped"&&si<=2)||(order.status==="Delivered"&&si<=3);
 return(
 <div key={s} style={{display:"flex",alignItems:"center",flex:si<3?1:"auto"}}><div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}><div style={{width:18,height:18,borderRadius:"50%",background:done?"#34d399":"#222",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9}}>{done?"":""}</div><span style={{fontSize:9,color:done?"#34d399":"#444",whiteSpace:"nowrap"}}>{s}</span></div>
 {si<3&&(<div style={{flex:1,height:2,background:done?"#34d399":"#222",margin:"0 4px",marginBottom:14}}/>)}
 </div>
 );
 })}
 </div></div></div>
 ))}</div>}
 </div>}

 {profileTab==="wishlist"&&<div>
 {likedP.size===0
 ?<div style={{textAlign:"center",padding:"60px 0"}}><p style={{fontSize:48,marginBottom:12}}></p><p style={{color:"rgba(0,0,0,0.4)",marginBottom:16}}>Wishlist empty</p><button onClick={()=>setPage("shop")} style={{background:"#fe2c55",color:"#fff",border:"none",padding:"11px 22px",borderRadius:100,cursor:"pointer",fontFamily:"Poppins,sans-serif",fontWeight:600,fontSize:13}}>Browse Shop</button></div>
 :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:12}}>
 {CATALOGUE.filter(p=>likedP.has(p.id)).map(p=>(
 <div key={p.id} style={{background:"#ffffff",border:"1px solid #1a1a1a",borderRadius:14,overflow:"hidden"}}><div style={{aspectRatio:"1",background:`${p.color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:52,position:"relative"}}>
 {p.emoji}
 <button onClick={()=>toggleLP(p.id)} style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,0.5)",border:"none",width:24,height:24,borderRadius:"50%",cursor:"pointer",fontSize:12}}></button></div><div style={{padding:"10px 12px"}}><p style={{fontSize:12,fontWeight:500,lineHeight:1.4,marginBottom:7,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{p.title}</p><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontFamily:"Poppins,sans-serif",fontWeight:700,fontSize:13,color:"#fe2c55"}}>Rs {p.price.toLocaleString()}</span><button onClick={()=>addToCart(p)} style={{background:"#fe2c55",border:"none",width:24,height:24,borderRadius:"50%",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}>+</button></div></div></div>
 ))}
 </div>}
 </div>}

 {profileTab==="reviews"&&<div style={{textAlign:"center",padding:"60px 0"}}><p style={{fontSize:48,marginBottom:12}}>⭐</p><p style={{color:"rgba(0,0,0,0.4)"}}>No reviews yet</p></div>}

 {profileTab==="settings"&&<div style={{display:"flex",flexDirection:"column",gap:14}}><div style={{background:"#ffffff",border:"1px solid #1a1a1a",borderRadius:14,padding:20}}><p style={{fontSize:13,color:"#25f4ee",fontWeight:700,marginBottom:14}}>Notifications</p>
 {[["Order updates",true],["Promotions",true],["Flash sales",false]].map(([t,on])=>(
 <div key={t} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><span style={{fontSize:13,color:"rgba(0,0,0,0.7)"}}>{t}</span><div style={{width:40,height:22,borderRadius:11,background:on?"#fe2c55":"#222",position:"relative",cursor:"pointer"}}><div style={{position:"absolute",top:3,left:on?19:3,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/></div></div>
 ))}
 </div><div style={{background:"rgba(37,244,238,0.05)",border:"1px solid rgba(37,244,238,0.2)",borderRadius:14,padding:18}}><p style={{fontSize:13,fontWeight:700,color:"#25f4ee",marginBottom:6}}>Sell on ShopTok</p><p style={{fontSize:12,color:"rgba(0,0,0,0.4)",marginBottom:12}}>Apne isi account se seller ban sakte ho — naya account banana zaroori nahi!</p><Btn variant="outline" small onClick={()=>goAuth(S.ONBOARD)}>Become a Seller</Btn></div><div style={{background:"rgba(254,44,85,0.05)",border:"1px solid rgba(254,44,85,0.15)",borderRadius:14,padding:18}}><p style={{fontSize:13,fontWeight:700,color:"#fe2c55",marginBottom:12}}>Account</p><div style={{display:"flex",gap:10}}><Btn variant="ghost" small onClick={()=>setPE(true)}>Edit Profile</Btn><Btn variant="danger" small onClick={logout}>Log Out</Btn></div></div></div>}
 </div></div>
 )}
 </div>
 {["track-order","return-refund","delivery-info","seller-guide","privacy-policy","terms-of-service"].includes(page)&&(
 <PolicyPage page={page} setPage={setPage}/>
 )}
 {page==="sitemap"&&(
 <CategorySitemap setPage={setPage} setCat={setCat}/>
 )}

 {showTop&&(
 <button onClick={()=>window.scrollTo({top:0,behavior:"smooth"})} style={{position:"fixed",right:26,bottom:70,width:40,height:40,borderRadius:"50%",background:"#fff",border:"1px solid #e5e5e5",boxShadow:"0 4px 16px rgba(0,0,0,0.15)",cursor:"pointer",fontSize:16,color:"#333",display:"flex",alignItems:"center",justifyContent:"center",zIndex:90}}>↑</button>
 )}
 </div></div>
 );
};

export default MainApp;