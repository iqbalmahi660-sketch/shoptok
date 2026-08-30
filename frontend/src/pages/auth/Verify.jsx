import { useState, useEffect, useRef } from "react";
import { S } from "../../data/catalogue.js";
import Btn from "../../components/common/Btn.jsx";

export const Verify=({go})=>{
 const [code,sc]=useState(["","","","","",""]);
 const [loading,sl]=useState(false);
 const inp=(i,v)=>{if(!/^\d*$/.test(v))return;const n=[...code];n[i]=v.slice(-1);sc(n);if(v&&i<5)document.getElementById(`otp${i+1}`)?.focus();};
 return(
 <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24,background:"#f7f7f8"}}><div style={{width:"100%",maxWidth:420,textAlign:"center",padding:"0 8px"}}><div style={{width:68,height:68,background:"#fe2c5515",border:"1px solid #fe2c5530",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,margin:"0 auto 22px"}}></div><h2 style={{fontFamily:"'TikTok Sans',sans-serif",fontSize:24,fontWeight:800,color:"#111",marginBottom:8}}>Verify your email</h2><p style={{color:"#555",fontSize:13,marginBottom:28}}>Enter the 6-digit code sent to your email</p><div style={{display:"flex",gap:7,justifyContent:"center",marginBottom:24}}>
 {code.map((c,i)=>(
 <input key={i} id={`otp${i}`} value={c} onChange={e=>inp(i,e.target.value)}
 onKeyDown={e=>{if(e.key==="Backspace"&&!c&&i>0)document.getElementById(`otp${i-1}`)?.focus();}}
 style={{width:42,height:52,textAlign:"center",fontSize:20,fontWeight:700,background:"#ffffff",border:`2px solid ${c?"#fe2c55":"#e5e5e5"}`,borderRadius:10,color:"#111",outline:"none",fontFamily:"inherit"}}/>
 ))}
 </div><Btn full loading={loading} disabled={code.join("").length<6} onClick={()=>{sl(true);setTimeout(()=>{sl(false);go(S.APP);},1200);}}>Verify & Continue</Btn></div></div>
 );
};

export default Verify;
