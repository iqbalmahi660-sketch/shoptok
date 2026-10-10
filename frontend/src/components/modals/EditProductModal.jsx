import { useState, useEffect, useRef } from "react";
import { API, COLORS_LIST, SIZES_CLOTHING } from "../../data/catalogue.js";

export const EditProductModal=({prod,onClose,onSave})=>{
 const [f,sf]=useState({
 title:prod.title||"",
 price:prod.price||"",
 orig:prod.orig||prod.original_price||prod.price||"",
 stock:prod.stock||"",
 description:prod.description||"",
 sizes:prod.sizes||[],
 colors:prod.colors||[],
 // Promotions
 flashSale:!!prod.flashSale,
 flashDiscount:prod.flashDiscount||"",
 flashExpiry:prod.flashExpiry||"",
 freeShipping:!!prod.freeShipping,
 featured:!!prod.featured,
 buyXgetY:prod.buyXgetY||"",
 promoCode:prod.promoCode||"",
 promoDiscount:prod.promoDiscount||"",
 allowReselling:!!prod.allow_reselling,
 resellerBasePrice:prod.reseller_base_price||prod.price||"",
 minResalePrice:prod.min_resale_price||prod.reseller_base_price||prod.price||"",
 });
 const [tab,setTab]=useState("basic");
 const [customSize,setCustomSize]=useState("");
 const [customColor,setCustomColor]=useState("#111111");
 const [loading,setLoading]=useState(false);
 const toggleSize=s=>sf(p=>({...p,sizes:p.sizes.includes(s)?p.sizes.filter(x=>x!==s):[...p.sizes,s]}));
 const toggleColor=c=>sf(p=>({...p,colors:p.colors.includes(c)?p.colors.filter(x=>x!==c):[...p.colors,c]}));
 const addCustomSize=()=>{const v=customSize.trim();if(!v)return;sf(p=>({...p,sizes:p.sizes.some(x=>String(x).toLowerCase()===v.toLowerCase())?p.sizes:[...p.sizes,v]}));setCustomSize("");};
 const addCustomColor=()=>sf(p=>({...p,colors:p.colors.includes(customColor)?p.colors:[...p.colors,customColor]}));

 const save=async()=>{
 if(f.allowReselling){
   const base=Number(f.resellerBasePrice||f.price);
   const min=Number(f.minResalePrice||f.resellerBasePrice||f.price);
   if(!Number.isFinite(base)||base<=0){alert("Enter a valid reseller base price");return;}
   if(!Number.isFinite(min)||min<base){alert("Minimum resale price cannot be below reseller base price");return;}
 }
 setLoading(true);
 try{
 const token=localStorage.getItem("shopToken");
 await fetch(`${API}/products/${prod.id}`,{
 method:"PUT",
 headers:{"Content-Type":"application/json","Authorization":`Bearer ${token}`},
 body:JSON.stringify({
 title:f.title,
 price:Number(f.price),
 original_price:Number(f.orig)||Number(f.price),
 stock:Number(f.stock),
 description:f.description,
 sizes:f.sizes,
 colors:f.colors,
 allow_reselling:f.allowReselling,
 reseller_base_price:f.allowReselling?Number(f.resellerBasePrice||f.price):null,
 min_resale_price:f.allowReselling?Number(f.minResalePrice||f.resellerBasePrice||f.price):null
 })
 });
 }catch(e){console.log("API update failed, updating locally");}
 onSave({...prod,...f,price:Number(f.price),orig:Number(f.orig)||Number(f.price),stock:Number(f.stock),disc:f.orig?Math.round((1-f.price/f.orig)*100):0});
 setLoading(false);
 onClose();
 };

 const inp=(label,key,type="text",placeholder="")=>(
 <div style={{marginBottom:14}}><label style={{fontSize:11,color:"#666",display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.05em"}}>{label}</label><input type={type} value={f[key]} onChange={e=>sf(p=>({...p,[key]:e.target.value}))} placeholder={placeholder}
 style={{width:"100%",background:"rgba(0,0,0,0.06)",border:"1px solid rgba(0,0,0,0.1)",borderRadius:10,padding:"10px 14px",color:"#111",fontSize:13,fontFamily:"inherit",outline:"none"}}/></div>
 );

 return(
 <><div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(8px)",zIndex:500}}/><div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:"min(600px,94vw)",maxHeight:"90vh",overflowY:"auto",background:"#ffffff",border:"1px solid rgba(0,0,0,0.1)",borderRadius:20,zIndex:501,padding:0}}>
 {/* Header */}
 <div style={{padding:"18px 24px",borderBottom:"1px solid rgba(0,0,0,0.07)",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:"#ffffff",zIndex:10}}><h3 style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:700,fontSize:16}}>Edit Product</h3><button onClick={onClose} style={{width:32,height:32,borderRadius:"50%",background:"rgba(0,0,0,0.07)",border:"none",color:"#111",cursor:"pointer",fontSize:18}}>×</button></div>

 {/* Tabs */}
 <div style={{display:"flex",borderBottom:"1px solid rgba(0,0,0,0.07)"}}>
 {[["basic"," Basic Info"],["reseller"," Reseller"],["promo"," Promotions"],["shipping"," Shipping"]].map(([k,l])=>(
 <button key={k} onClick={()=>setTab(k)}
 style={{flex:1,padding:"12px 8px",background:"none",border:"none",borderBottom:`2px solid ${tab===k?"#fe2c55":"transparent"}`,color:tab===k?"#fe2c55":"rgba(0,0,0,0.5)",fontFamily:"inherit",fontWeight:600,fontSize:12,cursor:"pointer"}}>
 {l}
 </button>
 ))}
 </div><div style={{padding:"20px 24px"}}>
 {tab==="basic"&&(
 <>
 {inp("Product Title *","title","text","Enter product name")}
 <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
 {inp("Sale Price ($) *","price","number","e.g. 2499")}
 {inp("Original Price ($)","orig","number","e.g. 3500")}
 </div>
 {inp("Stock Quantity *","stock","number","e.g. 50")}
 <div style={{marginBottom:14}}><label style={{fontSize:11,color:"#666",display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.05em"}}>Description</label><textarea value={f.description} onChange={e=>sf(p=>({...p,description:e.target.value}))} rows={3}
 style={{width:"100%",background:"rgba(0,0,0,0.06)",border:"1px solid rgba(0,0,0,0.1)",borderRadius:10,padding:"10px 14px",color:"#111",fontSize:13,fontFamily:"inherit",outline:"none",resize:"vertical"}}
 placeholder="Describe your product..."/></div>

 {/* Sizes - optional, available for any product */}
 <div style={{marginBottom:14}}><label style={{fontSize:11,color:"#666",display:"block",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>Available Sizes (optional)</label><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
 {SIZES_CLOTHING.map(s=><button type="button" key={s} onClick={()=>toggleSize(s)}
 style={{padding:"6px 14px",borderRadius:6,border:`1px solid ${f.sizes.includes(s)?"#fe2c55":"rgba(0,0,0,0.1)"}`,background:f.sizes.includes(s)?"rgba(254,44,85,0.12)":"rgba(0,0,0,0.04)",color:f.sizes.includes(s)?"#fe2c55":"#666",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>{s}</button>)}
 <div style={{width:"100%",display:"flex",gap:8,marginTop:8}}><input value={customSize} onChange={e=>setCustomSize(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();addCustomSize();}}} placeholder="Custom size e.g. 42, Free Size" style={{flex:1,padding:"9px 11px",border:"1px solid #ddd",borderRadius:8,fontFamily:"inherit"}}/><button type="button" onClick={addCustomSize} style={{padding:"9px 12px",border:"none",borderRadius:8,background:"#111",color:"#fff",fontWeight:700,cursor:"pointer"}}>+ Add</button></div>
 {f.sizes.length>0&&<div style={{width:"100%",display:"flex",gap:6,flexWrap:"wrap",marginTop:8}}>{f.sizes.map(s=><span key={`selected-${s}`} style={{display:"inline-flex",alignItems:"center",gap:5,padding:"5px 8px",borderRadius:100,background:"#f3f3f3",fontSize:11}}>{s}<button type="button" onClick={()=>sf(p=>({...p,sizes:p.sizes.filter(x=>x!==s)}))} style={{border:"none",background:"none",cursor:"pointer"}}>×</button></span>)}</div>}
 </div></div>

 {/* Colors - optional, available for any product */}
 <div style={{marginBottom:14}}><label style={{fontSize:11,color:"#666",display:"block",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>Available Colors (optional)</label><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
 {COLORS_LIST.map(c=><button type="button" key={c} onClick={()=>toggleColor(c)}
 style={{width:28,height:28,borderRadius:"50%",background:c,cursor:"pointer",border:`3px solid ${f.colors.includes(c)?"#fe2c55":"transparent"}`,boxShadow:c==="#ffffff"?"0 0 0 1px rgba(0,0,0,0.2)":"none"}}/>)}
 <div style={{width:"100%",display:"flex",alignItems:"center",gap:8,marginTop:8}}><input type="color" value={customColor} onChange={e=>setCustomColor(e.target.value)} style={{width:44,height:38,border:"1px solid #ddd",borderRadius:8}}/><input value={customColor} onChange={e=>/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)&&setCustomColor(e.target.value)} style={{flex:1,padding:"9px 11px",border:"1px solid #ddd",borderRadius:8,fontFamily:"monospace"}}/><button type="button" onClick={addCustomColor} style={{padding:"9px 12px",border:"none",borderRadius:8,background:"#111",color:"#fff",fontWeight:700,cursor:"pointer"}}>+ Add</button></div>
 {f.colors.length>0&&<div style={{width:"100%",display:"flex",gap:7,flexWrap:"wrap",marginTop:8}}>{f.colors.map(c=><span key={`selected-${c}`} style={{display:"inline-flex",alignItems:"center",gap:5,padding:"5px 8px",borderRadius:100,background:"#f3f3f3",fontSize:11}}><span style={{width:13,height:13,borderRadius:"50%",background:c,border:"1px solid #ccc"}}/>{c}<button type="button" onClick={()=>sf(p=>({...p,colors:p.colors.filter(x=>x!==c)}))} style={{border:"none",background:"none",cursor:"pointer"}}>×</button></span>)}</div>}
 </div></div>

 {/* Price preview */}
 {f.price&&f.orig&&Number(f.orig)>Number(f.price)&&(
 <div style={{background:"rgba(52,211,153,0.08)",border:"1px solid rgba(52,211,153,0.2)",borderRadius:10,padding:"12px 16px",marginBottom:14}}><p style={{fontSize:13,color:"#34d399"}}>Discount: {Math.round((1-f.price/f.orig)*100)}% OFF — Customer saves ${(f.orig-f.price).toLocaleString()}</p></div>
 )}
 </>
 )}


 {tab==="reseller"&&(
 <div>
   <div style={{background:"rgba(254,44,85,0.05)",border:"1px solid rgba(254,44,85,0.16)",borderRadius:12,padding:16,marginBottom:14}}>
     <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:14}}>
       <div>
         <p style={{fontWeight:700,fontSize:14,color:"#111"}}>Allow Reselling</p>
         <p style={{fontSize:12,color:"rgba(0,0,0,0.48)",marginTop:3,lineHeight:1.5}}>Other TokZoo sellers can add this product to their stores while your stock stays the master inventory.</p>
       </div>
       <div
         onClick={()=>sf(p=>({
           ...p,
           allowReselling:!p.allowReselling,
           resellerBasePrice:!p.allowReselling?(p.resellerBasePrice||p.price):p.resellerBasePrice,
           minResalePrice:!p.allowReselling?(p.minResalePrice||p.resellerBasePrice||p.price):p.minResalePrice
         }))}
         style={{width:44,height:24,borderRadius:12,background:f.allowReselling?"#fe2c55":"#ccc",position:"relative",cursor:"pointer",transition:"background 0.2s",flexShrink:0}}
       >
         <div style={{position:"absolute",top:3,left:f.allowReselling?22:3,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/>
       </div>
     </div>
   </div>

   {f.allowReselling&&(
     <>
       {inp("Supplier / Base Price ($)","resellerBasePrice","number","e.g. 20")}
       {inp("Minimum Resale Price ($)","minResalePrice","number","e.g. 24")}
       <div style={{background:"#fafafa",border:"1px solid #eee",borderRadius:10,padding:"12px 14px"}}>
         <p style={{fontSize:12,color:"#666",lineHeight:1.6}}>
           The reseller chooses their customer price, but it cannot be below your minimum resale price.
           Your inventory remains the single source of truth.
         </p>
       </div>
     </>
   )}
 </div>
 )}

 {tab==="promo"&&(
 <><p style={{fontSize:12,color:"rgba(0,0,0,0.4)",marginBottom:16}}>Set up promotions and special offers for your product</p>

 {/* Flash Sale */}
 <div style={{background:"rgba(254,44,85,0.06)",border:"1px solid rgba(254,44,85,0.2)",borderRadius:12,padding:16,marginBottom:14}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><div><p style={{fontWeight:700,fontSize:14}}>Flash Sale</p><p style={{fontSize:12,color:"rgba(0,0,0,0.4)"}}>Time-limited discount offer</p></div><div onClick={()=>sf(p=>({...p,flashSale:!p.flashSale}))}
 style={{width:44,height:24,borderRadius:12,background:f.flashSale?"#fe2c55":"#333",position:"relative",cursor:"pointer",transition:"background 0.2s"}}><div style={{position:"absolute",top:3,left:f.flashSale?22:3,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/></div></div>
 {f.flashSale&&(
 <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
 {inp("Extra Discount %","flashDiscount","number","e.g. 15")}
 {inp("Sale Ends (Date)","flashExpiry","date","")}
 </div>
 )}
 </div>

 {/* Free Shipping */}
 <div style={{background:"rgba(37,244,238,0.06)",border:"1px solid rgba(37,244,238,0.2)",borderRadius:12,padding:16,marginBottom:14}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><p style={{fontWeight:700,fontSize:14}}>Free Shipping</p><p style={{fontSize:12,color:"rgba(0,0,0,0.4)"}}>Offer free delivery on this product</p></div><div onClick={()=>sf(p=>({...p,freeShipping:!p.freeShipping}))}
 style={{width:44,height:24,borderRadius:12,background:f.freeShipping?"#25f4ee":"#333",position:"relative",cursor:"pointer",transition:"background 0.2s"}}><div style={{position:"absolute",top:3,left:f.freeShipping?22:3,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/></div></div></div>

 {/* Featured */}
 <div style={{background:"rgba(251,191,36,0.06)",border:"1px solid rgba(251,191,36,0.2)",borderRadius:12,padding:16,marginBottom:14}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><p style={{fontWeight:700,fontSize:14}}>Featured Product</p><p style={{fontSize:12,color:"rgba(0,0,0,0.4)"}}>Show in trending & featured sections</p></div><div onClick={()=>sf(p=>({...p,featured:!p.featured}))}
 style={{width:44,height:24,borderRadius:12,background:f.featured?"#fbbf24":"#333",position:"relative",cursor:"pointer",transition:"background 0.2s"}}><div style={{position:"absolute",top:3,left:f.featured?22:3,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/></div></div></div>

 {/* Buy X Get Y */}
 <div style={{background:"rgba(167,139,250,0.06)",border:"1px solid rgba(167,139,250,0.2)",borderRadius:12,padding:16,marginBottom:14}}><p style={{fontWeight:700,fontSize:14,marginBottom:6}}>Buy X Get Y Free</p>
 {inp("e.g. Buy 2 Get 1 Free","buyXgetY","text","Buy 2 Get 1 Free")}
 </div>

 {/* Promo Code */}
 <div style={{background:"rgba(52,211,153,0.06)",border:"1px solid rgba(52,211,153,0.2)",borderRadius:12,padding:16}}><p style={{fontWeight:700,fontSize:14,marginBottom:10}}>Promo Code</p><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
 {inp("Code (e.g. SAVE20)","promoCode","text","SAVE20")}
 {inp("Discount %","promoDiscount","number","20")}
 </div></div></>
 )}

 {tab==="shipping"&&(
 <><div style={{background:"rgba(37,244,238,0.06)",border:"1px solid rgba(37,244,238,0.2)",borderRadius:12,padding:16,marginBottom:14}}><p style={{fontWeight:700,fontSize:14,marginBottom:4}}>Shipping Settings</p><p style={{fontSize:12,color:"rgba(0,0,0,0.4)",marginBottom:14}}>Configure delivery options for this product</p>
 {inp("Weight (kg)","weight","number","e.g. 0.5")}
 {inp("SKU / Product Code","sku","text","e.g. PROD-001")}
 <div style={{background:"rgba(251,191,36,0.08)",border:"1px solid rgba(251,191,36,0.2)",borderRadius:10,padding:"12px 14px"}}><p style={{fontSize:12,color:"#fbbf24"}}>Shipping is currently free at checkout.</p></div></div></>
 )}

 <div style={{display:"flex",gap:10,marginTop:16}}><button onClick={onClose} style={{flex:1,padding:"12px",background:"rgba(0,0,0,0.06)",border:"none",borderRadius:10,color:"rgba(0,0,0,0.6)",cursor:"pointer",fontFamily:"inherit",fontSize:13}}>Cancel</button><button onClick={save} disabled={loading}
 style={{flex:2,padding:"12px",background:"linear-gradient(135deg,#fe2c55,#ff6b35)",border:"none",borderRadius:10,color:"#fff",fontFamily:"'TikTok Sans',sans-serif",fontWeight:700,fontSize:13,cursor:"pointer",opacity:loading?0.7:1}}>
 {loading?"Saving...":" Save Changes"}
 </button></div></div></div></>
 );
};

export default EditProductModal;
