// Shared application data and constants extracted from the original App.jsx.

export const API = "http://localhost:5000/api";

export const CATALOGUE = [
 { id:'p01-aesthetic-hoodie', title:'Aesthetic Oversized Hoodie', price:2499, orig:3500, disc:29, cat:'fashion', rating:4.8, sold:1243, emoji:'', img:'https://picsum.photos/id/1011/400/400', color:'#ff6b9d' },
 { id:'p02-wireless-earbuds', title:'Wireless Earbuds Pro Max', price:4999, orig:7000, disc:29, cat:'electronics', rating:4.9, sold:3421, emoji:'', img:'https://picsum.photos/id/1025/400/400', color:'#4facfe' },
 { id:'p03-glass-skin-serum', title:'Glass Skin Serum Kit', price:1899, orig:2500, disc:24, cat:'beauty', rating:4.7, sold:892, emoji:'', img:'https://picsum.photos/id/1035/400/400', color:'#fa709a' },
 { id:'p04-desk-lamp', title:'Aesthetic Desk Lamp LED', price:3299, orig:4500, disc:27, cat:'home', rating:4.6, sold:567, emoji:'', img:'https://picsum.photos/id/1040/400/400', color:'#43e97b' },
 { id:'p05-running-shoes', title:'Running Shoes Boost Pro', price:5999, orig:8500, disc:29, cat:'sports', rating:4.9, sold:2341, emoji:'', img:'https://picsum.photos/id/1049/400/400', color:'#f6d365' },
 { id:'p06-crossbody-bag', title:'Mini Crossbody Bag Y2K', price:1599, orig:2200, disc:27, cat:'fashion', rating:4.5, sold:1089, emoji:'', img:'https://picsum.photos/id/1059/400/400', color:'#ff9a9e' },
 { id:'p07-smart-watch', title:'Smart Watch Series X', price:8999, orig:12000, disc:25, cat:'electronics', rating:4.8, sold:4521, emoji:'⌚', img:'https://picsum.photos/id/1060/400/400', color:'#a18cd1' },
 { id:'p08-matcha-kit', title:'Matcha Latte Kit Premium', price:2199, orig:3000, disc:27, cat:'food', rating:4.7, sold:765, emoji:'', img:'https://picsum.photos/id/1074/400/400', color:'#84fab0' },
 { id:'p09-power-bank', title:'Portable Power Bank 20000mAh', price:2699, orig:5500, disc:51, cat:'electronics', rating:4.9, sold:2210, emoji:'', img:'https://picsum.photos/id/1080/400/400', color:'#4facfe' },
 { id:'p10-cookware-set', title:'Ceramic Non-Stick Cookware Set', price:4499, orig:9000, disc:50, cat:'home', rating:4.8, sold:891, emoji:'', img:'https://picsum.photos/id/1084/400/400', color:'#43e97b' },
 { id:'p11-denim-jacket', title:'Cropped Denim Jacket Y2K', price:2999, orig:4200, disc:29, cat:'fashion', rating:4.6, sold:1567, emoji:'', img:'https://picsum.photos/id/1027/400/400', color:'#ff9a9e' },
 { id:'p12-face-mask', title:'Hydrating Face Mask 10-Pack', price:999, orig:1800, disc:44, cat:'beauty', rating:4.7, sold:3120, emoji:'', img:'https://picsum.photos/id/1062/400/400', color:'#fa709a' },
 { id:'p13-yoga-mat', title:'Yoga Mat Premium Anti-Slip', price:1799, orig:3200, disc:44, cat:'sports', rating:4.8, sold:1420, emoji:'', img:'https://picsum.photos/id/1084/400/400', color:'#f6d365' },
 { id:'p14-party-speaker', title:'Bluetooth Party Speaker XL', price:6499, orig:11000, disc:41, cat:'electronics', rating:4.7, sold:642, emoji:'', img:'https://picsum.photos/id/1071/400/400', color:'#a18cd1' },
 { id:'p15-fairy-lights', title:'Aesthetic Fairy Lights 10m', price:799, orig:1500, disc:47, cat:'home', rating:4.5, sold:2890, emoji:'', img:'https://picsum.photos/id/1053/400/400', color:'#43e97b' },
 { id:'p16-snack-box', title:'Korean Snack Box Deluxe', price:1499, orig:2200, disc:32, cat:'food', rating:4.9, sold:1980, emoji:'', img:'https://picsum.photos/id/292/400/400', color:'#84fab0' },
 { id:'p17-gold-necklace', title:'Minimalist Gold Necklace Set', price:1299, orig:2500, disc:48, cat:'fashion', rating:4.6, sold:934, emoji:'', img:'https://picsum.photos/id/103/400/400', color:'#ff6b9d' },
 { id:'p18-water-bottle', title:'Insulated Water Bottle 1L', price:899, orig:1600, disc:44, cat:'sports', rating:4.8, sold:2650, emoji:'', img:'https://picsum.photos/id/64/400/400', color:'#f6d365' },
 { id:'p19-headphones', title:'Wireless Bluetooth Headphones', price:3499, orig:6999, disc:50, cat:'electronics', rating:4.8, sold:2891, emoji:'', img:'https://picsum.photos/id/119/400/400', color:'#4facfe' },
 { id:'p20-face-serum', title:'Natural Face Serum Vitamin C', price:1599, orig:2800, disc:43, cat:'beauty', rating:4.6, sold:987, emoji:'', img:'https://picsum.photos/id/106/400/400', color:'#fa709a' },
];

export const VIDS=[
 {id:1,creator:'fashionista_pk',av:'',img:'https://picsum.photos/id/237/400/560',title:'POV: Styling this hoodie 5 ways #ootd',likes:45200,comments:892,views:'234K',prods:[1,6],tags:['ootd','fashion'],bg:'linear-gradient(135deg,#1a0a1e,#2d1b33)'},
 {id:2,creator:'techreviews_pk',av:'',img:'https://picsum.photos/id/238/400/560',title:'Testing earbuds for 30 days — HONEST review ',likes:128000,comments:3421,views:'1.2M',prods:[2,7],tags:['tech','review'],bg:'linear-gradient(135deg,#0a1628,#0d2137)'},
 {id:3,creator:'glowskin_pk',av:'',img:'https://picsum.photos/id/239/400/560',title:'My 5-step glass skin routine ',likes:89000,comments:2100,views:'567K',prods:[3],tags:['skincare'],bg:'linear-gradient(135deg,#1a0818,#2a1025)'},
 {id:4,creator:'homecafe_vibes',av:'',img:'https://picsum.photos/id/240/400/560',title:'Making aesthetic matcha at home #homecafe',likes:234000,comments:5678,views:'2.1M',prods:[8],tags:['matcha','cafe'],bg:'linear-gradient(135deg,#0a1a0d,#122a14)'},
 {id:5,creator:'gadgetguy_pk',av:'',img:'https://picsum.photos/id/241/400/560',title:'This power bank saved my trip #musthave',likes:56200,comments:1204,views:'389K',prods:['9a1c2d3e-4f5a-6b7c-8d9e-0f1a2b3c4d5e'],tags:['tech','travel'],bg:'linear-gradient(135deg,#0a1628,#0d2137)'},
 {id:6,creator:'homedecor_by_ayesha',av:'',img:'https://picsum.photos/id/242/400/560',title:'Cozy room glow up in 60 sec #roomdecor',likes:178000,comments:4210,views:'980K',prods:['3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d'],tags:['decor','aesthetic'],bg:'linear-gradient(135deg,#1a0a1e,#2d1b33)'},
 {id:7,creator:'fitwithzara',av:'',img:'https://picsum.photos/id/243/400/560',title:'10 min morning stretch routine #fitness',likes:92300,comments:1890,views:'612K',prods:['5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b'],tags:['fitness','yoga'],bg:'linear-gradient(135deg,#0a1a0d,#122a14)'},
];

export const CATS=[
 {s:'all',l:'All',e:''},
 {s:'fashion',l:'Womenswear & Underwear',e:''},
 {s:'electronics',l:'Phones & Electronics',e:''},
 {s:'accessories',l:'Fashion Accessories',e:''},
 {s:'menswear',l:'Menswear & Underwear',e:''},
 {s:'home',l:'Home Supplies',e:''},
 {s:'beauty',l:'Beauty & Personal Care',e:''},
 {s:'shoes',l:'Shoes',e:''},
 {s:'sports',l:'Sports & Outdoor',e:''},
 {s:'bags',l:'Luggage & Bags',e:''},
];

// Shared category icon + short-label maps used by the shop sidebar nav and the
// homepage category strip, so both stay in sync.
export const CATEGORY_ICONS={
 fashion:'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f457.png',
 electronics:'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f4f1.png',
 accessories:'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f45c.png',
 menswear:'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f9e5.png',
 home:'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f9f4.png',
 beauty:'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f484.png',
 shoes:'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f45f.png',
 sports:'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f3c0.png',
 bags:'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f9f3.png',
};

export const CATEGORY_SHORT_LABELS={
 fashion:'Womenswear\n& Underwear',
 electronics:'Phones &\nElectronics',
 accessories:'Fashion\nAccessories',
 menswear:'Menswear &\nUnderwear',
 home:'Home\nSupplies',
 beauty:'Beauty &\nPersonal Care',
 shoes:'Shoes',
 sports:'Sports &\nOutdoor',
 bags:'Luggage &\nBags',
};

export const SHOP_CATS=["Fashion & Clothing","Beauty & Skincare","Electronics","Home & Living","Food & Beverages","Sports & Outdoors","Books & Stationery","Toys & Kids"];

export const BANKS=["HBL","UBL","MCB","Allied Bank","Meezan Bank","Bank Alfalah","Standard Chartered","Faysal Bank","Askari Bank","Silk Bank"];

export const CITIES=["Karachi","Lahore","Islamabad","Rawalpindi","Faisalabad","Multan","Peshawar","Quetta","Sialkot","Gujranwala"];

export const S={LAND:"land",LOGIN:"login",REG:"reg",VERIFY:"verify",ONBOARD:"onboard",APP:"app",AGREEMENT:"agreement"};

// ─── ATOMS ────────────────────────────────────────────────────────────────────

export const SIZES_CLOTHING=["XS","S","M","L","XL","XXL","XXXL"];

export const COLORS_LIST=["#000000","#ffffff","#fe2c55","#3b82f6","#10b981","#f59e0b","#8b5cf6","#ec4899","#f97316","#6b7280"];

// ─── EDIT PRODUCT MODAL ───────────────────────────────────────────────────────

export const PROD_MGMT_KEYS=["products","refunds","reviews","warehouse"];

export const PRODUCT_REVIEWS = {
 1:[
 {n:"Ayesha K.",loc:"Lahore",ago:"2 days ago",stars:5,txt:"Oversized fit is absolutely perfect! Fabric quality is great and color matched the photo exactly. Delivery arrived in 2 days. Will reorder! ",hasPhoto:true},
 {n:"Fatima Ch.",loc:"Karachi",ago:"1 week ago",stars:5,txt:"The hoodie quality exceeded expectations. Very soft fabric, oversized fit is exactly as shown in the video. Neat packaging too."},
 {n:"Hassan R.",loc:"Islamabad",ago:"2 weeks ago",stars:4,txt:"Hoodie is great, size came out a bit large for me but overall satisfied. The COD option made it very easy to order."},
 ],
 2:[
 {n:"Ali Ahmed",loc:"Karachi",ago:"3 days ago",stars:5,txt:"Sound quality is amazing! 30-hour battery backup actually delivers. Best buy in this price range. Noise cancellation is outstanding too. ",hasPhoto:false},
 {n:"Sara M.",loc:"Lahore",ago:"1 week ago",stars:5,txt:"Earbuds are very comfortable, noise cancellation works perfectly. Delivery arrived in 2 days! Highly recommended for music lovers."},
 {n:"Zaid K.",loc:"Faisalabad",ago:"3 weeks ago",stars:4,txt:"Good product overall. Minor bass issue at very high volumes but for everyday use it's excellent value for money."},
 ],
 3:[
 {n:"Sana Malik",loc:"Lahore",ago:"2 days ago",stars:5,txt:"Amazing quality! The fabric is super soft and the embroidery looks exactly like the photos. Fast delivery too. Will definitely order again from ShopTok! ",hasPhoto:true},
 {n:"Fatima Ch.",loc:"Karachi",ago:"1 week ago",stars:5,txt:"The suit is beautiful — colors are exactly as shown on the website. Packaging was neat too. Highly recommended!"},
 {n:"Ahmed Raza",loc:"Islamabad",ago:"2 weeks ago",stars:4,txt:"Ordered as a gift for my wife. She loved it! Quality is solid, delivery was slightly delayed but overall very satisfied."},
 ],
 4:[
 {n:"Bilal T.",loc:"Rawalpindi",ago:"1 day ago",stars:5,txt:"Lamp quality is outstanding! LED is bright and the USB charging feature is super useful. Makes studying at the desk much more enjoyable! 5/5"},
 {n:"Amna S.",loc:"Multan",ago:"5 days ago",stars:4,txt:"Desk lamp is really good, delivery was fast. Great value for the price. The brightness levels are very useful."},
 {n:"Usman A.",loc:"Lahore",ago:"2 weeks ago",stars:5,txt:"Great purchase! Build quality is solid and the light modes are very useful for studying. Definitely recommend."},
 ],
 5:[
 {n:"Kamran H.",loc:"Karachi",ago:"4 days ago",stars:5,txt:"Running shoes are absolutely amazing! Cushioning is perfect and grip is excellent. Ran 10km on the first day — zero discomfort. Definitely recommend! ",hasPhoto:true},
 {n:"Nadia F.",loc:"Lahore",ago:"1 week ago",stars:5,txt:"The shoe quality is impressive. Very comfortable and size is accurate. Will buy again for gifting!"},
 {n:"Tariq M.",loc:"Islamabad",ago:"3 weeks ago",stars:4,txt:"Good shoes, delivery was on time. The sole feels slightly thin but overall a nice product at this price point."},
 ],
 6:[
 {n:"Hira B.",loc:"Lahore",ago:"2 days ago",stars:5,txt:"The bag is exactly as shown in the photos! Beautiful color, solid stitching, smooth zipper. Love it! "},
 {n:"Maryam K.",loc:"Karachi",ago:"1 week ago",stars:5,txt:"The crossbody bag quality is surprisingly good at this price. Fits phone, wallet, and keys easily. Highly recommended!"},
 {n:"Zara A.",loc:"Faisalabad",ago:"2 weeks ago",stars:4,txt:"Nice bag, feels slightly small for me but great quality overall. The COD option was very convenient. Will order again."},
 ],
 7:[
 {n:"Rehan S.",loc:"Karachi",ago:"1 day ago",stars:5,txt:"The smartwatch features are mind-blowing at this price! Health tracking is accurate, battery lasts a full week! ⌚ Best purchase this year!",hasPhoto:false},
 {n:"Imran K.",loc:"Lahore",ago:"3 days ago",stars:5,txt:"Watch design looks premium. Battery life is 7 days! App connectivity is smooth. Delivery was fast too. 5/5 recommend!"},
 {n:"Asad M.",loc:"Islamabad",ago:"1 week ago",stars:4,txt:"Good smartwatch, app connectivity is smooth. Minor GPS lag but overall great value for money at this price."},
 ],
 8:[
 {n:"Noor F.",loc:"Lahore",ago:"3 days ago",stars:5,txt:"The matcha kit quality is excellent! Taste is authentic Japanese style. Packaging is really cute too — makes a perfect gift! "},
 {n:"Saba K.",loc:"Karachi",ago:"1 week ago",stars:5,txt:"Matcha quality is premium, whisking is smooth. Taste and aroma are like real Japanese matcha. Highly recommend!"},
 {n:"Amir H.",loc:"Islamabad",ago:"2 weeks ago",stars:4,txt:"Good matcha kit, instructions were clear. Feels slightly pricey but the quality completely justifies it."},
 ],
};

export const SIZES=["XS","S","M","L","XL","XXL"];

export const SWATCH_COLORS=["#ff6b9d","#4facfe","#43e97b","#f6d365","#a18cd1","#ff9a9e"];

export const RATING_DIST={5:78,4:14,3:5,2:2,1:1};

// ─── PRODUCT DETAIL PANEL ─────────────────────────────────────────────────────
// ─── FULL PRODUCT PAGE ────────────────────────────────────────────────────────

