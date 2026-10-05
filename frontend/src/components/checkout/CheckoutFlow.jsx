import { useState, useEffect, useRef } from "react";
import { API, CITIES } from "../../data/catalogue.js";
import Btn from "../common/Btn.jsx";
import Field from "../common/Field.jsx";

const getProductImage = (item) => {
  if (!item) return "";

  if (typeof item.img === "string" && item.img.trim()) return item.img.trim();
  if (typeof item.image_url === "string" && item.image_url.trim()) return item.image_url.trim();
  if (typeof item.image === "string" && item.image.trim()) return item.image.trim();
  if (typeof item.thumbnail === "string" && item.thumbnail.trim()) return item.thumbnail.trim();

  if (Array.isArray(item.images) && item.images.length) {
    const first = item.images[0];
    if (typeof first === "string" && first.trim()) return first.trim();
    if (first && typeof first === "object") {
      return first.url || first.src || first.image_url || "";
    }
  }

  return "";
};

const ProductThumb = ({ item, size = 56, radius = 12 }) => {
  const src = getProductImage(item);

  if (src) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          overflow: "hidden",
          background: "#f3f3f3",
          flexShrink: 0,
          border: "1px solid #eeeeee",
        }}
      >
        <img
          src={src}
          alt={item?.title || "Product"}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
          onError={(e) => {
            e.currentTarget.style.display = "none";
            const fallback = e.currentTarget.nextElementSibling;
            if (fallback) fallback.style.display = "flex";
          }}
        />
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            fontSize: Math.max(20, Math.round(size * 0.5)),
            background: item?.color ? `${item.color}22` : "#f7f7f7",
          }}
        >
          {item?.emoji || "📦"}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: item?.color ? `${item.color}22` : "#f7f7f7",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.max(20, Math.round(size * 0.5)),
        flexShrink: 0,
        border: "1px solid #eeeeee",
      }}
    >
      {item?.emoji || "📦"}
    </div>
  );
};

export const CheckoutFlow=({cart,cartTotal,onDone,onBack,user})=>{
 const [step,setStep]=useState(0); // 0=cart review, 1=shipping, 2=payment, 3=confirm
 const [loading,setLoading]=useState(false);
 const [orderId,setOrderId]=useState(`#ORD-${Date.now().toString().slice(-6)}`);
 const shipping=cartTotal>=1000?0:150;
 const total=cartTotal+shipping;
 const [addr,setAddr]=useState({name:user?.name||"",phone:"",address:"",country:"Pakistan",city:"",note:""});
 const [countryCityData,setCountryCityData]=useState([]);
 const [locationLoading,setLocationLoading]=useState(true);
 const [locationError,setLocationError]=useState(false);
 const [pay,setPay]=useState({method:"USDT",txRef:"",cryptoType:"BTC"});

 const STEPS=["Review","Shipping","Payment","Confirm"];

 useEffect(()=>{
   let active=true;
   const loadLocations=async()=>{
     setLocationLoading(true);
     setLocationError(false);
     try{
       const res=await fetch("https://countriesnow.space/api/v0.1/countries");
       const data=await res.json();
       if(!res.ok||data?.error||!Array.isArray(data?.data)) throw new Error("Location data unavailable");
       if(active){
         setCountryCityData(
           data.data
             .filter(x=>x?.country)
             .map(x=>({country:x.country,cities:Array.isArray(x.cities)?x.cities:[]}))
             .sort((a,b)=>a.country.localeCompare(b.country))
         );
       }
     }catch(e){
       if(active){
         setLocationError(true);
         setCountryCityData([{country:"Pakistan",cities:CITIES||[]}]);
       }
     }finally{
       if(active) setLocationLoading(false);
     }
   };
   loadLocations();
   return()=>{active=false;};
 },[]);

 const countries=countryCityData.map(x=>x.country);
 const selectedCountry=countryCityData.find(x=>x.country===addr.country);
 const availableCities=(selectedCountry?.cities||[]).filter(Boolean).sort((a,b)=>a.localeCompare(b));

 if(step===3){
 return(
 <div style={{position:"fixed",inset:0,background:"#f7f7f8",zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}><div style={{textAlign:"center",maxWidth:420}}><div style={{width:90,height:90,background:"linear-gradient(135deg,#34d399,#059669)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:42,margin:"0 auto 24px",boxShadow:"0 20px 60px #34d39940",animation:"fadeUp 0.5s ease"}}></div><h2 style={{fontFamily:"'TikTok Sans',sans-serif",fontSize:28,fontWeight:800,marginBottom:8}}>Order Placed! </h2><p style={{color:"rgba(0,0,0,0.5)",marginBottom:6}}>Your order <span style={{color:"#fe2c55",fontWeight:700}}>{orderId}</span> is confirmed</p><p style={{color:"rgba(0,0,0,0.35)",fontSize:13,marginBottom:28}}>Estimated delivery: 3–5 business days</p><div style={{background:"#ffffff",border:"1px solid #1a1a1a",borderRadius:16,padding:20,marginBottom:24,textAlign:"left"}}><p style={{fontSize:12,color:"#555",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.06em"}}>Order Summary</p>
 {cart.map((item,i)=>(
 <div key={i} style={{display:"flex",gap:10,alignItems:"center",marginBottom:10}}><ProductThumb item={item} size={38} radius={8}/><div style={{flex:1}}><p style={{fontSize:12,fontWeight:500}}>{item.title}</p><p style={{fontSize:11,color:"#555"}}>Qty: {item.qty}</p></div><span style={{fontSize:13,fontWeight:600,color:"#fe2c55"}}>${(item.price*item.qty).toLocaleString()}</span></div>
 ))}
 <div style={{borderTop:"1px solid #1a1a1a",paddingTop:12,marginTop:4}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:12,color:"#555"}}>Subtotal</span><span style={{fontSize:12}}>${cartTotal.toLocaleString()}</span></div><div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:12,color:"#555"}}>Shipping</span><span style={{fontSize:12,color:shipping===0?"#34d399":"#fff"}}>{shipping===0?"Free":"$"+shipping}</span></div><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:700}}>Total</span><span style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:800,fontSize:16,color:"#fe2c55"}}>${total.toLocaleString()}</span></div></div></div><div style={{background:"#ffffff",border:"1px solid #1a1a1a",borderRadius:12,padding:16,marginBottom:24,textAlign:"left"}}><p style={{fontSize:12,color:"#555",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.06em"}}>Delivery To</p><p style={{fontSize:13,fontWeight:600,marginBottom:2}}>{addr.name}</p><p style={{fontSize:12,color:"#888"}}>{addr.address}, {addr.city}{addr.country ? `, ${addr.country}` : ""}</p><p style={{fontSize:12,color:"#888"}}>{addr.phone}</p></div><div style={{display:"flex",gap:10}}><Btn full variant="success" onClick={onDone}>Continue Shopping</Btn></div></div></div>
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
 <div key={i} style={{background:"#ffffff",border:"1px solid #1a1a1a",borderRadius:14,padding:14,display:"flex",gap:14,alignItems:"center"}}><ProductThumb item={item} size={56} radius={12}/><div style={{flex:1}}><p style={{fontSize:13,fontWeight:600,marginBottom:3}}>{item.title}</p><p style={{fontSize:12,color:"rgba(0,0,0,0.4)"}}>Qty: {item.qty} × ${item.price.toLocaleString()}</p></div><span style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:700,fontSize:14,color:"#fe2c55",flexShrink:0}}>${(item.price*item.qty).toLocaleString()}</span></div>
 ))}
 </div><div style={{background:"#ffffff",border:"1px solid #1a1a1a",borderRadius:14,padding:18,marginBottom:20}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{color:"rgba(0,0,0,0.5)"}}>Subtotal</span><span>${cartTotal.toLocaleString()}</span></div><div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}><span style={{color:"rgba(0,0,0,0.5)"}}>Shipping</span><span style={{color:shipping===0?"#34d399":"#fff"}}>{shipping===0?" Free!":"$"+shipping}</span></div>
 {shipping>0&&<div style={{background:"rgba(254,44,85,0.06)",border:"1px solid rgba(254,44,85,0.15)",borderRadius:8,padding:"8px 12px",marginBottom:12}}><p style={{fontSize:11,color:"#fe2c55"}}>Add ${(1000-cartTotal).toLocaleString()} more for free shipping!</p></div>}
 <div style={{display:"flex",justifyContent:"space-between",borderTop:"1px solid #1a1a1a",paddingTop:12}}><span style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:700,fontSize:15}}>Total</span><span style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:800,fontSize:18,color:"#fe2c55"}}>${total.toLocaleString()}</span></div></div><Btn full onClick={()=>setStep(1)}>Continue to Shipping →</Btn></div>
 )}

 {/* STEP 1 — Shipping */}
 {step===1&&(
 <div><h2 style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:800,fontSize:22,marginBottom:20}}>Shipping Details</h2><div style={{background:"#ffffff",border:"1px solid #1a1a1a",borderRadius:14,padding:20,marginBottom:20}}><div className="shipping-name-phone" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><Field label="Full Name *" value={addr.name} onChange={v=>setAddr({...addr,name:v})} placeholder="Muhammad Ali"/><Field label="Phone *" value={addr.phone} onChange={v=>setAddr({...addr,phone:v})} placeholder="+1 555 123 4567"/></div><Field label="Address *" value={addr.address} onChange={v=>setAddr({...addr,address:v})} placeholder="House / Street / Area"/>

 <div className="shipping-location-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
   <div>
     <label style={{fontSize:10,color:"#666",display:"block",marginBottom:5,textTransform:"uppercase"}}>Country *</label>
     <select
       value={addr.country}
       disabled={locationLoading}
       onChange={e=>setAddr({...addr,country:e.target.value,city:""})}
       style={{width:"100%",padding:"11px 12px",background:"#ffffff",border:"1px solid #e5e5e5",borderRadius:8,color:addr.country?"#111":"#888",fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box",marginBottom:14}}
     >
       <option value="">{locationLoading?"Loading countries...":"Select country"}</option>
       {countries.map(c=><option key={c} value={c}>{c}</option>)}
     </select>
   </div>

   <div>
     <label style={{fontSize:10,color:"#666",display:"block",marginBottom:5,textTransform:"uppercase"}}>City *</label>
     {availableCities.length>0 ? (
       <select
         value={addr.city}
         disabled={!addr.country||locationLoading}
         onChange={e=>setAddr({...addr,city:e.target.value})}
         style={{width:"100%",padding:"11px 12px",background:"#ffffff",border:"1px solid #e5e5e5",borderRadius:8,color:addr.city?"#111":"#888",fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box",marginBottom:14}}
       >
         <option value="">{!addr.country?"Select country first":"Select city"}</option>
         {availableCities.map(c=><option key={c} value={c}>{c}</option>)}
       </select>
     ) : (
       <input
         value={addr.city}
         onChange={e=>setAddr({...addr,city:e.target.value})}
         placeholder={!addr.country?"Select country first":"Enter city"}
         disabled={!addr.country}
         style={{width:"100%",padding:"11px 12px",background:"#ffffff",border:"1px solid #e5e5e5",borderRadius:8,color:"#111",fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box",marginBottom:14}}
       />
     )}
   </div>
 </div>

 {locationError&&<p style={{fontSize:11,color:"#b45309",marginTop:-6,marginBottom:12}}>Worldwide city service is temporarily unavailable. You can still enter your city manually.</p>}

 <Field label="Note for rider (optional)" value={addr.note} onChange={v=>setAddr({...addr,note:v})} placeholder="e.g. Call before delivery"/></div><div style={{background:"rgba(254,44,85,0.05)",border:"1px solid rgba(254,44,85,0.15)",borderRadius:12,padding:14,marginBottom:20,display:"flex",gap:12,alignItems:"center"}}><span style={{fontSize:24}}></span><div><p style={{fontSize:13,fontWeight:600,marginBottom:2}}>Estimated Delivery</p><p style={{fontSize:12,color:"#888"}}>3–5 business days · {shipping===0?"Free Shipping":"$"+shipping+" shipping fee"}</p></div></div><Btn full disabled={!addr.name||!addr.phone||!addr.address||!addr.country||!addr.city} onClick={()=>setStep(2)}>Continue to Payment →</Btn></div>
 )}

 {/* STEP 2 — Payment */}
 {step===2&&(
 <div><h2 style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:800,fontSize:22,marginBottom:20}}>Payment Method</h2><div style={{display:"flex",gap:10,marginBottom:20}}>
 {[["USDT"," USDT"],["Crypto","₿ Crypto"]].map(([m,l])=>(
 <button key={m} onClick={()=>setPay({...pay,method:m})} style={{flex:1,padding:"10px 6px",borderRadius:10,border:`2px solid ${pay.method===m?"#fe2c55":"#e5e5e5"}`,background:pay.method===m?"rgba(254,44,85,0.08)":"#f7f7f8",color:pay.method===m?"#fe2c55":"#666",fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:pay.method===m?700:400,textAlign:"center",transition:"all 0.2s"}}>{l}</button>
 ))}
 </div>

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

 <div style={{background:"#ffffff",border:"1px solid #1a1a1a",borderRadius:12,padding:14,marginBottom:20}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:13,color:"#555"}}>Items ({cart.reduce((s,i)=>s+i.qty,0)})</span><span style={{fontSize:13}}>${cartTotal.toLocaleString()}</span></div><div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:13,color:"#555"}}>Shipping</span><span style={{fontSize:13,color:shipping===0?"#34d399":"#fff"}}>{shipping===0?"Free":"$"+shipping}</span></div><div style={{display:"flex",justifyContent:"space-between",borderTop:"1px solid #1a1a1a",paddingTop:10}}><span style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:700}}>Total</span><span style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:800,fontSize:17,color:"#fe2c55"}}>${total.toLocaleString()}</span></div></div><Btn full loading={loading} onClick={async()=>{
 setLoading(true);
 try {
 const token = localStorage.getItem("shopToken");
 if(!token) throw new Error("Please log in again before placing your order.");

 // Static catalogue cards can carry readable IDs such as "p05-running-shoes".
 // The database uses UUID product IDs, so resolve any legacy/static cart ID
 // against the live products API before creating the order.
 const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
 let liveProducts = null;
 const resolveProductId = async (item) => {
   const rawId = String(item?.id || item?.product_id || "");
   if(uuidRe.test(rawId)) return rawId;

   if(!liveProducts){
     const productsRes = await fetch(`${API}/products?limit=100`);
     const productsData = await productsRes.json().catch(()=>({}));
     if(!productsRes.ok) throw new Error(productsData.message || "Could not verify product before checkout.");
     liveProducts = Array.isArray(productsData.products) ? productsData.products : [];
   }

   const wantedTitle = String(item?.title || "").trim().toLowerCase();
   const match = liveProducts.find(p =>
     uuidRe.test(String(p?.id || "")) &&
     String(p?.title || "").trim().toLowerCase() === wantedTitle
   );

   if(!match?.id){
     throw new Error(`Product "${item?.title || "Unknown product"}" is not linked to a live database product.`);
   }
   return match.id;
 };

 // Send one order per cart item (backend handles one product per order)
 let lastOrder = null;
 for(const item of cart) {
 const productId = await resolveProductId(item);
 const res = await fetch(`${API}/orders`, {
 method: "POST",
 headers: {"Content-Type":"application/json","Authorization":`Bearer ${token}`},
 body: JSON.stringify({
 product_id: productId,
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
 {pay.method==="cod"?" Place Order (COD)":pay.method==="card"?" Pay $"+total.toLocaleString():" Confirm & Pay $"+total.toLocaleString()}
 </Btn></div>
 )}
 <style>{`
   @media(max-width:600px){
     .shipping-name-phone,
     .shipping-location-grid{
       grid-template-columns:1fr!important;
       gap:0!important;
     }
   }
 `}</style>
 </div></div>
 );
};

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────

export default CheckoutFlow;
