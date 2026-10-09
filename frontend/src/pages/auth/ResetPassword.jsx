import { useState } from "react";
import { API } from "../../data/catalogue.js";

export default function ResetPassword({ uid, token }) {
  const [password,setPassword]=useState("");
  const [confirm,setConfirm]=useState("");
  const [loading,setLoading]=useState(false);
  const [done,setDone]=useState(false);
  const [error,setError]=useState("");

  const submit=async(e)=>{
    e.preventDefault(); setError("");
    if(password.length<6){setError("Password must be at least 6 characters");return;}
    if(password!==confirm){setError("Passwords do not match");return;}
    setLoading(true);
    try{
      const res=await fetch(`${API}/auth/reset-password`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({uid,token,password})});
      const data=await res.json();
      if(!res.ok) throw new Error(data?.message||"Password reset failed");
      setDone(true);
    }catch(err){setError(err?.message||"Password reset failed");}
    finally{setLoading(false);}
  };

  const page={minHeight:"100vh",background:"#f7f7f8",display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"Poppins,sans-serif"};
  const card={width:420,maxWidth:"100%",background:"#fff",border:"1px solid #e8e8e8",borderRadius:18,padding:28,boxShadow:"0 16px 50px rgba(0,0,0,.08)"};
  const input={width:"100%",padding:"12px 14px",border:"1px solid #ddd",borderRadius:10,fontSize:14,boxSizing:"border-box",outline:"none"};
  const btn={width:"100%",marginTop:18,padding:"12px 16px",border:"none",borderRadius:999,background:"#fe2c55",color:"#fff",fontWeight:800,cursor:"pointer"};

  if(done)return <div style={page}><div style={card}><img src="/logo.png" alt="TokZoo" style={{height:62,maxWidth:170,objectFit:"contain",display:"block",margin:"0 auto 14px"}}/><h2 style={{textAlign:"center"}}>Password changed</h2><p style={{textAlign:"center",color:"#666",fontSize:13}}>Your password has been updated successfully.</p><button style={btn} onClick={()=>{window.history.replaceState({},"","/");window.location.href="/";}}>Continue to TokZoo</button></div></div>;

  return <div style={page}><form style={card} onSubmit={submit}><img src="/logo.png" alt="TokZoo" style={{height:62,maxWidth:170,objectFit:"contain",display:"block",margin:"0 auto 14px"}}/><h2 style={{textAlign:"center",marginBottom:8}}>Reset password</h2><p style={{textAlign:"center",color:"#666",fontSize:13,marginBottom:20}}>Enter your new TokZoo password.</p>{error&&<div style={{background:"rgba(254,44,85,.07)",border:"1px solid rgba(254,44,85,.2)",color:"#fe2c55",padding:"10px 12px",borderRadius:8,fontSize:12,marginBottom:12}}>{error}</div>}<label style={{display:"block",fontSize:11,fontWeight:700,color:"#555",margin:"12px 0 6px",textTransform:"uppercase"}}>New password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} style={input} autoComplete="new-password"/><label style={{display:"block",fontSize:11,fontWeight:700,color:"#555",margin:"12px 0 6px",textTransform:"uppercase"}}>Confirm password</label><input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} style={input} autoComplete="new-password"/><button disabled={loading} style={btn}>{loading?"Changing...":"Change Password"}</button></form></div>;
}
