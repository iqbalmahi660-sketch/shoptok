export const StorePanel=({store,detail,onClose,addToCart,showToast,setSP})=>{
 const products=Array.isArray(detail?.products)?detail.products:[];
 const normalize=(p)=>({
   ...p,
   price:Number(p.price)||0,
   orig:Number(p.original_price||p.orig||p.price)||0,
   disc:Number(p.discount_pct||p.disc)||0,
   cat:p.category||p.cat||"all",
   emoji:p.emoji||"",
   color:"#fe2c55",
   rating:Number(p.rating)||0,
   sold:Number(p.sold)||0,
   img:p.img||(Array.isArray(p.images)&&p.images.length?p.images[0]:(p.image_url||p.image||p.thumbnail||null)),
 });

 return(
 <div style={{position:"fixed",inset:0,background:"#f7f7f8",zIndex:500,overflowY:"auto",animation:"fadeUp 0.3s ease"}}>
   <div style={{position:"sticky",top:0,zIndex:10,background:"rgba(255,255,255,0.97)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(0,0,0,0.07)",padding:"13px 24px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
     <button onClick={onClose} style={{width:36,height:36,borderRadius:"50%",background:"rgba(0,0,0,0.07)",border:"none",color:"#111",cursor:"pointer",fontSize:17}}>←</button>
     <span style={{fontWeight:700,fontSize:14}}>Store</span><div style={{width:36}}/>
   </div>

   <div style={{maxWidth:1000,margin:"0 auto",paddingBottom:80}}>
     <div style={{background:"linear-gradient(135deg,#fe2c55,#ff6b35)",padding:"44px 24px",textAlign:"center",position:"relative",overflow:"hidden"}}>
       <div style={{width:84,height:84,borderRadius:22,overflow:"hidden",background:"rgba(255,255,255,.18)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,fontWeight:800,color:"#fff",margin:"0 auto 14px",border:"3px solid rgba(255,255,255,.45)"}}>
         {store.profile_img?<img src={store.profile_img} alt={store.shop_name||"Store"} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:String(store.shop_name||"S").charAt(0).toUpperCase()}
       </div>
       <h1 style={{fontWeight:800,fontSize:28,marginBottom:7,color:"#fff"}}>{store.shop_name}</h1>
       <p style={{fontSize:13,color:"rgba(255,255,255,.9)",marginBottom:store.shop_bio?10:20}}>{[store.category,store.city].filter(Boolean).join(" · ")||"TokZoo Seller"}</p>
       {store.shop_bio&&<p style={{fontSize:12.5,color:"rgba(255,255,255,.88)",maxWidth:560,margin:"0 auto 18px",lineHeight:1.6}}>{store.shop_bio}</p>}
       <div style={{display:"flex",gap:32,justifyContent:"center",color:"#fff"}}>
         <div><p style={{fontWeight:800,fontSize:20}}>⭐ {Number(store.rating||0).toFixed(1)}</p><p style={{fontSize:11,opacity:.85}}>Rating</p></div>
         <div><p style={{fontWeight:800,fontSize:20}}>{store.product_count??products.length}</p><p style={{fontSize:11,opacity:.85}}>Products</p></div>
         <div><p style={{fontWeight:800,fontSize:20}}>✓</p><p style={{fontSize:11,opacity:.85}}>Verified</p></div>
       </div>
     </div>

     <div style={{padding:"28px 18px"}}>
       <h2 style={{fontWeight:800,fontSize:20,marginBottom:18}}>Products</h2>
       {detail?.loading?(
         <div style={{textAlign:"center",padding:"60px 0",color:"#fe2c55"}}>Loading...</div>
       ):!products.length?(
         <div style={{textAlign:"center",padding:"60px 0",color:"#888"}}>No products yet</div>
       ):(
         <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:12}}>
           {products.map(raw=>{
             const p=normalize(raw);
             return <div key={p.id} onClick={()=>setSP(p)} style={{background:"#fff",border:"1px solid #ececef",borderRadius:14,overflow:"hidden",cursor:"pointer"}}>
               <div style={{aspectRatio:"1",background:"#f4f4f5",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",fontSize:42,color:"#999",position:"relative"}}>
                 {p.img?<img src={p.img} alt={p.title||"Product"} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:(p.emoji||"No image")}
                 {p.listing_type==="reseller"&&(
                   <span style={{position:"absolute",left:8,top:8,background:"rgba(17,17,17,.86)",color:"#fff",fontSize:9.5,fontWeight:700,padding:"4px 7px",borderRadius:999,lineHeight:1}}>Reseller Product</span>
                 )}
               </div>
               <div style={{padding:"10px 11px"}}>
                 <p style={{fontSize:12,fontWeight:600,lineHeight:1.4,minHeight:34,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{p.title}</p>
                 <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,marginTop:8}}>
                   <span style={{fontWeight:800,fontSize:13,color:"#fe2c55"}}>${Number(p.price).toFixed(2)}</span>
                   <button onClick={e=>{e.stopPropagation();addToCart(p);showToast("Added!");}} style={{background:"#fe2c55",border:"none",width:28,height:28,borderRadius:"50%",cursor:"pointer",fontSize:16,color:"#fff"}}>+</button>
                 </div>
               </div>
             </div>;
           })}
         </div>
       )}
     </div>
   </div>
 </div>
 );
};

export default StorePanel;
