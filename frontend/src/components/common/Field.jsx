import { useState, useEffect, useRef } from "react";

export const Field=({label,type="text",value,onChange,placeholder,error})=>{
 const [show,setSh]=useState(false);
 const isP=type==="password";
 return(
 <div style={{marginBottom:14}}>
 {label&&<label style={{display:"block",fontSize:10,color:"#666",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.06em"}}>{label}</label>}
 <div style={{position:"relative"}}><input type={isP&&show?"text":type} value={value} onChange={e=>onChange&&onChange(e.target.value)} placeholder={placeholder}
 style={{width:"100%",padding:"11px 14px",paddingRight:isP?42:14,background:"#ffffff",border:`1px solid ${error?"#fe2c55":"#e5e5e5"}`,borderRadius:8,color:"#111",fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}
 onFocus={e=>{e.target.style.borderColor="#fe2c55";}} onBlur={e=>{if(!error)e.target.style.borderColor="#e5e5e5";}}/>
 {isP&&<button type="button" onClick={()=>setSh(s=>!s)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#555",cursor:"pointer",fontSize:13}}>{show?"":""}</button>}
 </div>
 {error&&<p style={{fontSize:11,color:"#fe2c55",marginTop:4}}> {error}</p>}
 </div>
 );
};

export default Field;
