import { useState, useEffect, useRef } from "react";

export const Stars=({rating})=>{
 return <span style={{color:"#333",fontSize:11,fontWeight:600}}>{rating?.toFixed(1)}</span>;
};

export default Stars;
