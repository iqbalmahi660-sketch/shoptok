import { useState, useEffect, useRef } from "react";
import { PROD_MGMT_KEYS } from "../../data/catalogue.js";

export const Sidebar=({user,profileImg,tab,setTab,onAddProduct,onLogout,onEditProfile,tabs,showAdd})=>{
 const [prodOpen,setProdOpen]=useState(true);
 const topTabs=tabs.filter(t=>!PROD_MGMT_KEYS.includes(t.key));
 const prodTabs=tabs.filter(t=>PROD_MGMT_KEYS.includes(t.key));
 const NavBtn=({item,indent=false})=>(
 <button onClick={()=>setTab(item.key)}
 style={{width:"100%",display:"flex",alignItems:"center",gap:7,padding:"6px 8px",paddingLeft:indent?"22px":"8px",borderRadius:8,border:"none",
 background:tab===item.key?"rgba(254,44,85,0.12)":"transparent",
 color:tab===item.key?"#fe2c55":"rgba(0,0,0,0.5)",
 cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:tab===item.key?600:400,marginBottom:1,textAlign:"left",transition:"all 0.15s"}}><span style={{fontSize:13,flexShrink:0}}>{item.icon}</span><span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{item.label}</span>
 {item.badge>0&&<span style={{marginLeft:"auto",background:"#fe2c55",color:"#fff",fontSize:8,fontWeight:700,minWidth:14,height:14,borderRadius:100,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 3px",flexShrink:0}}>{item.badge}</span>}
 </button>
 );
 return(
 <div style={{width:220,flexShrink:0,background:"#ffffff",borderRight:"1px solid rgba(0,0,0,0.07)",display:"flex",flexDirection:"column",position:"sticky",top:60,height:"calc(100vh - 60px)",overflowY:"auto",overflowX:"hidden"}}>
 {/* Profile compact */}
 <div onClick={onEditProfile} style={{padding:"12px 14px",borderBottom:"1px solid rgba(0,0,0,0.06)",cursor:"pointer",display:"flex",alignItems:"center",gap:10,flexShrink:0}}
 onMouseEnter={e=>e.currentTarget.style.background="rgba(254,44,85,0.05)"}
 onMouseLeave={e=>e.currentTarget.style.background="transparent"}><div style={{position:"relative",flexShrink:0}}>
 {profileImg?<img src={profileImg} alt="" style={{width:38,height:38,borderRadius:"50%",objectFit:"cover",border:"2px solid #fe2c55"}}/>
 :<div style={{width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,#fe2c55,#ff6b35)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{user?.avatar||""}</div>}
 <div style={{position:"absolute",bottom:-1,right:-1,width:14,height:14,borderRadius:"50%",background:"#fe2c55",display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,border:"1px solid #0d0d0d"}}></div></div><div style={{minWidth:0,flex:1}}><p style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:700,fontSize:12,marginBottom:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user?.name}</p><span style={{fontSize:9,background:user?.role==="seller"?"rgba(37,244,238,0.1)":"rgba(254,44,85,0.1)",color:user?.role==="seller"?"#25f4ee":"#fe2c55",padding:"2px 7px",borderRadius:100}}>{user?.role==="seller"?" Seller":" Buyer"}</span></div></div>
 {/* Nav */}
 <nav style={{padding:"6px 6px",flex:1,overflow:"hidden",display:"flex",flexDirection:"column",justifyContent:"space-between"}}><div>
 {/* Top tabs — non product-mgmt */}
 {topTabs.filter(t=>!["storesetting","venture","bestsellers"].includes(t.key)).map(item=>(
 <NavBtn key={item.key} item={item}/>
 ))}

 {/* Product Management collapsible */}
 {prodTabs.length>0&&(
 <div style={{marginTop:4}}><button onClick={()=>setProdOpen(o=>!o)}
 style={{width:"100%",display:"flex",alignItems:"center",gap:7,padding:"6px 8px",borderRadius:8,border:"none",background:"rgba(0,0,0,0.03)",color:"rgba(0,0,0,0.6)",cursor:"pointer",fontFamily:"inherit",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:2}}><span style={{fontSize:12}}></span><span style={{flex:1,textAlign:"left"}}>Product Manag...</span><span style={{fontSize:12,transition:"transform 0.2s",transform:prodOpen?"rotate(180deg)":"rotate(0deg)"}}>▾</span></button>
 {prodOpen&&(
 <div style={{background:"rgba(0,0,0,0.02)",borderRadius:8,padding:"2px 0",marginBottom:4}}>
 {prodTabs.map(item=><NavBtn key={item.key} item={item} indent={true}/>)}
 </div>
 )}
 </div>
 )}

 {/* Bottom tabs */}
 {topTabs.filter(t=>["bestsellers","storesetting","venture"].includes(t.key)).map(item=>(
 <NavBtn key={item.key} item={item}/>
 ))}
 </div><div style={{borderTop:"1px solid rgba(0,0,0,0.06)",paddingTop:6}}>
 {showAdd&&<button onClick={onAddProduct} style={{width:"100%",padding:"7px",borderRadius:8,border:"none",background:"rgba(254,44,85,0.1)",color:"#fe2c55",cursor:"pointer",fontFamily:"'TikTok Sans',sans-serif",fontSize:11,fontWeight:700,marginBottom:4}}>+ Add Product</button>}
 <button onClick={onLogout} style={{width:"100%",padding:"7px",borderRadius:8,border:"none",background:"transparent",color:"rgba(0,0,0,0.3)",cursor:"pointer",fontFamily:"inherit",fontSize:11}}>Log Out</button></div></nav></div>
);};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

// ─── REVIEWS DATA ─────────────────────────────────────────────────────────────

export default Sidebar;
