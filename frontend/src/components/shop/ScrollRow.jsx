import { useState, useEffect, useRef } from "react";

export const ScrollRow=({children})=>{
 const ref=useRef(null);
 return(
 <div style={{position:"relative"}}><div ref={ref} className="hscroll" style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:6,scrollBehavior:"smooth"}}>
 {children}
 </div><button onClick={()=>ref.current&&ref.current.scrollBy({left:-300,behavior:"smooth"})}
 style={{position:"absolute",top:"38%",left:-4,transform:"translateY(-50%)",width:32,height:32,borderRadius:"50%",background:"#fff",border:"1px solid #eee",boxShadow:"0 2px 10px rgba(0,0,0,0.18)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,color:"#333"}}>‹</button><button onClick={()=>ref.current&&ref.current.scrollBy({left:300,behavior:"smooth"})}
 style={{position:"absolute",top:"38%",right:-4,transform:"translateY(-50%)",width:32,height:32,borderRadius:"50%",background:"#fff",border:"1px solid #eee",boxShadow:"0 2px 10px rgba(0,0,0,0.18)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,color:"#333"}}>›</button></div>
 );
};

export default ScrollRow;
