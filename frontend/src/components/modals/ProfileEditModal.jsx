import { useState, useEffect, useRef } from "react";
import { CITIES } from "../../data/catalogue.js";
import Btn from "../common/Btn.jsx";
import Field from "../common/Field.jsx";

export const ProfileEditModal=({onClose,onSave,user,profileImg,setProfileImg})=>{
 const [f,sf]=useState({name:user?.name||"",email:user?.email||"",phone:user?.phone||"",city:user?.city||"",shopName:user?.seller?.shop_name||"",bio:"",password:""});
 const [imgFile,setImgFile]=useState(null);
 const [preview,setPreview]=useState(profileImg||null);
 const [saving,setSaving]=useState(false);
 const handleImg=e=>{
 const fi=e.target.files[0];if(!fi)return;
 setImgFile(fi);
 const r=new FileReader();r.onload=ev=>{setPreview(ev.target.result);setProfileImg(ev.target.result);};r.readAsDataURL(fi);
 };
 const handleSave=async()=>{setSaving(true);await onSave(f,imgFile);setSaving(false);};
 return(
 <><div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",backdropFilter:"blur(8px)",zIndex:500}}/><div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:520,maxWidth:"95vw",maxHeight:"92vh",overflowY:"auto",background:"#ffffff",border:"1px solid #e5e5e5",borderRadius:20,zIndex:501}}><div style={{height:90,background:"linear-gradient(135deg,#fe2c55,#ff6b35,#a78bfa)",borderRadius:"20px 20px 0 0",position:"relative"}}><button onClick={onClose} style={{position:"absolute",top:14,right:14,background:"rgba(0,0,0,0.4)",border:"none",color:"#111",width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button></div><div style={{padding:"0 26px 26px"}}><div style={{display:"flex",alignItems:"flex-end",gap:16,marginTop:-38,marginBottom:22}}><div style={{position:"relative",flexShrink:0}}>
 {preview?<img src={preview} alt="" style={{width:76,height:76,borderRadius:"50%",objectFit:"cover",border:"4px solid #0d0d0d",display:"block"}}/>
 :<div style={{width:76,height:76,borderRadius:"50%",background:"linear-gradient(135deg,#fe2c55,#ff6b35)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,border:"4px solid #0d0d0d"}}>{user?.avatar||""}</div>}
 <label style={{position:"absolute",bottom:2,right:2,width:26,height:26,borderRadius:"50%",background:"#fe2c55",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:13,border:"2px solid #0d0d0d"}}><input type="file" accept="image/*" style={{display:"none"}} onChange={handleImg}/></label></div><div style={{paddingBottom:4}}><p style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:800,fontSize:17,marginBottom:2}}>{f.name||user?.name}</p><p style={{fontSize:12,color:"rgba(0,0,0,0.4)"}}>{f.email||user?.email}</p>
 {imgFile&&<p style={{fontSize:11,color:"#34d399",marginTop:4}}>New photo ready</p>}
 </div></div><p style={{fontSize:11,color:"#fe2c55",fontWeight:700,marginBottom:12,textTransform:"uppercase",letterSpacing:"0.06em"}}>Personal Info</p><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><Field label="Full Name" value={f.name} onChange={v=>sf({...f,name:v})} placeholder="Muhammad Ali"/><Field label="Email" value={f.email} onChange={v=>sf({...f,email:v})} placeholder="you@example.com"/><Field label="Phone" value={f.phone} onChange={v=>sf({...f,phone:v})} placeholder="03001234567"/><div><label style={{fontSize:10,color:"#666",display:"block",marginBottom:5,textTransform:"uppercase"}}>City</label><select value={f.city} onChange={e=>sf({...f,city:e.target.value})} style={{width:"100%",padding:"11px 12px",background:"#ffffff",border:"1px solid #e5e5e5",borderRadius:8,color:f.city?"#111":"#888",fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}><option value="">Select city</option>{CITIES.map(c=><option key={c}>{c}</option>)}
 </select></div></div>
 {user?.role==="seller"&&<div style={{marginTop:8}}><p style={{fontSize:11,color:"#25f4ee",fontWeight:700,marginBottom:12,textTransform:"uppercase",letterSpacing:"0.06em"}}>Shop Info</p><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><Field label="Shop Name" value={f.shopName} onChange={v=>sf({...f,shopName:v})} placeholder="Ali's Store"/><Field label="Bio" value={f.bio} onChange={v=>sf({...f,bio:v})} placeholder="About your shop"/></div></div>}
 <p style={{fontSize:11,color:"#a78bfa",fontWeight:700,margin:"14px 0 10px",textTransform:"uppercase",letterSpacing:"0.06em"}}>Security</p><Field label="New Password (blank = no change)" type="password" value={f.password} onChange={v=>sf({...f,password:v})} placeholder="Min 6 characters"/><div style={{display:"flex",gap:10,marginTop:16}}><Btn full loading={saving} onClick={handleSave}>Save Changes</Btn><Btn variant="ghost" onClick={onClose}>Cancel</Btn></div></div></div></>
 );
};

// ─── CHECKOUT FLOW ────────────────────────────────────────────────────────────

export default ProfileEditModal;
