import { useState, useEffect, useRef } from "react";

export const StorePanel=({store,detail,onClose,addToCart,showToast,setSP})=>(
 <div style={{position:"fixed",inset:0,background:"#f7f7f8",zIndex:500,overflowY:"auto",animation:"fadeUp 0.3s ease"}}>
 {/* Header */}
 <div style={{position:"sticky",top:0,zIndex:10,background:"rgba(255,255,255,0.97)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(0,0,0,0.07)",padding:"13px 24px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><button onClick={onClose} style={{width:36,height:36,borderRadius:"50%",background:"rgba(0,0,0,0.07)",border:"none",color:"#111",cursor:"pointer",fontSize:17,display:"flex",alignItems:"center",justifyContent:"center"}}>←</button><span style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:700,fontSize:14,color:"rgba(0,0,0,0.8)"}}>Store</span><div style={{width:36}}/></div><div style={{maxWidth:900,margin:"0 auto",paddingBottom:80}}>
 {/* Store Hero */}
 <div style={{background:"linear-gradient(135deg,#fe2c55,#ff6b35)",padding:"48px 24px",textAlign:"center",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",top:-60,right:-60,width:200,height:200,borderRadius:"50%",background:"rgba(0,0,0,0.08)"}}/><div style={{position:"absolute",bottom:-40,left:-40,width:160,height:160,borderRadius:"50%",background:"rgba(0,0,0,0.06)"}}/><div style={{width:80,height:80,borderRadius:22,background:"rgba(0,0,0,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,margin:"0 auto 16px",border:"3px solid rgba(0,0,0,0.3)"}}></div><h1 style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:800,fontSize:28,marginBottom:8}}>{store.shop_name}</h1><p style={{fontSize:14,color:"rgba(0,0,0,0.8)",marginBottom:20}}>{store.category} · {store.city||"Pakistan"}</p><div style={{display:"flex",gap:32,justifyContent:"center"}}><div style={{textAlign:"center"}}><p style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:800,fontSize:22}}>⭐ {store.rating||0}</p><p style={{fontSize:12,color:"rgba(0,0,0,0.7)"}}>Rating</p></div><div style={{textAlign:"center"}}><p style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:800,fontSize:22}}>{store.product_count||0}</p><p style={{fontSize:12,color:"rgba(0,0,0,0.7)"}}>Products</p></div><div style={{textAlign:"center"}}><p style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:800,fontSize:22,color:"#34d399"}}></p><p style={{fontSize:12,color:"rgba(0,0,0,0.7)"}}>Verified</p></div></div></div><div style={{padding:"28px 24px"}}>
 {/* Products */}
 <h2 style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:800,fontSize:20,marginBottom:18}}>Products</h2>
 {detail.loading
 ?<div style={{textAlign:"center",padding:"60px 0"}}><p style={{color:"#fe2c55"}}>Loading...</p></div>
 :detail.products.length===0
 ?<div style={{textAlign:"center",padding:"60px 0"}}><p style={{color:"rgba(0,0,0,0.4)"}}>No products yet</p></div>
 :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12,marginBottom:36}}>
 {detail.products.map(p=>(
 <div key={p.id} onClick={()=>setSP({...p,price:Number(p.price),orig:p.original_price||p.price,disc:p.discount_pct||0,cat:p.category,emoji:p.emoji||"",color:"#fe2c55",rating:Number(p.rating)||0,sold:Number(p.sold)||0})} style={{background:"rgba(0,0,0,0.03)",border:"1px solid rgba(0,0,0,0.07)",borderRadius:14,overflow:"hidden",cursor:"pointer",transition:"all 0.2s"}}
 onMouseEnter={e=>e.currentTarget.style.borderColor="#fe2c55"}
 onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(0,0,0,0.07)"}><div style={{aspectRatio:"1",background:"rgba(254,44,85,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:48}}>{p.emoji||""}</div><div style={{padding:"10px 12px"}}><p style={{fontSize:12,fontWeight:500,lineHeight:1.4,marginBottom:6,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{p.title}</p><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:700,fontSize:13,color:"#fe2c55"}}>Rs {Number(p.price).toLocaleString()}</span><button onClick={e=>{e.stopPropagation();addToCart({...p,price:Number(p.price),orig:p.original_price||p.price,disc:p.discount_pct||0,cat:p.category,emoji:p.emoji||"",color:"#fe2c55",rating:Number(p.rating)||0,sold:Number(p.sold)||0});showToast(" Added!");}} style={{background:"#fe2c55",border:"none",width:26,height:26,borderRadius:"50%",cursor:"pointer",fontSize:13,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button></div></div></div>
 ))}
 </div>
 }

 {/* Videos */}
 <h2 style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:800,fontSize:20,marginBottom:18}}>Store Videos</h2><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:10}}>
 {[1,2,3,4,5,6].map(i=>(
 <div key={i} style={{aspectRatio:"9/16",background:"linear-gradient(135deg,#1a0a1e,#2d1b33)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8,border:"1px solid rgba(0,0,0,0.07)",cursor:"pointer"}}
 onMouseEnter={e=>e.currentTarget.style.borderColor="#fe2c55"}
 onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(0,0,0,0.07)"}><div style={{width:40,height:40,borderRadius:"50%",background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:"#fff"}}>▶</div><p style={{fontSize:10,color:"rgba(255,255,255,0.6)"}}>Video {i}</p></div>
 ))}
 </div></div></div></div>
);

// ─── SHOP HOME SECTIONS (TikTok-Shop-style) ────────────────────────────────

export default StorePanel;
