import { useState, useEffect, useRef } from "react";
import { ProductMiniCard } from "../products/ProductMiniCard.jsx";
import { ScrollRow } from "./ScrollRow.jsx";
import { VideoProductCard } from "../products/VideoProductCard.jsx";

export const ShopSections=({products,vids,onOpen,onAdd,dark=true})=>{
 const [showAll,setShowAll]=useState(false);
 if(!products||products.length===0)return null;
 const pick=(start,n)=>{const out=[];for(let i=0;i<n;i++)out.push(products[(start+i)%products.length]);return out;};
 const savings=vids.map((v,i)=>({v,p:products.find(pr=>v.prods.includes(pr.id))||pick(i,1)[0]}));
 const topDeals=pick(0,5);
 const popular=pick(5,5);
 const starDeals=[...products].filter(p=>p.rating>=4.6).slice(0,5).concat(pick(2,5)).slice(0,5);
 const bestSellers=[...products].sort((a,b)=>(b.sold||0)-(a.sold||0));
 const Section=({title,children})=>(
 <div style={{marginBottom:34}}><h2 style={{fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:19,marginBottom:14,color:"#111"}}>{title}</h2>
 {children}
 </div>
 );
 return(
 <div><Section title="Savings for you"><ScrollRow>
 {savings.map(({v,p},i)=>p?<VideoProductCard key={v.id} v={v} p={p} onOpen={onOpen} onAdd={onAdd} dark={dark}/>:null)}
 </ScrollRow></Section><Section title="Top deals for you"><ScrollRow>
 {topDeals.map((p,i)=><ProductMiniCard key={p.id+"-td"+i} p={p} onOpen={onOpen} onAdd={onAdd} wide dark={dark}/>)}
 </ScrollRow></Section><Section title="Popular items"><ScrollRow>
 {popular.map((p,i)=><ProductMiniCard key={p.id+"-pop"+i} p={p} onOpen={onOpen} onAdd={onAdd} wide dark={dark}/>)}
 </ScrollRow></Section><Section title="4+ star deals for you"><ScrollRow>
 {starDeals.map((p,i)=><ProductMiniCard key={p.id+"-star"+i} p={p} onOpen={onOpen} onAdd={onAdd} wide dark={dark}/>)}
 </ScrollRow></Section><Section title="Best sellers"><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12}} className="shop-grid">
 {(showAll?bestSellers:bestSellers.slice(0,10)).map((p,i)=>(
 <div key={p.id+"-bs"+i} style={{animation:`fadeUp 0.4s ease ${i*0.03}s both`}}><ProductMiniCard p={p} onOpen={onOpen} onAdd={onAdd} dark={dark}/></div>
 ))}
 </div>
 {!showAll&&bestSellers.length>10&&(
 <div style={{textAlign:"center",marginTop:24}}><button onClick={()=>setShowAll(true)} style={{background:"#fff",border:"1px solid #ddd",color:"#111",padding:"10px 40px",borderRadius:6,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>View more</button></div>
 )}
 </Section></div>
 );
};

export default ShopSections;
