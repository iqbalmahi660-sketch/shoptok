import { useState, useEffect, useRef } from "react";
import { API, S } from "../../data/catalogue.js";
import Btn from "../../components/common/Btn.jsx";
import { Footer } from "../../components/layout/Footer.jsx";
import { Login } from "../auth/Login.jsx";
import { MerchantAgreement } from "../auth/MerchantAgreement.jsx";
import { Verify } from "../auth/Verify.jsx";

const COUNTRIES = [
 "Pakistan",
 "Afghanistan",
 "Albania",
 "Algeria",
 "American Samoa",
 "Andorra",
 "Angola",
 "Anguilla",
 "Antarctica",
 "Antigua and Barbuda",
 "Argentina",
 "Armenia",
 "Aruba",
 "Australia",
 "Austria",
 "Azerbaijan",
 "Bahamas",
 "Bahrain",
 "Bangladesh",
 "Barbados",
 "Belarus",
 "Belgium",
 "Belize",
 "Benin",
 "Bermuda",
 "Bhutan",
 "Bolivia, Plurinational State of",
 "Bonaire, Sint Eustatius and Saba",
 "Bosnia and Herzegovina",
 "Botswana",
 "Bouvet Island",
 "Brazil",
 "British Indian Ocean Territory",
 "Brunei Darussalam",
 "Bulgaria",
 "Burkina Faso",
 "Burundi",
 "Cabo Verde",
 "Cambodia",
 "Cameroon",
 "Canada",
 "Cayman Islands",
 "Central African Republic",
 "Chad",
 "Chile",
 "China",
 "Christmas Island",
 "Cocos (Keeling) Islands",
 "Colombia",
 "Comoros",
 "Congo",
 "Congo, The Democratic Republic of the",
 "Cook Islands",
 "Costa Rica",
 "Croatia",
 "Cuba",
 "Curaçao",
 "Cyprus",
 "Czechia",
 "Côte d'Ivoire",
 "Denmark",
 "Djibouti",
 "Dominica",
 "Dominican Republic",
 "Ecuador",
 "Egypt",
 "El Salvador",
 "Equatorial Guinea",
 "Eritrea",
 "Estonia",
 "Eswatini",
 "Ethiopia",
 "Falkland Islands (Malvinas)",
 "Faroe Islands",
 "Fiji",
 "Finland",
 "France",
 "French Guiana",
 "French Polynesia",
 "French Southern Territories",
 "Gabon",
 "Gambia",
 "Georgia",
 "Germany",
 "Ghana",
 "Gibraltar",
 "Greece",
 "Greenland",
 "Grenada",
 "Guadeloupe",
 "Guam",
 "Guatemala",
 "Guernsey",
 "Guinea",
 "Guinea-Bissau",
 "Guyana",
 "Haiti",
 "Heard Island and McDonald Islands",
 "Holy See (Vatican City State)",
 "Honduras",
 "Hong Kong",
 "Hungary",
 "Iceland",
 "India",
 "Indonesia",
 "Iran, Islamic Republic of",
 "Iraq",
 "Ireland",
 "Isle of Man",
 "Israel",
 "Italy",
 "Jamaica",
 "Japan",
 "Jersey",
 "Jordan",
 "Kazakhstan",
 "Kenya",
 "Kiribati",
 "Korea, Democratic People's Republic of",
 "Korea, Republic of",
 "Kuwait",
 "Kyrgyzstan",
 "Lao People's Democratic Republic",
 "Latvia",
 "Lebanon",
 "Lesotho",
 "Liberia",
 "Libya",
 "Liechtenstein",
 "Lithuania",
 "Luxembourg",
 "Macao",
 "Madagascar",
 "Malawi",
 "Malaysia",
 "Maldives",
 "Mali",
 "Malta",
 "Marshall Islands",
 "Martinique",
 "Mauritania",
 "Mauritius",
 "Mayotte",
 "Mexico",
 "Micronesia, Federated States of",
 "Moldova, Republic of",
 "Monaco",
 "Mongolia",
 "Montenegro",
 "Montserrat",
 "Morocco",
 "Mozambique",
 "Myanmar",
 "Namibia",
 "Nauru",
 "Nepal",
 "Netherlands",
 "New Caledonia",
 "New Zealand",
 "Nicaragua",
 "Niger",
 "Nigeria",
 "Niue",
 "Norfolk Island",
 "North Macedonia",
 "Northern Mariana Islands",
 "Norway",
 "Oman",
 "Palau",
 "Palestine, State of",
 "Panama",
 "Papua New Guinea",
 "Paraguay",
 "Peru",
 "Philippines",
 "Pitcairn",
 "Poland",
 "Portugal",
 "Puerto Rico",
 "Qatar",
 "Romania",
 "Russian Federation",
 "Rwanda",
 "Réunion",
 "Saint Barthélemy",
 "Saint Helena, Ascension and Tristan da Cunha",
 "Saint Kitts and Nevis",
 "Saint Lucia",
 "Saint Martin (French part)",
 "Saint Pierre and Miquelon",
 "Saint Vincent and the Grenadines",
 "Samoa",
 "San Marino",
 "Sao Tome and Principe",
 "Saudi Arabia",
 "Senegal",
 "Serbia",
 "Seychelles",
 "Sierra Leone",
 "Singapore",
 "Sint Maarten (Dutch part)",
 "Slovakia",
 "Slovenia",
 "Solomon Islands",
 "Somalia",
 "South Africa",
 "South Georgia and the South Sandwich Islands",
 "South Sudan",
 "Spain",
 "Sri Lanka",
 "Sudan",
 "Suriname",
 "Svalbard and Jan Mayen",
 "Sweden",
 "Switzerland",
 "Syrian Arab Republic",
 "Taiwan, Province of China",
 "Tajikistan",
 "Tanzania, United Republic of",
 "Thailand",
 "Timor-Leste",
 "Togo",
 "Tokelau",
 "Tonga",
 "Trinidad and Tobago",
 "Tunisia",
 "Turkmenistan",
 "Turks and Caicos Islands",
 "Tuvalu",
 "Türkiye",
 "Uganda",
 "Ukraine",
 "United Arab Emirates",
 "United Kingdom",
 "United States",
 "United States Minor Outlying Islands",
 "Uruguay",
 "Uzbekistan",
 "Vanuatu",
 "Venezuela, Bolivarian Republic of",
 "Viet Nam",
 "Virgin Islands, British",
 "Virgin Islands, U.S.",
 "Wallis and Futuna",
 "Western Sahara",
 "Yemen",
 "Zambia",
 "Zimbabwe",
 "Åland Islands"
];

const SELLER_CATEGORIES = [
 "Fashion & Clothing",
 "Beauty & Skincare",
 "Phones & Electronics",
 "Home & Living",
 "Food & Beverages",
 "Sports & Outdoors",
 "Books & Stationery",
 "Toys & Kids",
 "Automotive",
 "Health & Personal Care",
 "Jewelry & Accessories",
 "Shoes & Footwear",
 "Bags & Luggage",
 "Other"
];


export const SellerOnboard=({go,setUser})=>{
 const [loading,sl]=useState(false);
 const [agree,setAgree]=useState(false);
 const [showAgreement,setSA]=useState(false);
 const [f,sf]=useState({
 shopLogo:null,shopLogoPreview:null,
 shopName:"",shopAddress:"",city:"",country:"Pakistan",
 idNumber:"",legalName:"",
 docFront:null,docBack:null,docSelfie:null,
 email:"",password:"",confirmPassword:"",
 inviteCode:"",
 bankName:"",accountTitle:"",accountNumber:"",
 phone:"",category:""
 });
 const up=(k,v)=>sf(p=>({...p,[k]:v}));

 const UploadBox=({id,file,label,icon,onChange})=>(
 <div style={{flex:1}}><div onClick={()=>document.getElementById(id).click()}
 style={{border:"2px dashed "+(file?"#fe2c55":"#d5d5d5"),borderRadius:10,padding:"18px 8px",textAlign:"center",cursor:"pointer",background:file?"rgba(254,44,85,0.06)":"#f7f7f8",transition:"all 0.2s",minHeight:90,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6}}>
 {file
 ? <><div style={{fontSize:22}}></div><p style={{color:"#fe2c55",fontSize:10,fontWeight:600,wordBreak:"break-all",padding:"0 4px"}}>{file.name.slice(0,16)}...</p></>
 : <><div style={{width:36,height:36,borderRadius:8,background:"#f2f2f2",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{icon}</div><p style={{color:"#555",fontSize:10,marginTop:2,lineHeight:1.4}}>{label}</p></>
 }
 </div><input id={id} type="file" accept="image/*" style={{display:"none"}} onChange={e=>onChange(e.target.files[0])}/></div>
 );

 const SField=({label,value,onChange,placeholder,type="text",req=true})=>(
 <div style={{marginBottom:16}}><label style={{display:"block",fontSize:13,color:"#888",marginBottom:7,fontWeight:500}}>
 {req&&(<span style={{color:"#fe2c55",marginRight:4}}>*</span>)}{label}
 </label><input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
 style={{width:"100%",padding:"12px 14px",background:"#ffffff",border:"1px solid #222",borderRadius:10,color:"#111",fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box",transition:"border-color 0.2s"}}
 onFocus={e=>e.target.style.borderColor="#fe2c55"}
 onBlur={e=>e.target.style.borderColor="#222"}/></div>
 );

 const uploadImage=async(file,token)=>{
 if(!file) return null;
 const fd=new FormData();
 fd.append("image",file);
 const res=await fetch(`${API}/upload/image`,{
 method:"POST",
 headers:{"Authorization":`Bearer ${token}`},
 body:fd
 });
 const data=await res.json();
 if(!res.ok||!data.url) throw new Error(data.message||"Image upload failed");
 return data.url;
 };

 const submit=async()=>{
 if(!agree){alert("Please agree to the Occupancy Agreement to continue.");return;}
 if(!f.shopName.trim()){alert("Shop name is required.");return;}
 if(!f.shopAddress.trim()){alert("Shop address is required.");return;}
 if(!f.city.trim()){alert("City is required.");return;}
 if(!f.country.trim()){alert("Country is required.");return;}
 if(!f.idNumber.trim()){alert("ID/CNIC number is required.");return;}
 if(!f.shopLogo){alert("Shop logo is required.");return;}
 if(!f.docFront||!f.docBack||!f.docSelfie){alert("Please upload ID front, back and selfie.");return;}
 if(!f.legalName.trim()){alert("Legal name is required.");return;}
 if(!f.phone.trim()){alert("Phone number is required.");return;}
 if(!f.category.trim()){alert("Store category is required.");return;}
 if(!f.bankName.trim()||!f.accountTitle.trim()||!f.accountNumber.trim()){
   alert("Complete bank details are required.");
   return;
 }
 sl(true);
 try{
 const token=localStorage.getItem("shopToken");
 if(!token) throw new Error("Please log in again.");

 const [shopLogoUrl,docFrontUrl,docBackUrl,docSelfieUrl]=await Promise.all([
   uploadImage(f.shopLogo,token),
   uploadImage(f.docFront,token),
   uploadImage(f.docBack,token),
   uploadImage(f.docSelfie,token),
 ]);

 const res=await fetch(`${API}/auth/seller-onboard`,{
 method:"POST",
 headers:{"Content-Type":"application/json","Authorization":`Bearer ${token}`},
 body:JSON.stringify({
 shopName:f.shopName,
 shopAddress:f.shopAddress,
 city:f.city,
 country:f.country,
 idNumber:f.idNumber,
 legalName:f.legalName,
 phone:f.phone,
 category:f.category,
 bankName:f.bankName,
 accountTitle:f.accountTitle,
 accountNumber:f.accountNumber,
 inviteCode:f.inviteCode,
 shopLogo:shopLogoUrl,
 cnicFront:docFrontUrl,
 cnicBack:docBackUrl,
 cnicSelfie:docSelfieUrl
 })
 });
 const data=await res.json();
 if(!res.ok)throw new Error(data.message||"Failed");
 setUser(p=>({...p,role:"seller",seller:data.seller||p?.seller}));
 go(S.APP);
 }catch(err){alert(err.message);}
 sl(false);
 };

 if(showAgreement) return <MerchantAgreement go={go} onAgree={()=>{setAgree(true);setSA(false);}}/>;

 return(
 <div style={{minHeight:"100vh",background:"#f7f7f8",overflowY:"auto"}}>
 {/* Sticky Header */}
 <div style={{background:"rgba(255,255,255,0.96)",backdropFilter:"blur(10px)",borderBottom:"1px solid #e5e5e5",position:"sticky",top:0,zIndex:100,padding:"12px 20px",display:"flex",alignItems:"center",gap:12}}><button onClick={()=>go(S.APP)} style={{background:"none",border:"none",color:"#555",cursor:"pointer",fontSize:13}}>&#8592; Back</button><div style={{display:"flex",alignItems:"center",gap:8,marginLeft:4}}><div style={{width:26,height:26,background:"linear-gradient(135deg,#fe2c55,#ff6b35)",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}></div><span style={{fontFamily:"'TikTok Sans',sans-serif",fontWeight:800,fontSize:15,color:"#111"}}>ShopTok<span style={{color:"#fe2c55"}}>.</span></span></div><span style={{marginLeft:"auto",fontSize:11,color:"#555"}}>Seller Registration</span></div><div style={{maxWidth:520,margin:"0 auto",padding:"28px 20px 60px"}}>
 {/* Title */}
 <div style={{marginBottom:28}}><h2 style={{fontFamily:"'TikTok Sans',sans-serif",fontSize:24,fontWeight:900,color:"#111",letterSpacing:"-0.5px",marginBottom:6}}>Business Information</h2><p style={{fontSize:13,color:"#555"}}>Already a seller? <span style={{color:"#fe2c55",cursor:"pointer"}} onClick={()=>go(S.LOGIN)}>Click to log in</span></p></div>

 {/* Shop Logo */}
 <div style={{marginBottom:22}}><label style={{display:"block",fontSize:13,color:"#888",marginBottom:10,fontWeight:500}}><span style={{color:"#fe2c55",marginRight:4}}>*</span>Shop logo</label><div onClick={()=>document.getElementById("shop-logo-inp").click()}
 style={{width:100,height:100,border:"2px dashed "+(f.shopLogoPreview?"#fe2c55":"#d5d5d5"),borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",background:f.shopLogoPreview?"transparent":"#f7f7f8",overflow:"hidden",transition:"all 0.2s",position:"relative"}}>
 {f.shopLogoPreview
 ? <img src={f.shopLogoPreview} style={{width:"100%",height:"100%",objectFit:"cover"}} alt="logo"/>
 : <div style={{textAlign:"center"}}><div style={{fontSize:28,color:"#333"}}></div><p style={{fontSize:10,color:"#444",marginTop:4}}>Upload</p></div>
 }
 </div><input id="shop-logo-inp" type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const file=e.target.files[0];if(file){up("shopLogo",file);up("shopLogoPreview",URL.createObjectURL(file));}}}/></div><div style={{background:"#ffffff",border:"1px solid #1a1a1a",borderRadius:14,padding:20,marginBottom:16}}><SField label="Shop name" value={f.shopName} onChange={v=>up("shopName",v)} placeholder="Please enter the store name"/><SField label="Shop Address" value={f.shopAddress} onChange={v=>up("shopAddress",v)} placeholder="Please enter the store address"/><SField label="City" value={f.city} onChange={v=>up("city",v)} placeholder="Please enter your city"/><div style={{marginBottom:16}}><label style={{display:"block",fontSize:13,color:"#888",marginBottom:7,fontWeight:500}}><span style={{color:"#fe2c55",marginRight:4}}>*</span>Country</label><select value={f.country} onChange={e=>up("country",e.target.value)}
 style={{width:"100%",padding:"12px 14px",background:"#ffffff",border:"1px solid #222",borderRadius:10,color:"#111",fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box",appearance:"none",backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='%23666'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E\")",backgroundRepeat:"no-repeat",backgroundPosition:"right 12px center"}}>
 {COUNTRIES.map(c=><option key={c} value={c}>{c}</option>)}
 </select></div><SField label="ID/passport number" value={f.idNumber} onChange={v=>up("idNumber",v)} placeholder="Please enter your ID or passport number"/><SField label="Legal name" value={f.legalName} onChange={v=>up("legalName",v)} placeholder="Please enter your real name"/>
 <SField label="Phone number" value={f.phone} onChange={v=>up("phone",v)} placeholder="Please enter your phone number"/>
 <div style={{marginBottom:16}}>
  <label style={{display:"block",fontSize:13,color:"#888",marginBottom:7,fontWeight:500}}><span style={{color:"#fe2c55",marginRight:4}}>*</span>Category</label>
  <select value={f.category} onChange={e=>up("category",e.target.value)}
   style={{width:"100%",padding:"12px 14px",background:"#ffffff",border:"1px solid #222",borderRadius:10,color:"#111",fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}>
   <option value="">Select store category</option>
   {SELLER_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
  </select>
 </div>
 </div>

 {/* ID Upload */}
 <div style={{background:"#ffffff",border:"1px solid #1a1a1a",borderRadius:14,padding:20,marginBottom:16}}><label style={{display:"block",fontSize:13,color:"#888",marginBottom:14,fontWeight:500}}><span style={{color:"#fe2c55",marginRight:4}}>*</span>ID/passport upload</label><div style={{display:"flex",gap:10,marginBottom:16}}><UploadBox id="doc-front" file={f.docFront} label="Front of the document" icon="" onChange={v=>up("docFront",v)}/><UploadBox id="doc-back" file={f.docBack} label="Reverse side of document" icon="" onChange={v=>up("docBack",v)}/><UploadBox id="doc-selfie" file={f.docSelfie} label="Hold up the document next to your face" icon="" onChange={v=>up("docSelfie",v)}/></div>
 {/* Image examples */}
 <div style={{marginTop:4}}><p style={{fontSize:12,color:"#555",marginBottom:10}}>Image example</p><div style={{display:"flex",gap:8}}>
 {[["#1a1812",""],["#121a18",""],["#1a1612",""]].map(([bg,icon],i)=>(
 <div key={i} style={{flex:1,height:60,background:bg,borderRadius:8,border:"1px solid #2a2a2a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{icon}</div>
 ))}
 </div></div></div>


 {/* Bank Details */}
 <div style={{background:"#ffffff",border:"1px solid #1a1a1a",borderRadius:14,padding:20,marginBottom:16}}>
  <p style={{fontSize:14,fontWeight:700,color:"#111",marginBottom:16}}>Bank & Payout Details</p>
  <SField label="Bank name / Bank details" value={f.bankName} onChange={v=>up("bankName",v)} placeholder="e.g. HBL, UBL, Meezan Bank"/>
  <SField label="Account title" value={f.accountTitle} onChange={v=>up("accountTitle",v)} placeholder="Name on bank account"/>
  <SField label="Account number" value={f.accountNumber} onChange={v=>up("accountNumber",v)} placeholder="Enter bank account number"/>
 </div>

 {/* Verification */}
 <div style={{background:"#ffffff",border:"1px solid #e5e5e5",borderRadius:14,padding:20,marginBottom:16}}><p style={{fontSize:13,color:"#888",marginBottom:14,fontWeight:500}}>Verify your Email or Mobile number</p><div style={{display:"flex",gap:8,marginBottom:18}}>
 {["E-mail","Mobile"].map((t,i)=>(
 <button key={t} style={{flex:1,padding:"10px",borderRadius:8,border:"none",background:i===0?"linear-gradient(135deg,#fe2c55,#ff6b35)":"#f2f2f2",color:i===0?"#fff":"#555",fontSize:13,fontFamily:"inherit",fontWeight:600,cursor:"pointer"}}>{t}</button>
 ))}
 </div><SField label="E-mail" value={f.email} onChange={v=>up("email",v)} placeholder="Please enter the correct email" req={false}/><SField label="Login password" value={f.password} onChange={v=>up("password",v)} placeholder="Please enter your password" type="password"/><SField label="Enter again to confirm the login password" value={f.confirmPassword} onChange={v=>up("confirmPassword",v)} placeholder="Please confirm to enter the login password" type="password"/><SField label="InviteCode" value={f.inviteCode} onChange={v=>up("inviteCode",v)} placeholder="Please enter the invitation code" req={false}/></div>

 {/* Agreement + Submit */}
 <div style={{background:"#ffffff",border:"1px solid #1a1a1a",borderRadius:14,padding:20,marginBottom:16}}><div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:20}}><div onClick={()=>setAgree(a=>!a)}
 style={{width:18,height:18,borderRadius:50,border:"2px solid "+(agree?"#fe2c55":"#333"),background:agree?"#fe2c55":"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,marginTop:1}}>
 {agree&&<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
 </div><p style={{fontSize:13,color:"#888",lineHeight:1.6}}>I have read and agree to the <span style={{color:"#fe2c55",cursor:"pointer",fontWeight:600}} onClick={()=>setSA(true)}>Occupancy Agreement</span></p></div><Btn full loading={loading} onClick={submit}>Submit application</Btn></div>

 {/* Footer */}
 <div style={{background:"#ffffff",border:"1px solid #1a1a1a",borderRadius:14,padding:20}}><p style={{fontSize:13,color:"#fe2c55",fontWeight:600,marginBottom:12}}>Get More Coupons</p><input placeholder="Your email" style={{width:"100%",padding:"11px 14px",background:"#ffffff",border:"1px solid #222",borderRadius:8,color:"#111",fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box",marginBottom:10}}/><button style={{border:"1px solid #fe2c55",background:"transparent",color:"#fe2c55",padding:"10px 24px",borderRadius:8,fontSize:13,fontFamily:"inherit",fontWeight:600,cursor:"pointer"}}>Subscription</button><div style={{marginTop:20,paddingTop:16,borderTop:"1px solid #1a1a1a"}}><p style={{fontSize:13,color:"#fe2c55",fontWeight:600,marginBottom:10}}>Customer Service</p>
 {["Online Service","Contact Us","App Download (Buyer)","App Download (Seller)"].map(l=>(
 <p key={l} style={{fontSize:13,color:"#555",marginBottom:7,cursor:"pointer"}}>{l}</p>
 ))}
 </div></div></div></div>
 );
};

// ─── ADD PRODUCT MODAL ────────────────────────────────────────────────────────

export default SellerOnboard;
