import { useState, useEffect, useRef } from "react";
import Stars from "../common/Stars.jsx";

export const VideoProductCard=({v,p,onOpen,onAdd,dark=true})=>{
 const fb=`https://placehold.co/400x560/${(v.color||"#333").replace("#","")}/ffffff?text=`;
 const fbp=p?`https://placehold.co/60x60/${(p.color||"#fe2c55").replace("#","")}/ffffff?text=`:"";
 return (
 <div className="hcard" onClick={()=>onOpen(p)} style={{background:"#fff",border:"1px solid #f0f0f0",borderRadius:6,overflow:"hidden",cursor:"pointer",transition:"all 0.2s",flexShrink:0,width:170}}><div style={{aspectRatio:"3/4",display:"flex",flexDirection:"column",justifyContent:"space-between",padding:8,position:"relative",background:v.bg}}>
 <img src={v.img||fb} alt="" loading="lazy" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}
 onError={e=>{if(e.currentTarget.src!==fb){e.currentTarget.src=fb;}}}/>
 <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(0,0,0,0.15),transparent 30%,transparent 60%,rgba(0,0,0,0.55))"}}/><span style={{position:"relative",alignSelf:"flex-start",background:"rgba(0,0,0,0.55)",color:"#fff",fontSize:10,fontWeight:600,padding:"3px 7px",borderRadius:100,display:"flex",alignItems:"center",gap:4,zIndex:1}}>{20+ (v.id*7)%40}s</span><div style={{position:"relative",display:"flex",alignItems:"center",gap:6,zIndex:1}}><span style={{width:20,height:20,borderRadius:"50%",background:"rgba(255,255,255,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#fff"}}>{v.creator?.[0]?.toUpperCase()}</span><span style={{fontSize:10.5,color:"#fff",fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.creator}</span></div>
 {p&&<div style={{position:"absolute",bottom:6,right:6,width:26,height:26,borderRadius:6,overflow:"hidden",background:"#fff",border:"2px solid #fff",boxShadow:"0 1px 4px rgba(0,0,0,0.3)",zIndex:1}}>
 <img src={p.img||fbp} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{if(e.currentTarget.src!==fbp){e.currentTarget.src=fbp;}}}/>
 </div>}
 </div>
 {p&&<div style={{padding:"7px 8px 9px"}}><p style={{fontSize:12,fontWeight:400,lineHeight:1.35,marginBottom:5,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",minHeight:32,color:"#111"}}>{p.title}</p><p style={{fontSize:11,color:"#333",marginBottom:3,display:"flex",alignItems:"center",gap:4}}><Stars rating={p.rating}/> {p.sold>=1000?(p.sold/1000).toFixed(1)+"K":p.sold} sold</p><div style={{display:"flex",alignItems:"baseline",gap:5,flexWrap:"wrap"}}>
 {p.disc>0&&<span style={{fontSize:12,fontWeight:700,color:"#fe2c55"}}>-{p.disc}%</span>}
 <span style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:700,fontSize:13,color:"#111"}}>Rs {p.price?.toLocaleString()}</span>
 {p.orig>p.price&&<span style={{fontSize:10.5,color:"#999",textDecoration:"line-through"}}>Rs {p.orig?.toLocaleString()}</span>}
 </div></div>}
 </div>
 );
};

export default VideoProductCard;
