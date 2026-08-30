import { useState, useEffect, useRef } from "react";
import { API, S } from "../../data/catalogue.js";
import Btn from "../../components/common/Btn.jsx";
import Field from "../../components/common/Field.jsx";
import { MerchantAgreement } from "./MerchantAgreement.jsx";

export const Register=({go,setUser})=>{
 const [f,sf]=useState({name:"",email:"",password:"",role:"buyer",agree:false});
 const [err,se]=useState({});
 const [loading,sl]=useState(false);
 const [showAgreement,setSA]=useState(false);
 const submit=async()=>{
 const e={};
 if(!f.name.trim())e.name="Required";
 if(!f.email.includes("@"))e.email="Invalid";
 if(f.password.length<6)e.password="Min 6 chars";
 if(!f.agree)e.agree="Required";
 if(Object.keys(e).length)return se(e);
 sl(true);
 try {
 const res = await fetch(`${API}/auth/register`, {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:f.name,email:f.email,password:f.password,role:f.role})});
 const data = await res.json();
 if(!res.ok) throw new Error(data.message||"Registration failed");
 localStorage.setItem("shopToken", data.token);
 setUser({name:data.user.name,email:data.user.email,phone:"",city:"",role:data.user.role,avatar:data.user.role==="seller"?"":"",profileImg:null});
 localStorage.setItem("shopUser", JSON.stringify({name:data.user.name,email:data.user.email,phone:"",city:"",role:data.user.role,profileImg:null}));
 go(f.role==="seller"?S.ONBOARD:S.VERIFY);
 } catch(err) { se({email:err.message}); }
 sl(false);
 };
 if(showAgreement) return <MerchantAgreement go={go} onAgree={()=>{sf(p=>({...p,agree:true}));setSA(false);}}/>;
 return(
 <div style={{minHeight:"100vh",width:"100%",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px 16px",background:"#f7f7f8"}}><div style={{width:"100%",maxWidth:480}}><button onClick={()=>go(S.APP)} style={{background:"none",border:"none",color:"#555",cursor:"pointer",fontSize:13,marginBottom:24}}>&#8592; Back</button><h2 style={{fontFamily:"'TikTok Sans',sans-serif",fontSize:26,fontWeight:800,color:"#111",marginBottom:20}}>Create Account</h2><div style={{display:"flex",background:"#ffffff",border:"1px solid #1a1a1a",borderRadius:10,padding:4,marginBottom:18,gap:4}}>
 {["buyer","seller"].map(r=>(
 <button key={r} onClick={()=>sf({...f,role:r})} style={{flex:1,padding:"9px",background:f.role===r?"linear-gradient(135deg,#fe2c55,#ff6b35)":"transparent",border:"none",borderRadius:7,color:f.role===r?"#fff":"#333",fontSize:13,fontFamily:"inherit",cursor:"pointer",fontWeight:f.role===r?700:400}}>{r==="buyer"?"Buyer":"Seller"}</button>
 ))}
 </div><Field label="Full Name" value={f.name} onChange={v=>sf({...f,name:v})} placeholder="Muhammad Ali" error={err.name}/><Field label="Email" type="email" value={f.email} onChange={v=>sf({...f,email:v})} placeholder="you@example.com" error={err.email}/><Field label="Password" type="password" value={f.password} onChange={v=>sf({...f,password:v})} placeholder="Min 6 characters" error={err.password}/><div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:16}}><div onClick={()=>sf({...f,agree:!f.agree})} style={{width:17,height:17,borderRadius:4,border:"2px solid "+(f.agree?"#fe2c55":"#333"),background:f.agree?"#fe2c55":"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,marginTop:1}}>
 {f.agree&&<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
 </div><p style={{fontSize:12,color:"#555",lineHeight:1.6}}>I agree to <span style={{color:"#fe2c55",cursor:"pointer"}} onClick={()=>setSA(true)}>Terms and Merchant Agreement</span> and <span style={{color:"#fe2c55"}}>Privacy Policy</span>{err.agree&&(<span style={{color:"#fe2c55",display:"block"}}>Required</span>)}</p></div><Btn full loading={loading} onClick={submit}>{f.role==="seller"?"Continue":"Create Account"}</Btn><p style={{textAlign:"center",marginTop:16,fontSize:13,color:"#555"}}>Have account? <span style={{color:"#fe2c55",cursor:"pointer"}} onClick={()=>go(S.LOGIN)}>Log In</span></p></div></div>
 );
};

export default Register;
