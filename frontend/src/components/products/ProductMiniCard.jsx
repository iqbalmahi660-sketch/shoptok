import { useState, useEffect, useRef } from "react";
import ImgOrEmoji from "../common/ImgOrEmoji.jsx";
import Stars from "../common/Stars.jsx";

export const ProductMiniCard=({p,onOpen,onAdd,wide,dark=true})=>(
 <div className="hcard" onClick={()=>onOpen(p)} style={{background:"#fff",border:"1px solid #f0f0f0",borderRadius:6,overflow:"hidden",cursor:"pointer",transition:"all 0.2s",flexShrink:0,width:wide?170:"100%"}}><div style={{aspectRatio:"1",position:"relative"}}><ImgOrEmoji src={p.img} emoji={p.emoji} color={p.color} alt={p.title}/><span style={{position:"absolute",bottom:0,left:0,background:"#0abf83",color:"#fff",fontSize:9,fontWeight:600,padding:"3px 7px 3px 6px",borderTopRightRadius:6,zIndex:1}}>Free shipping</span><button onClick={e=>{e.stopPropagation();onAdd(p);}} style={{position:"absolute",bottom:7,right:7,background:"rgba(255,255,255,0.92)",border:"none",width:24,height:24,borderRadius:"50%",cursor:"pointer",fontSize:16,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",color:"#fe2c55",boxShadow:"0 1px 4px rgba(0,0,0,0.2)",zIndex:1,lineHeight:1}}>+</button></div><div style={{padding:"7px 8px 9px"}}><p style={{fontSize:12,fontWeight:400,lineHeight:1.35,marginBottom:5,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",minHeight:32,color:"#111"}}>{p.title}</p><p style={{fontSize:11,color:"#333",marginBottom:3,display:"flex",alignItems:"center",gap:4}}><Stars rating={p.rating}/> {p.sold>=1000?(p.sold/1000).toFixed(1)+"K":p.sold} sold</p><div style={{display:"flex",alignItems:"baseline",gap:5,flexWrap:"wrap"}}>
 {p.disc>0&&<span style={{fontSize:12,fontWeight:700,color:"#fe2c55"}}>-{p.disc}%</span>}
 <span style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:700,fontSize:13,color:"#111"}}>Rs {p.price?.toLocaleString()}</span>
 {p.orig>p.price&&<span style={{fontSize:10.5,color:"#999",textDecoration:"line-through"}}>Rs {p.orig?.toLocaleString()}</span>}
 </div></div></div>
);

export default ProductMiniCard;
