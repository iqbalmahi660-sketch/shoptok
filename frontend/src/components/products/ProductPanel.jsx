import { useState, useEffect, useRef } from "react";
import { CATALOGUE, PRODUCT_REVIEWS, RATING_DIST, SIZES, SWATCH_COLORS } from "../../data/catalogue.js";

export const ProductPanel=({prod,onClose,addToCart,setCart,onBuyNow,likedP,toggleLP,showToast})=>{
 const [selSize,setSz]=useState("M");
 const [selColor,setClr]=useState(0);
 const [qty,setQty]=useState(1);
 const [activeTab,setTab]=useState("desc");
 const [timer,setTimer]=useState({h:1,m:42,s:13});
 const reviews=PRODUCT_REVIEWS[prod.id]||PRODUCT_REVIEWS[3];
 const pad=n=>String(n).padStart(2,"0");

 useEffect(()=>{
 window.scrollTo(0,0);
 setQty(1); // reset qty when product changes
 const t=setInterval(()=>{
 setTimer(prev=>{
 let {h,m,s}=prev; s--;
 if(s<0){s=59;m--;} if(m<0){m=59;h--;} if(h<=0&&m<=0&&s<=0)return{h:0,m:0,s:0};
 return{h,m,s};
 });
 },1000);
 return()=>clearInterval(t);
 },[prod.id]);

 return(
 <div style={{position:"fixed",inset:0,background:"#f7f7f8",zIndex:500,overflowY:"auto",animation:"fadeUp 0.3s ease"}}>

 {/* Sticky top bar */}
 <div style={{position:"sticky",top:0,zIndex:10,background:"rgba(255,255,255,0.97)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(0,0,0,0.07)",padding:"13px 24px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><button onClick={onClose} style={{width:36,height:36,borderRadius:"50%",background:"rgba(0,0,0,0.07)",border:"none",color:"#111",cursor:"pointer",fontSize:17,display:"flex",alignItems:"center",justifyContent:"center"}}>←</button><span style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:700,fontSize:14,color:"rgba(0,0,0,0.8)"}}>Product Detail</span><button onClick={()=>toggleLP(prod.id)} style={{width:36,height:36,borderRadius:"50%",background:"rgba(0,0,0,0.07)",border:"none",cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>{likedP.has(prod.id)?"":""}</button></div><div style={{maxWidth:800,margin:"0 auto",padding:"0 0 80px"}}>

 {/* Two column layout like real ecommerce */}
 <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0,minHeight:"70vh"}} className="product-page-grid">

 {/* LEFT — Product Image */}
 <div style={{position:"sticky",top:60,height:"calc(100vh - 60px)",background:`linear-gradient(135deg,${prod.color}30,${prod.color}10,#fafafa)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,borderRight:"1px solid rgba(0,0,0,0.06)"}}><div style={{fontSize:160,lineHeight:1,marginBottom:24,filter:"drop-shadow(0 20px 60px rgba(0,0,0,0.5))"}}>{prod.emoji}</div>
 {/* Thumbnail row */}
 <div style={{display:"flex",gap:8,marginBottom:20}}>
 {[prod.emoji,prod.emoji,prod.emoji,prod.emoji].map((e,i)=>(
 <div key={i} style={{width:56,height:56,borderRadius:10,background:i===0?`rgba(254,44,85,0.2)`:"rgba(0,0,0,0.05)",border:`2px solid ${i===0?"#fe2c55":"rgba(0,0,0,0.1)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,cursor:"pointer"}}>{e}</div>
 ))}
 </div><div style={{display:"flex",gap:8}}><span style={{background:"#fbbf24",color:"#000",fontSize:10,fontWeight:800,padding:"4px 11px",borderRadius:100}}>Bestseller</span><span style={{background:"#fe2c55",color:"#fff",fontSize:10,fontWeight:800,padding:"4px 11px",borderRadius:100}}>-{prod.disc}% OFF</span><span style={{background:"#22c55e",color:"#111",fontSize:10,fontWeight:800,padding:"4px 11px",borderRadius:100}}>Authentic</span></div></div>

 {/* RIGHT — Product Details */}
 <div style={{padding:"28px 28px 100px",overflowY:"auto"}}>
 {/* Title + stars */}
 <h1 style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:800,fontSize:22,lineHeight:1.3,marginBottom:10,color:"#111"}}>{prod.title}</h1><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16,flexWrap:"wrap"}}><div style={{display:"flex",gap:1}}>
 {[1,2,3,4,5].map(i=><span key={i} style={{color:i<=Math.round(prod.rating)?"#fbbf24":"rgba(0,0,0,0.15)",fontSize:14}}></span>)}
 </div><span style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:700,color:"#fbbf24",fontSize:14}}>{prod.rating}</span><span style={{color:"rgba(0,0,0,0.3)",fontSize:12}}>({(prod.sold*2+243).toLocaleString()} reviews)</span><span style={{color:"rgba(0,0,0,0.2)",fontSize:12}}>|</span><span style={{color:"rgba(0,0,0,0.35)",fontSize:12}}>{prod.sold.toLocaleString()} bik chuke</span></div>

 {/* Store Info */}
 <div style={{display:"flex",alignItems:"center",gap:10,background:"rgba(0,0,0,0.03)",border:"1px solid rgba(0,0,0,0.08)",borderRadius:12,padding:"10px 14px",marginBottom:14,cursor:"pointer"}}
 onMouseEnter={e=>e.currentTarget.style.background="rgba(254,44,85,0.06)"}
 onMouseLeave={e=>e.currentTarget.style.background="rgba(0,0,0,0.03)"}><div style={{width:42,height:42,borderRadius:10,background:"linear-gradient(135deg,#fe2c55,#ff6b35)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}></div><div style={{flex:1}}><p style={{fontSize:13,fontWeight:700,color:"#111",marginBottom:2}}>{prod.shopName||"ShopTok Verified Store"}</p><div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:11,color:"#fbbf24"}}>⭐ {prod.rating||4.8}</span><span style={{fontSize:11,color:"rgba(0,0,0,0.3)"}}>·</span><span style={{fontSize:11,color:"rgba(0,0,0,0.4)"}}>{prod.sold||0}+ sold</span><span style={{fontSize:11,color:"rgba(0,0,0,0.3)"}}>·</span><span style={{fontSize:11,color:"#22c55e"}}>Verified</span></div></div><div style={{textAlign:"right"}}><p style={{fontSize:11,color:"#fe2c55",fontWeight:600,marginBottom:2}}>View Store →</p><p style={{fontSize:10,color:"rgba(0,0,0,0.3)"}}>Free Returns</p></div></div>


 {/* Flash sale timer - only show if product has real discount */}
 {Number(prod.disc)>0&&Number(prod.orig)>Number(prod.price)&&(
 <div style={{background:"rgba(254,44,85,0.06)",border:"1px solid rgba(254,44,85,0.22)",borderRadius:12,padding:"12px 16px",marginBottom:18,display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:18}}></span><div style={{flex:1}}><p style={{fontSize:11,color:"rgba(0,0,0,0.45)",marginBottom:7}}>Flash Sale ends in:</p><div style={{display:"flex",alignItems:"center",gap:5}}>
 {[timer.h,timer.m,timer.s].map((v,i)=>(
 <span key={i} style={{display:"flex",alignItems:"center",gap:5}}><span style={{background:"#1a0a0f",border:"1px solid rgba(254,44,85,0.35)",borderRadius:7,padding:"5px 11px",fontFamily:"'TikTok Sans',sans-serif",fontWeight:800,fontSize:16,color:"#fe2c55",minWidth:36,textAlign:"center",display:"inline-block"}}>{pad(v)}</span>
 {i<2&&(<span style={{color:"#fe2c55",fontWeight:800,fontSize:16}}>:</span>)}
 </span>
 ))}
 <span style={{fontSize:11,color:"rgba(0,0,0,0.3)",marginLeft:6}}>then Rs. {Number(prod.orig).toLocaleString()}</span></div></div></div>
 )}

 {/* Size selector - only show for clothing/fashion */}
 {(prod.sizes?.length>0||(prod.cat&&["fashion","clothing","footwear","sports"].some(c=>prod.cat?.toLowerCase().includes(c))))&&(
 <div style={{marginBottom:18}}><p style={{fontSize:12,color:"rgba(0,0,0,0.55)",fontWeight:600,marginBottom:10,letterSpacing:"0.04em"}}>Select Size:</p><div style={{display:"flex",gap:8,flexWrap:"wrap"}} className="size-row">
 {(prod.sizes?.length>0?prod.sizes:SIZES).map(s=>(
 <button key={s} onClick={()=>setSz(s)} style={{padding:"8px 18px",borderRadius:9,border:`2px solid ${selSize===s?"#fe2c55":"rgba(0,0,0,0.1)"}`,background:selSize===s?"rgba(254,44,85,0.15)":"rgba(0,0,0,0.04)",color:selSize===s?"#fe2c55":"rgba(0,0,0,0.65)",fontFamily:"'TikTok Sans',sans-serif",fontWeight:700,fontSize:13,cursor:"pointer",transition:"all 0.15s"}}>{s}</button>
 ))}
 </div></div>
 )}

 {/* Color selector - only show if product has colors */}
 {(prod.colors?.length>0||(prod.cat&&["fashion","clothing","footwear"].some(c=>prod.cat?.toLowerCase().includes(c))))&&(
 <div style={{marginBottom:18}}><p style={{fontSize:12,color:"rgba(0,0,0,0.55)",fontWeight:600,marginBottom:10,letterSpacing:"0.04em"}}>Select Color:</p><div style={{display:"flex",gap:10}}>
 {(prod.colors?.length>0?prod.colors:SWATCH_COLORS).map((c,i)=>(
 <button key={i} onClick={()=>setClr(i)} style={{width:32,height:32,borderRadius:"50%",background:c,border:"none",cursor:"pointer",boxShadow:selColor===i?`0 0 0 3px #0c0c0c, 0 0 0 5px ${c}`:"none",transition:"all 0.15s"}}/>
 ))}
 </div></div>
 )}

 {/* Quantity */}
 <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:16}}><p style={{fontSize:12,color:"rgba(0,0,0,0.55)",fontWeight:600}}>Quantity:</p><div style={{display:"flex",alignItems:"center",gap:0,background:"rgba(0,0,0,0.06)",border:"1px solid rgba(0,0,0,0.1)",borderRadius:10,overflow:"hidden"}}><button onClick={()=>setQty(q=>Math.max(1,q-1))} style={{width:40,height:40,background:"none",border:"none",color:"rgba(0,0,0,0.7)",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>−</button><span style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:700,fontSize:16,minWidth:32,textAlign:"center",borderLeft:"1px solid rgba(0,0,0,0.08)",borderRight:"1px solid rgba(0,0,0,0.08)",lineHeight:"40px"}}>{qty}</span><button onClick={()=>setQty(q=>q+1)} style={{width:40,height:40,background:"none",border:"none",color:"rgba(0,0,0,0.7)",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button></div><span style={{fontSize:12,color:"#22c55e",fontWeight:600}}> {prod.stock||"In"} left in stock</span></div>

 {/* Price box — after qty so user sees update */}
 <div style={{background:"rgba(254,44,85,0.07)",border:"1px solid rgba(254,44,85,0.18)",borderRadius:14,padding:"16px 18px",marginBottom:16}}><div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:7,flexWrap:"wrap"}}><span style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:800,fontSize:30,color:"#fe2c55",letterSpacing:"-1px"}}>Rs. {(Number(prod.price)*qty).toLocaleString()}</span>
 {qty>1&&<span style={{fontSize:13,color:"rgba(0,0,0,0.5)"}}>({qty} × Rs. {Number(prod.price).toLocaleString()})</span>}
 {prod.orig>prod.price&&<span style={{fontSize:14,color:"rgba(0,0,0,0.3)",textDecoration:"line-through"}}>Rs. {(Number(prod.orig)*qty).toLocaleString()}</span>}
 </div>
 {prod.orig>prod.price&&<p style={{fontSize:13,color:"#22c55e",fontWeight:600}}>You save: Rs. {((Number(prod.orig)-Number(prod.price))*qty).toLocaleString()} ({prod.disc}% OFF)</p>}
 {qty>1&&<p style={{fontSize:12,color:"#fbbf24",fontWeight:600,marginTop:4}}>Total for {qty} items: Rs. {(Number(prod.price)*qty).toLocaleString()}</p>}
 </div>

 {/* CTA buttons */}
 <div style={{display:"flex",gap:10,marginBottom:18}}><button onClick={()=>{
 // Add qty times to cart
 for(let i=0;i<qty;i++) addToCart(prod);
 showToast(` ${qty} item${qty>1?"s":""} added to cart!`);
 onClose();
 }} style={{flex:1,padding:"14px 10px",background:"rgba(254,44,85,0.1)",border:"2px solid #fe2c55",borderRadius:12,color:"#fe2c55",fontFamily:"'TikTok Sans',sans-serif",fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>Add to Cart</button><button onClick={()=>{
 // Set cart to exactly qty of this product then checkout
 const newItem = {...prod, qty};
 setCart([newItem]);
 onBuyNow();
 onClose();
 }} style={{flex:1,padding:"14px 10px",background:"linear-gradient(135deg,#fe2c55,#ff6b35)",border:"none",borderRadius:12,color:"#fff",fontFamily:"'TikTok Sans',sans-serif",fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>Buy Now</button><button onClick={()=>toggleLP(prod.id)} style={{width:50,flexShrink:0,background:"rgba(0,0,0,0.05)",border:"1px solid rgba(0,0,0,0.1)",borderRadius:12,cursor:"pointer",fontSize:20,display:"flex",alignItems:"center",justifyContent:"center"}}>{likedP.has(prod.id)?"":""}</button></div>

 {/* Trust badges */}
 <div style={{background:"rgba(0,0,0,0.03)",border:"1px solid rgba(0,0,0,0.07)",borderRadius:14,overflow:"hidden",marginBottom:24}}>
 {[
 {ic:"",t:"Free Delivery",d:"Karachi, Lahore, Islamabad — 2–3 days"},
 {ic:"",t:"Cash on Delivery",d:"Available across Pakistan"},
 {ic:"",t:"7-Day Returns",d:"Return in original condition"},
 {ic:"",t:"Secure Payment",d:"USDT, Bank Transfer, Crypto"},
 ].map((b,i)=>(
 <div key={i} style={{display:"flex",alignItems:"center",gap:14,padding:"13px 16px",borderBottom:i<3?"1px solid rgba(0,0,0,0.05)":"none"}}><div style={{width:38,height:38,borderRadius:10,background:"rgba(254,44,85,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,flexShrink:0}}>{b.ic}</div><div><p style={{fontSize:13,fontWeight:700,marginBottom:2}}>{b.t}</p><p style={{fontSize:11,color:"rgba(0,0,0,0.38)"}}>{b.d}</p></div></div>
 ))}
 </div>

 {/* Tabs - remove, show description directly */}
 {/* Description */}
 <div style={{marginBottom:24}}><h3 style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:700,fontSize:15,marginBottom:12,color:"#111"}}>Product Description</h3><p style={{fontSize:13,color:"rgba(0,0,0,0.6)",lineHeight:1.85,marginBottom:16}}>This {prod.title} has been carefully curated for quality-conscious shoppers. Made from premium materials with a modern, stylish design — perfect for every age group.
 </p>
 {[["","Premium Quality","Best materials, long-lasting durability"],
 ["","100% Authentic","Verified seller, guaranteed genuine product"],
 ["","Fast Delivery","2–3 business days across Pakistan"],
 ["","Easy Returns","7-day hassle-free return policy"],
 ["","Safe Packaging","Bubble-wrapped, damage-proof delivery"],
 ].map(([ic,t,d])=>(
 <div key={t} style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:10}}><span style={{fontSize:15,marginTop:1}}>{ic}</span><div><p style={{fontSize:13,fontWeight:600,marginBottom:2}}>{t}</p><p style={{fontSize:12,color:"rgba(0,0,0,0.4)"}}>{d}</p></div></div>
 ))}
 </div></div>{/* end right column */}
 </div>{/* end grid */}

 {/* ── RELATED PRODUCTS — Full width below grid ── */}
 <div style={{padding:"40px 28px 0",borderTop:"1px solid rgba(0,0,0,0.07)"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}><h2 style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:800,fontSize:20}}>Related Products</h2><span style={{fontSize:12,color:"#fe2c55",cursor:"pointer"}}>View All →</span></div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12,marginBottom:48}}>
 {CATALOGUE.filter(p=>p.id!==prod.id).slice(0,6).map(p=>(
 <div key={p.id} onClick={()=>onClose()} style={{background:"rgba(0,0,0,0.03)",border:"1px solid rgba(0,0,0,0.07)",borderRadius:14,overflow:"hidden",cursor:"pointer",transition:"all 0.2s"}}
 onMouseEnter={e=>e.currentTarget.style.borderColor="#fe2c55"}
 onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(0,0,0,0.07)"}><div style={{aspectRatio:"1",background:`${p.color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:48}}>{p.emoji}</div><div style={{padding:"10px 12px"}}><p style={{fontSize:12,fontWeight:500,lineHeight:1.4,marginBottom:6,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{p.title}</p><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:700,fontSize:13,color:"#fe2c55"}}>Rs {p.price.toLocaleString()}</span><span style={{fontSize:11,color:"rgba(0,0,0,0.35)"}}>⭐{p.rating}</span></div></div></div>
 ))}
 </div>

 {/* ── CUSTOMER REVIEWS — Full width ── */}
 <div style={{borderTop:"1px solid rgba(0,0,0,0.07)",paddingTop:40,paddingBottom:60}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}><h2 style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:800,fontSize:20}}>⭐ Customer Reviews</h2><span style={{fontSize:12,color:"rgba(0,0,0,0.4)"}}>{(prod.sold*2+243).toLocaleString()} reviews</span></div>

 {/* Rating summary */}
 <div style={{display:"flex",gap:24,alignItems:"center",background:"rgba(0,0,0,0.03)",border:"1px solid rgba(0,0,0,0.07)",borderRadius:16,padding:"24px 28px",marginBottom:28}}><div style={{textAlign:"center",flexShrink:0}}><p style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:800,fontSize:56,color:"#fe2c55",lineHeight:1}}>{prod.rating}</p><div style={{display:"flex",gap:2,justifyContent:"center",margin:"8px 0 4px"}}>
 {[1,2,3,4,5].map(i=><span key={i} style={{color:i<=Math.round(prod.rating)?"#fbbf24":"rgba(0,0,0,0.15)",fontSize:16}}></span>)}
 </div><p style={{fontSize:12,color:"rgba(0,0,0,0.35)"}}>out of 5</p></div><div style={{flex:1}}>
 {[5,4,3,2,1].map(s=>(
 <div key={s} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><span style={{fontSize:12,color:"rgba(0,0,0,0.5)",width:8}}>{s}</span><span style={{color:"#fbbf24",fontSize:12}}></span><div style={{flex:1,height:8,background:"rgba(0,0,0,0.07)",borderRadius:100,overflow:"hidden"}}><div style={{height:"100%",width:`${RATING_DIST[s]}%`,background:s>=4?"#fbbf24":"rgba(0,0,0,0.3)",borderRadius:100}}/></div><span style={{fontSize:12,color:"rgba(0,0,0,0.35)",width:36,textAlign:"right"}}>{RATING_DIST[s]}%</span></div>
 ))}
 </div></div>

 {/* Review cards */}
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:16}}>
 {reviews.map((r,i)=>(
 <div key={i} style={{background:"rgba(0,0,0,0.03)",border:"1px solid rgba(0,0,0,0.07)",borderRadius:16,padding:20}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:42,height:42,borderRadius:"50%",background:"rgba(254,44,85,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}></div><div><p style={{fontSize:14,fontWeight:700}}>{r.n}</p><p style={{fontSize:11,color:"rgba(0,0,0,0.32)"}}>{r.ago} · {r.loc}</p></div></div><div style={{display:"flex",gap:1}}>
 {[1,2,3,4,5].map(si=><span key={si} style={{color:si<=r.stars?"#fbbf24":"rgba(0,0,0,0.12)",fontSize:14}}></span>)}
 </div></div><p style={{fontSize:13,color:"rgba(0,0,0,0.68)",lineHeight:1.75}}>{r.txt}</p>
 {r.hasPhoto&&(
 <div style={{marginTop:12,display:"flex",gap:8}}><div style={{width:60,height:60,borderRadius:10,background:"rgba(0,0,0,0.07)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}></div></div>
 )}
 </div>
 ))}
 </div></div></div></div>{/* end maxWidth wrapper */}
 </div>
 );
};

// ─── FOOTER ───────────────────────────────────────────────────────────────────
// ─── POLICY PAGES ─────────────────────────────────────────────────────────────

export default ProductPanel;
