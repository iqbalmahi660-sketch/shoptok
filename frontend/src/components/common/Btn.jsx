import { useState, useEffect, useRef } from "react";

export const Btn=({children,onClick,variant="primary",disabled,loading,full,small})=>{
 const V={
 primary:{background:"linear-gradient(135deg,#fe2c55,#ff6b35)",color:"#fff",border:"none"},
 outline:{background:"transparent",color:"#fe2c55",border:"1px solid #fe2c5560"},
 ghost:{background:"#ffffff",color:"#888",border:"1px solid #e5e5e5"},
 google:{background:"#fff",color:"#333",border:"1px solid #ddd"},
 danger:{background:"rgba(254,44,85,0.1)",color:"#fe2c55",border:"1px solid rgba(254,44,85,0.3)"},
 success:{background:"linear-gradient(135deg,#34d399,#059669)",color:"#fff",border:"none"},
 };
 return(
 <button type="button" onClick={onClick} disabled={disabled||loading}
 style={{...V[variant],width:full?"100%":"auto",padding:small?"7px 14px":"12px 22px",borderRadius:small?6:8,fontSize:small?11:13,fontFamily:"inherit",fontWeight:600,cursor:disabled||loading?"not-allowed":"pointer",opacity:disabled?0.5:1,display:"inline-flex",alignItems:"center",justifyContent:"center",gap:7,transition:"all 0.2s",boxSizing:"border-box"}}>
 {loading?<span style={{width:14,height:14,border:"2px solid rgba(0,0,0,0.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.7s linear infinite",display:"inline-block"}}/>:children}
 </button>
 );
};

// ─── AUTH SCREENS ─────────────────────────────────────────────────────────────

export default Btn;
