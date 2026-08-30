import { useState, useEffect, useRef } from "react";

export const Footer=({setPage})=>(
 <footer style={{background:"#f7f7f8",borderTop:"1px solid rgba(0,0,0,0.07)"}}>
 {/* Newsletter Strip */}
 <div style={{background:"linear-gradient(135deg,rgba(254,44,85,0.1),rgba(37,244,238,0.05))",borderBottom:"1px solid rgba(0,0,0,0.06)",padding:"36px 24px"}}><div style={{maxWidth:1280,margin:"0 auto",display:"flex",alignItems:"center",gap:30,flexWrap:"wrap"}} className="footer-newsletter-row"><div style={{flex:1,minWidth:260}}><h3 style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:800,fontSize:20,marginBottom:5}}>Get the latest deals in your inbox!</h3><p style={{fontSize:13,color:"rgba(0,0,0,0.4)"}}>Exclusive sales, flash deals, and new arrivals — you hear it first.</p></div><div style={{display:"flex",gap:8,flex:1,minWidth:270}} className="newsletter-input-row"><input placeholder="Enter your email address..." style={{flex:1,background:"rgba(0,0,0,0.06)",border:"1px solid rgba(0,0,0,0.12)",borderRadius:10,padding:"11px 16px",color:"#111",fontSize:13,fontFamily:"inherit",outline:"none"}}/><button style={{background:"#fe2c55",border:"none",color:"#fff",padding:"11px 20px",borderRadius:10,fontFamily:"'TikTok Sans',sans-serif",fontWeight:700,fontSize:13,cursor:"pointer",whiteSpace:"nowrap"}}>Subscribe </button></div></div></div>

 {/* Main footer grid */}
 <div style={{maxWidth:1280,margin:"0 auto",padding:"44px 24px 30px",display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:36}} className="footer-grid">
 {/* Brand column */}
 <div><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><div style={{width:34,height:34,background:"linear-gradient(135deg,#fe2c55,#ff6b35)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>▶</div><span style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:800,fontSize:19,letterSpacing:"-0.5px"}}>ShopTok<span style={{color:"#fe2c55"}}>.</span></span></div><p style={{fontSize:12,color:"rgba(0,0,0,0.38)",lineHeight:1.85,marginBottom:20,maxWidth:240,textAlign:"left"}}>Pakistan's #1 short-video commerce platform. Discover products through viral videos and shop from the comfort of home.</p><div style={{display:"flex",gap:8,marginBottom:20}}>
 {[["","Facebook"],["","Instagram"],["","TikTok"],["","Twitter"]].map(([ic,nm])=>(
 <div key={nm} title={nm} style={{width:34,height:34,borderRadius:"50%",background:"rgba(0,0,0,0.07)",border:"1px solid rgba(0,0,0,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,cursor:"pointer"}}>{ic}</div>
 ))}
 </div><div style={{background:"rgba(254,44,85,0.07)",border:"1px solid rgba(254,44,85,0.18)",borderRadius:10,padding:"12px 14px"}}><p style={{fontSize:11,color:"rgba(0,0,0,0.4)",marginBottom:3}}>Customer Support</p><p style={{fontSize:14,fontWeight:700,color:"#fe2c55",marginBottom:2}}>0800-SHOPTOK</p><p style={{fontSize:11,color:"rgba(0,0,0,0.3)"}}>Mon–Sat · 9am – 9pm</p></div></div>

 {/* Quick Links */}
 <div><h4 style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:700,fontSize:13,marginBottom:16,color:"#fe2c55",textTransform:"uppercase",letterSpacing:"0.06em"}}>Quick Links</h4>
 {[["Home","home"],["Video Feed","feed"],["Shop","shop"],["Sell on ShopTok","seller"],["My Account","profile"]].map(([l,p])=>(
 <p key={l} onClick={()=>{setPage(p);window.scrollTo(0,0);}} style={{fontSize:13,color:"rgba(0,0,0,0.42)",marginBottom:10,cursor:"pointer",textAlign:"left"}}
 onMouseEnter={e=>e.target.style.color="#fff"} onMouseLeave={e=>e.target.style.color="rgba(0,0,0,0.42)"}>{l}</p>
 ))}
 </div>

 {/* Categories */}
 <div><h4 style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:700,fontSize:13,marginBottom:16,color:"#fe2c55",textTransform:"uppercase",letterSpacing:"0.06em"}}>Categories</h4>
 {[["","Fashion"],["","Electronics"],["","Beauty"],["","Home & Living"],["","Sports"],["","Food"]].map(([ic,l])=>(
 <p key={l} style={{fontSize:13,color:"rgba(0,0,0,0.42)",marginBottom:10,cursor:"pointer",textAlign:"left"}}
 onMouseEnter={e=>e.target.style.color="#fff"} onMouseLeave={e=>e.target.style.color="rgba(0,0,0,0.42)"}>{ic} {l}</p>
 ))}
 </div>

 {/* Help */}
 <div><h4 style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:700,fontSize:13,marginBottom:16,color:"#fe2c55",textTransform:"uppercase",letterSpacing:"0.06em"}}>Help & Support</h4>
 {[
 {l:"Track Your Order", pg:"track-order"},
 {l:"Return & Refund", pg:"return-refund"},
 {l:"Delivery Info", pg:"delivery-info"},
 {l:"Seller Guide", pg:"seller-guide"},
 {l:"Privacy Policy", pg:"privacy-policy"},
 {l:"Terms of Service", pg:"terms-of-service"},
 ].map(({l,pg})=>(
 <p key={l} style={{fontSize:13,color:"rgba(0,0,0,0.42)",marginBottom:10,cursor:"pointer",textAlign:"left"}}
 onMouseEnter={e=>e.target.style.color="#fff"} onMouseLeave={e=>e.target.style.color="rgba(0,0,0,0.42)"}
 onClick={()=>{setPage(pg);window.scrollTo(0,0);}}>{l}</p>
 ))}
 </div></div>

 {/* Bottom bar */}
 <div style={{borderTop:"1px solid rgba(0,0,0,0.06)",maxWidth:1280,margin:"0 auto",padding:"18px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}} className="footer-bottom"><p style={{fontSize:12,color:"rgba(0,0,0,0.25)",textAlign:"left"}}>© 2025 ShopTok Pakistan. All rights reserved.</p><div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}><span style={{fontSize:11,color:"rgba(0,0,0,0.25)",marginRight:4}}>Secure Payments:</span>
 {[["","Bank"],["","USDT"],["₿","Crypto"]].map(([ic,l])=>(
 <div key={l} style={{display:"flex",alignItems:"center",gap:4,background:"rgba(0,0,0,0.05)",border:"1px solid rgba(0,0,0,0.08)",borderRadius:6,padding:"3px 9px"}}><span style={{fontSize:11}}>{ic}</span><span style={{fontSize:11,color:"rgba(0,0,0,0.4)"}}>{l}</span></div>
 ))}
 </div></div></footer>
);

// ─── STORE DETAIL PANEL ───────────────────────────────────────────────────────

export default Footer;
