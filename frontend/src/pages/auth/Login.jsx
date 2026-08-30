import { useState, useEffect, useRef } from "react";
import { API, S } from "../../data/catalogue.js";
import Btn from "../../components/common/Btn.jsx";
import Field from "../../components/common/Field.jsx";
import GIcon from "../../components/common/GIcon.jsx";

export const Login=({go,setUser})=>{
 const [f,sf]=useState({email:"",password:""});
 const [err,se]=useState({});
 const [loading,sl]=useState(false);
 const submit=async()=>{
 const e={};
 if(!f.email.includes("@"))e.email="Valid email required";
 if(f.password.length<4)e.password="Too short";
 if(Object.keys(e).length)return se(e);
 sl(true);
 try {
 const res = await fetch(`${API}/auth/login`, {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:f.email,password:f.password})});
 const data = await res.json();
 if(!res.ok) throw new Error(data.message||"Login failed");
 localStorage.setItem("shopToken", data.token);
 setUser({name:data.user.name,email:data.user.email,phone:data.user.phone||"",city:data.user.city||"",role:data.user.role,avatar:data.user.role==="seller"?"":"",profileImg:data.user.profile_img||null,seller:data.user.seller||null});
 localStorage.setItem("shopUser", JSON.stringify({name:data.user.name,email:data.user.email,phone:data.user.phone||"",city:data.user.city||"",role:data.user.role,profileImg:data.user.profile_img||null}));
 go(S.APP);
 } catch(err) { se({email:err.message}); }
 sl(false);
 };
 return(
 <div style={{minHeight:"100vh",width:"100%",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px 16px",background:"#f7f7f8"}}><div style={{width:"100%",maxWidth:480}}><button onClick={()=>go(S.APP)} style={{background:"none",border:"none",color:"#555",cursor:"pointer",fontSize:13,marginBottom:28}}>← Back</button><h2 style={{fontFamily:"'TikTok Sans',sans-serif",fontSize:26,fontWeight:800,color:"#111",marginBottom:4}}>Welcome back </h2><p style={{color:"#555",fontSize:13,marginBottom:24}}>Sign in to your ShopTok account</p><Btn full variant="google"><GIcon/>Continue with Google</Btn><div style={{display:"flex",alignItems:"center",gap:10,margin:"16px 0"}}><div style={{flex:1,height:1,background:"#f2f2f2"}}/><span style={{color:"#333",fontSize:11}}>OR</span><div style={{flex:1,height:1,background:"#f2f2f2"}}/></div><Field label="Email" type="email" value={f.email} onChange={v=>sf({...f,email:v})} placeholder="you@example.com" error={err.email} autoComplete="off"/><Field label="Password" type="password" value={f.password} onChange={v=>sf({...f,password:v})} placeholder="••••••••" error={err.password} autoComplete="new-password"/><div style={{textAlign:"right",marginTop:-8,marginBottom:18}}><span style={{color:"#fe2c55",fontSize:12,cursor:"pointer"}}>Forgot password?</span></div><Btn full loading={loading} onClick={submit}>Log In</Btn><p style={{textAlign:"center",marginTop:18,fontSize:13,color:"#555"}}>No account? <span style={{color:"#fe2c55",cursor:"pointer"}} onClick={()=>go(S.REG)}>Sign Up</span></p></div></div>
 );
};

export default Login;
