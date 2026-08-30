import { useState, useEffect, useRef } from "react";
import { API, CITIES } from "../../data/catalogue.js";
import Btn from "../common/Btn.jsx";
import Field from "../common/Field.jsx";

export const CheckoutFlow=({cart,cartTotal,onDone,onBack,user})=>{
 const [step,setStep]=useState(0); // 0=cart review, 1=shipping, 2=payment, 3=confirm
 const [loading,setLoading]=useState(false);
 const [orderId,setOrderId]=useState(`#ORD-${Date.now().toString().slice(-6)}`);
 const shipping=cartTotal>=1000?0:150;
 const total=cartTotal+shipping;
 const [addr,setAddr]=useState({name:user?.name||"",phone:"",address:"",city:"",note:""});
 const [pay,setPay]=useState({method:"Bank Transfer",txRef:"",cryptoType:"BTC"});

 const STEPS=["Review","Shipping","Payment","Confirm"];

 if(step===3){
 return(
 <div style={{position:"fixed",inset:0,background:"#f7f7f8",zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}><div style={{textAlign:"center",maxWidth:420}}><div style={{width:90,height:90,background:"linear-gradient(135deg,#34d399,#059669)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:42,margin:"0 auto 24px",boxShadow:"0 20px 60px #34d39940",animation:"fadeUp 0.5s ease"}}></div><h2 style={{fontFamily:"'TikTok Sans',sans-serif",fontSize:28,fontWeight:800,marginBottom:8}}>Order Placed! </h2><p style={{color:"rgba(0,0,0,0.5)",marginBottom:6}}>Your order <span style={{color:"#fe2c55",fontWeight:700}}>{orderId}</span> is confirmed</p><p style={{color:"rgba(0,0,0,0.35)",fontSize:13,marginBottom:28}}>Estimated delivery: 3–5 business days</p><div style={{background:"#ffffff",border:"1px solid #1a1a1a",borderRadius:16,padding:20,marginBottom:24,textAlign:"left"}}><p style={{fontSize:12,color:"#555",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.06em"}}>Order Summary</p>
 {cart.map((item,i)=>(
 <div key={i} style={{display:"flex",gap:10,alignItems:"center",marginBottom:10}}><div style={{width:38,height:38,borderRadius:8,background:`${item.color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{item.emoji}</div><div style={{flex:1}}><p style={{fontSize:12,fontWeight:500}}>{item.title}</p><p style={{fontSize:11,color:"#555"}}>Qty: {item.qty}</p></div><span style={{fontSize:13,fontWeight:600,color:"#fe2c55"}}>Rs {(item.price*item.qty).toLocaleString()}</span></div>
 ))}
 <div style={{borderTop:"1px solid #1a1a1a",paddingTop:12,marginTop:4}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:12,color:"#555"}}>Subtotal</span><span style={{fontSize:12}}>Rs {cartTotal.toLocaleString()}</span></div><div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:12,color:"#555"}}>Shipping</span><span style={{fontSize:12,color:shipping===0?"#34d399":"#fff"}}>{shipping===0?"Free":"Rs "+shipping}</span></div><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:700}}>Total</span><span style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:800,fontSize:16,color:"#fe2c55"}}>Rs {total.toLocaleString()}</span></div></div></div><div style={{background:"#ffffff",border:"1px solid #1a1a1a",borderRadius:12,padding:16,marginBottom:24,textAlign:"left"}}><p style={{fontSize:12,color:"#555",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.06em"}}>Delivery To</p><p style={{fontSize:13,fontWeight:600,marginBottom:2}}>{addr.name}</p><p style={{fontSize:12,color:"#888"}}>{addr.address}, {addr.city}</p><p style={{fontSize:12,color:"#888"}}>{addr.phone}</p></div><div style={{display:"flex",gap:10}}><Btn full variant="success" onClick={onDone}>Continue Shopping</Btn></div></div></div>
 );
 }

 return(
 <div style={{position:"fixed",inset:0,background:"#f7f7f8",zIndex:600,overflowY:"auto"}}>
 {/* Header */}
 <div style={{position:"sticky",top:0,background:"rgba(255,255,255,0.96)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(0,0,0,0.07)",padding:"14px 24px",display:"flex",alignItems:"center",gap:16,zIndex:10}}><button onClick={onBack} style={{background:"none",border:"none",color:"#555",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:6}}>← Back</button><div style={{flex:1,display:"flex",gap:4,alignItems:"center",justifyContent:"center"}}>
 {STEPS.map((s,i)=>(
 <div key={i} style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:24,height:24,borderRadius:"50%",background:i<step?"#34d399":i===step?"#fe2c55":"#1a1a1a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#fff",transition:"all 0.3s"}}>{i<step?"":i+1}</div><span style={{fontSize:11,color:i===step?"#111":"#888",fontWeight:i===step?600:400}}>{s}</span>
 {i<STEPS.length-1&&<div style={{width:20,height:1,background:"#f2f2f2",margin:"0 2px"}}/>}
 </div>
 ))}
 </div></div><div style={{maxWidth:600,margin:"0 auto",padding:"24px 24px 60px"}}>

 {/* STEP 0 — Cart Review */}
 {step===0&&(
 <div><h2 style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:800,fontSize:22,marginBottom:20}}>Review your cart</h2><div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
 {cart.map((item,i)=>(
 <div key={i} style={{background:"#ffffff",border:"1px solid #1a1a1a",borderRadius:14,padding:14,display:"flex",gap:14,alignItems:"center"}}><div style={{width:56,height:56,borderRadius:12,background:`${item.color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0}}>{item.emoji}</div><div style={{flex:1}}><p style={{fontSize:13,fontWeight:600,marginBottom:3}}>{item.title}</p><p style={{fontSize:12,color:"rgba(0,0,0,0.4)"}}>Qty: {item.qty} × Rs {item.price.toLocaleString()}</p></div><span style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:700,fontSize:14,color:"#fe2c55",flexShrink:0}}>Rs {(item.price*item.qty).toLocaleString()}</span></div>
 ))}
 </div><div style={{background:"#ffffff",border:"1px solid #1a1a1a",borderRadius:14,padding:18,marginBottom:20}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{color:"rgba(0,0,0,0.5)"}}>Subtotal</span><span>Rs {cartTotal.toLocaleString()}</span></div><div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}><span style={{color:"rgba(0,0,0,0.5)"}}>Shipping</span><span style={{color:shipping===0?"#34d399":"#fff"}}>{shipping===0?" Free!":"Rs "+shipping}</span></div>
 {shipping>0&&<div style={{background:"rgba(254,44,85,0.06)",border:"1px solid rgba(254,44,85,0.15)",borderRadius:8,padding:"8px 12px",marginBottom:12}}><p style={{fontSize:11,color:"#fe2c55"}}>Add Rs {(1000-cartTotal).toLocaleString()} more for free shipping!</p></div>}
 <div style={{display:"flex",justifyContent:"space-between",borderTop:"1px solid #1a1a1a",paddingTop:12}}><span style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:700,fontSize:15}}>Total</span><span style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:800,fontSize:18,color:"#fe2c55"}}>Rs {total.toLocaleString()}</span></div></div><Btn full onClick={()=>setStep(1)}>Continue to Shipping →</Btn></div>
 )}

 {/* STEP 1 — Shipping */}
 {step===1&&(
 <div><h2 style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:800,fontSize:22,marginBottom:20}}>Shipping Details</h2><div style={{background:"#ffffff",border:"1px solid #1a1a1a",borderRadius:14,padding:20,marginBottom:20}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><Field label="Full Name *" value={addr.name} onChange={v=>setAddr({...addr,name:v})} placeholder="Muhammad Ali"/><Field label="Phone *" value={addr.phone} onChange={v=>setAddr({...addr,phone:v})} placeholder="03001234567"/></div><Field label="Address *" value={addr.address} onChange={v=>setAddr({...addr,address:v})} placeholder="House/Street/Area"/><div><label style={{fontSize:10,color:"#666",display:"block",marginBottom:5,textTransform:"uppercase"}}>City *</label><select value={addr.city} onChange={e=>setAddr({...addr,city:e.target.value})} style={{width:"100%",padding:"11px 12px",background:"#ffffff",border:"1px solid #e5e5e5",borderRadius:8,color:addr.city?"#111":"#888",fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box",marginBottom:14}}><option value="">Select city</option>{CITIES.map(c=><option key={c}>{c}</option>)}
 </select></div><Field label="Note for rider (optional)" value={addr.note} onChange={v=>setAddr({...addr,note:v})} placeholder="e.g. Call before delivery"/></div><div style={{background:"rgba(254,44,85,0.05)",border:"1px solid rgba(254,44,85,0.15)",borderRadius:12,padding:14,marginBottom:20,display:"flex",gap:12,alignItems:"center"}}><span style={{fontSize:24}}></span><div><p style={{fontSize:13,fontWeight:600,marginBottom:2}}>Estimated Delivery</p><p style={{fontSize:12,color:"#888"}}>3–5 business days · {shipping===0?"Free Shipping":"Rs "+shipping+" shipping fee"}</p></div></div><Btn full disabled={!addr.name||!addr.phone||!addr.address||!addr.city} onClick={()=>setStep(2)}>Continue to Payment →</Btn></div>
 )}

 {/* STEP 2 — Payment */}
 {step===2&&(
 <div><h2 style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:800,fontSize:22,marginBottom:20}}>Payment Method</h2><div style={{display:"flex",gap:10,marginBottom:20}}>
 {[["Bank Transfer"," Bank Transfer"],["USDT"," USDT"],["Crypto","₿ Crypto"]].map(([m,l])=>(
 <button key={m} onClick={()=>setPay({...pay,method:m})} style={{flex:1,padding:"10px 6px",borderRadius:10,border:`2px solid ${pay.method===m?"#fe2c55":"#e5e5e5"}`,background:pay.method===m?"rgba(254,44,85,0.08)":"#f7f7f8",color:pay.method===m?"#fe2c55":"#666",fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:pay.method===m?700:400,textAlign:"center",transition:"all 0.2s"}}>{l}</button>
 ))}
 </div>

 {pay.method==="Bank Transfer"&&(
 <div style={{background:"#ffffff",border:"1px solid #e5e5e5",borderRadius:14,padding:20,marginBottom:16}}><div style={{background:"linear-gradient(135deg,#1a3a5c,#0d2137)",borderRadius:12,padding:20,marginBottom:16,textAlign:"center"}}><p style={{fontSize:32,marginBottom:8}}></p><p style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:700,fontSize:16,marginBottom:4,color:"#fff"}}>Bank Transfer</p><p style={{fontSize:12,color:"rgba(255,255,255,0.6)"}}>Transfer to our bank account</p></div><div style={{background:"rgba(37,244,238,0.06)",border:"1px solid rgba(37,244,238,0.2)",borderRadius:10,padding:14,marginBottom:12}}><p style={{fontSize:12,color:"#25f4ee",marginBottom:6,fontWeight:700}}>Bank Details:</p><p style={{fontSize:13,color:"rgba(0,0,0,0.8)",lineHeight:1.8}}>Bank: <strong>HBL</strong><br/>Account Title: <strong>ShopTok PK</strong><br/>Account No: <strong>1234-5678-9012</strong><br/>IBAN: <strong>PK36HABB0000001123456702</strong></p></div><Field label="Transaction Reference / Receipt No." value={pay.txRef||""} onChange={v=>setPay({...pay,txRef:v})} placeholder="e.g. TXN123456"/><div style={{background:"rgba(251,191,36,0.08)",border:"1px solid rgba(251,191,36,0.2)",borderRadius:8,padding:"10px 14px"}}><p style={{fontSize:12,color:"#fbbf24"}}>Please transfer the exact amount and provide transaction reference for faster processing.</p></div></div>
 )}

 {pay.method==="USDT"&&(
 <div style={{background:"#ffffff",border:"1px solid #e5e5e5",borderRadius:14,padding:20,marginBottom:16}}><div style={{background:"linear-gradient(135deg,#1a3a1a,#0d2d0d)",borderRadius:12,padding:20,marginBottom:16,textAlign:"center"}}><p style={{fontSize:32,marginBottom:8}}></p><p style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:700,fontSize:16,marginBottom:4,color:"#fff"}}>USDT (TRC-20)</p><p style={{fontSize:12,color:"rgba(255,255,255,0.6)"}}>Tether USD — Tron Network</p></div><div style={{background:"rgba(52,211,153,0.06)",border:"1px solid rgba(52,211,153,0.2)",borderRadius:10,padding:14,marginBottom:12}}><p style={{fontSize:12,color:"#34d399",marginBottom:6,fontWeight:700}}>USDT Wallet Address (TRC-20):</p><p style={{fontSize:12,fontFamily:"monospace",color:"rgba(0,0,0,0.8)",wordBreak:"break-all",letterSpacing:"0.05em"}}>TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</p></div><Field label="Your TxHash / Transaction ID" value={pay.txRef||""} onChange={v=>setPay({...pay,txRef:v})} placeholder="e.g. abc123def456..."/><div style={{background:"rgba(251,191,36,0.08)",border:"1px solid rgba(251,191,36,0.2)",borderRadius:8,padding:"10px 14px"}}><p style={{fontSize:12,color:"#fbbf24"}}>Only TRC-20 network. Send exact USDT amount and provide TxHash for verification.</p></div></div>
 )}

 {pay.method==="Crypto"&&(
 <div style={{background:"#ffffff",border:"1px solid #e5e5e5",borderRadius:14,padding:20,marginBottom:16}}><div style={{background:"linear-gradient(135deg,#2d1a00,#1a0d00)",borderRadius:12,padding:20,marginBottom:16,textAlign:"center"}}><p style={{fontSize:32,marginBottom:8}}>₿</p><p style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:700,fontSize:16,marginBottom:4,color:"#fff"}}>Cryptocurrency</p><p style={{fontSize:12,color:"rgba(255,255,255,0.6)"}}>BTC / ETH / BNB accepted</p></div><div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
 {[["BTC","₿ Bitcoin","#f7931a"],["ETH","Ξ Ethereum","#627eea"],["BNB","⬡ BNB","#f3ba2f"]].map(([c,l,col])=>(
 <button key={c} onClick={()=>setPay({...pay,cryptoType:c})} style={{flex:1,padding:"8px",borderRadius:8,border:`2px solid ${pay.cryptoType===c?col:"#e5e5e5"}`,background:pay.cryptoType===c?`${col}15`:"transparent",color:pay.cryptoType===c?col:"#555",fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>{l}</button>
 ))}
 </div><div style={{background:"rgba(247,147,26,0.06)",border:"1px solid rgba(247,147,26,0.2)",borderRadius:10,padding:14,marginBottom:12}}><p style={{fontSize:12,color:"#fbbf24",marginBottom:6,fontWeight:700}}>{pay.cryptoType||"BTC"} Wallet Address:</p><p style={{fontSize:11,fontFamily:"monospace",color:"rgba(0,0,0,0.8)",wordBreak:"break-all"}}>1A2B3C4D5E6F7G8H9I0J...</p></div><Field label="Transaction Hash / TxID" value={pay.txRef||""} onChange={v=>setPay({...pay,txRef:v})} placeholder="e.g. 0xabc123..."/><div style={{background:"rgba(251,191,36,0.08)",border:"1px solid rgba(251,191,36,0.2)",borderRadius:8,padding:"10px 14px"}}><p style={{fontSize:12,color:"#fbbf24"}}>Send exact amount in {pay.cryptoType||"BTC"} and provide TxHash for order confirmation.</p></div></div>
 )}

 <div style={{background:"#ffffff",border:"1px solid #1a1a1a",borderRadius:12,padding:14,marginBottom:20}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:13,color:"#555"}}>Items ({cart.reduce((s,i)=>s+i.qty,0)})</span><span style={{fontSize:13}}>Rs {cartTotal.toLocaleString()}</span></div><div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:13,color:"#555"}}>Shipping</span><span style={{fontSize:13,color:shipping===0?"#34d399":"#fff"}}>{shipping===0?"Free":"Rs "+shipping}</span></div><div style={{display:"flex",justifyContent:"space-between",borderTop:"1px solid #1a1a1a",paddingTop:10}}><span style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:700}}>Total</span><span style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:800,fontSize:17,color:"#fe2c55"}}>Rs {total.toLocaleString()}</span></div></div><Btn full loading={loading} onClick={async()=>{
 setLoading(true);
 try {
 const token = localStorage.getItem("shopToken");
 // Send one order per cart item (backend handles one product per order)
 let lastOrder = null;
 for(const item of cart) {
 const res = await fetch(`${API}/orders`, {
 method: "POST",
 headers: {"Content-Type":"application/json","Authorization":`Bearer ${token}`},
 body: JSON.stringify({
 product_id: item.id,
 quantity: item.qty,
 total_amount: Math.round(item.price * item.qty),
 shipping_fee: shipping,
 payment_method: pay.method,
 shipping_name: addr.name,
 shipping_phone: addr.phone,
 shipping_address: addr.address,
 shipping_city: addr.city,
 rider_note: addr.note || ""
 })
 });
 const data = await res.json();
 if(!res.ok) throw new Error(data.message||"Order failed");
 lastOrder = data.order;
 }
 if(lastOrder?.order_number) setOrderId(lastOrder.order_number);
 setStep(3);
 } catch(err) {
 alert("Order failed: "+err.message);
 }
 setLoading(false);
 }}>
 {pay.method==="cod"?" Place Order (COD)":pay.method==="card"?" Pay Rs "+total.toLocaleString():" Confirm & Pay Rs "+total.toLocaleString()}
 </Btn></div>
 )}
 </div></div>
 );
};

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────

export default CheckoutFlow;
