import { useState, useEffect, useRef } from "react";
import { S } from "../../data/catalogue.js";
import Btn from "../../components/common/Btn.jsx";

export const Landing=({go})=>(
 <div style={{minHeight:"100vh",width:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 16px",background:"#f7f7f8",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 80% 50% at 50% 0%,#fe2c5518,transparent 60%)"}}/><div style={{position:"relative",textAlign:"center",width:"100%",maxWidth:480,padding:"0 16px"}}><div style={{width:64,height:64,background:"linear-gradient(135deg,#fe2c55,#ff6b35)",borderRadius:18,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 22px",boxShadow:"0 16px 48px #fe2c5540"}}>▶</div><h1 style={{fontFamily:"'TikTok Sans',sans-serif",fontSize:46,fontWeight:800,color:"#111",lineHeight:1.05,marginBottom:10,letterSpacing:"-2px"}}>ShopTok<span style={{color:"#fe2c55"}}>.</span></h1><p style={{color:"#555",fontSize:14,lineHeight:1.7,marginBottom:32}}>Pakistan's first short-video commerce platform.</p><div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:28}}><Btn full onClick={()=>go(S.REG)}>Create Account — Free</Btn><Btn full variant="outline" onClick={()=>go(S.ONBOARD)}>Start Selling</Btn><Btn full variant="ghost" onClick={()=>go(S.LOGIN)}>Already have an account?</Btn></div><div style={{display:"flex",justifyContent:"center",gap:36}}>
 {[["50K+","Sellers"],["2M+","Products"],["500K+","Buyers"]].map(([n,l])=>(
 <div key={l}><div style={{fontFamily:"'TikTok Sans',sans-serif",fontSize:20,fontWeight:800,color:"#fe2c55"}}>{n}</div><div style={{fontSize:11,color:"#444"}}>{l}</div></div>
 ))}
 </div></div></div>
);

export default Landing;
