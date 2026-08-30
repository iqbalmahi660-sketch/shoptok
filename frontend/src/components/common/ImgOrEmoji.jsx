import { useState, useEffect, useRef } from "react";

export const ImgOrEmoji=({src,emoji,color,alt,fontSize=48})=>{
 const fallback=`https://placehold.co/400x400/${(color||"#fe2c55").replace("#","")}/ffffff?text=`;
 return (
 <img src={src||fallback} alt={alt||""} loading="lazy" style={{width:"100%",height:"100%",objectFit:"cover",position:"absolute",inset:0,background:`${color||'#fe2c55'}12`}}
 onError={e=>{if(e.currentTarget.src!==fallback){e.currentTarget.src=fallback;}}}/>
 );
};

export default ImgOrEmoji;
