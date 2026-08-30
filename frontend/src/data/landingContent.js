// Placeholder content for the shop homepage.
// Swap these arrays for real API data later — the layout components
// (CategoryRow, ProductSection, ProductCard) don't know or care where
// the data comes from.

export const CATEGORIES = [
  { id: "womens", label: "Womenswear & Underwear", color: "#f4c9d8", emoji: "\u{1F457}" },
  { id: "phones", label: "Phones & Electronics", color: "#cfe0ee", emoji: "\u{1F4F1}" },
  { id: "fashion-acc", label: "Fashion Accessories", color: "#e9dcc7", emoji: "\u{1F452}" },
  { id: "mens", label: "Menswear & Underwear", color: "#d9d9de", emoji: "\u{1F455}" },
  { id: "home", label: "Home Supplies", color: "#cfe3e8", emoji: "\u{1F9F4}" },
  { id: "beauty", label: "Beauty & Personal Care", color: "#f6dede", emoji: "\u{1F484}" },
  { id: "shoes", label: "Shoes", color: "#e4e4e4", emoji: "\u{1F45F}" },
  { id: "sports", label: "Sports & Outdoor", color: "#d6e8d6", emoji: "\u26BD" },
  { id: "luggage", label: "Luggage & Bags", color: "#e6dcea", emoji: "\u{1F9F3}" },
];

// cardType: "video"  -> thumbnail has a play/time badge + seller row underneath
// cardType: "standard" -> plain image with a small green tag badge
export const SECTIONS = [
  {
    id: "savings-for-you",
    title: "Savings for you",
    cardType: "video",
    rows: 1,
    products: [
      { id: "s1-1", color: "#e7e2d8", emoji: "\u{1F45F}", duration: "00:50", seller: "StoreOne", title: "[LOCAL READY STOCK] Classic Everyday Sneakers", rating: 4.7, sold: "7.0K", discountPct: 83, price: 10.19, originalPrice: 59.99 },
      { id: "s1-2", color: "#ece3da", emoji: "\u{1F476}", duration: "00:41", seller: "DiaperCo", title: "3/4 Packs Deal Baby Diapers Disposable", rating: 4.9, sold: "210", discountPct: 5, price: 55.58, originalPrice: 58.50 },
      { id: "s1-3", color: "#dfe6ef", emoji: "\u{1F3A7}", duration: "00:27", seller: "AudioHub", title: "2026 Wireless Bluetooth Earbuds Original High Quality", rating: 4.6, sold: "569", discountPct: 91, price: 4.40, originalPrice: 49.00 },
      { id: "s1-4", color: "#f0d9d3", emoji: "\u{1F9C3}", duration: "00:05", seller: "FragranceHouse", title: "Restocked Liquid Fragrance Elixir 100ml", rating: 5.0, sold: "202", discountPct: 8, price: 49.90, originalPrice: 54.90 },
      { id: "s1-5", color: "#e6ddcf", emoji: "\u{1F35E}", duration: "00:24", seller: "HomeBakes", title: "Fresh Baked Bread Loaf - 900g", rating: 4.8, sold: "15.7K", discountPct: 0, price: 5.20, originalPrice: null },
    ],
  },
  {
    id: "top-deals-for-you",
    title: "Top deals for you",
    cardType: "standard",
    rows: 1,
    products: [
      { id: "s2-1", color: "#f6dbe6", emoji: "\u{1F484}", tag: "Free shipping", title: "Long-Wear Setting Spray 100ml - Matte Finish", rating: 4.9, sold: "1.1K", discountPct: 0, price: 4.90, originalPrice: null },
      { id: "s2-2", color: "#e5e5e5", emoji: "\u{1F45C}", tag: "Free shipping", title: "Stylish Crossbody Bag Large Capacity", rating: 4.8, sold: "472", discountPct: 0, price: 10.91, originalPrice: null },
      { id: "s2-3", color: "#e2dcee", emoji: "\u{1FAA5}", tag: "Free shipping", title: "Whitening Strips Purple Tooth Whitening", rating: 4.3, sold: "11.4K", discountPct: 58, price: 9.27, originalPrice: 22.00 },
      { id: "s2-4", color: "#dcebdd", emoji: "\u{1F9FA}", tag: "Free shipping", title: "3-Bottles Laundry Stain Remover Formula", rating: 4.7, sold: "452", discountPct: 5, price: 9.02, originalPrice: 9.50 },
      { id: "s2-5", color: "#f1e6c9", emoji: "\u{1F35B}", tag: "Free shipping", title: "Premium Quality Fresh Produce Box (400-450g)", rating: 4.8, sold: "1.3K", discountPct: 0, price: 76.43, originalPrice: null },
    ],
  },
  {
    id: "popular-items",
    title: "Popular items",
    cardType: "standard",
    rows: 1,
    products: [
      { id: "s3-1", color: "#efe9a8", emoji: "\u{1F50C}", tag: "Free shipping", title: "22.5W Power Bank 10000mAh Portable Charger", rating: 4.9, sold: "527", discountPct: 55, price: 26.99, originalPrice: 59.99 },
      { id: "s3-2", color: "#dfead9", emoji: "\u{1F48A}", tag: "Free shipping", title: "Fiber Chewable Tablets - Liver Support", rating: 4.8, sold: "8.2K", discountPct: 36, price: 16.06, originalPrice: 24.90 },
      { id: "s3-3", color: "#f3ece3", emoji: "\u{1FA71}", tag: "Free shipping", title: "Antibacterial Ice Silk Modal Seamless Shorts", rating: 4.7, sold: "7.7K", discountPct: 73, price: 4.32, originalPrice: 15.80 },
      { id: "s3-4", color: "#e8e2ee", emoji: "\u{1F457}", tag: "Free shipping", title: "Lace Trim Loungewear Set Fitted Cami Top & Shorts", rating: 4.6, sold: "1.0K", discountPct: 81, price: 3.24, originalPrice: 16.82 },
      { id: "s3-5", color: "#d8e6ee", emoji: "\u{1F4A8}", tag: "Free shipping", title: "Handheld Fan Mini Portable USB Fan", rating: 4.9, sold: "8.4K", discountPct: 52, price: 28.82, originalPrice: 60.00 },
    ],
  },
  {
    id: "star-deals",
    title: "4+ star deals for you",
    cardType: "standard",
    rows: 1,
    highlightIndex: 4,
    products: [
      { id: "s4-1", color: "#e9d488", emoji: "\u{1F955}", title: "Old Tree Fresh Produce (400-450G)", rating: 4.8, sold: "132", discountPct: 0, price: 41.00, originalPrice: null },
      { id: "s4-2", color: "#dedede", emoji: "\u{1F455}", tag: "Free shipping", title: "Unisex 220gsm Adult Slim Fit Sport Tracksuit", rating: 4.8, sold: "13.0K", discountPct: 43, price: 12.30, originalPrice: 21.70 },
      { id: "s4-3", color: "#e9dde3", emoji: "\u{1F6CF}", tag: "Free shipping", title: "4-in-1 Premium Single Comforter Set", rating: 4.8, sold: "166", discountPct: 52, price: 31.41, originalPrice: 65.40 },
      { id: "s4-4", color: "#f0ded8", emoji: "\u{1F431}", tag: "Free shipping", title: "Natural 15g Cat Treats Stick - Tuna & Chicken", rating: 4.8, sold: "21.2K", discountPct: 46, price: 0.20, originalPrice: 0.37 },
      { id: "s4-5", color: "#e5cfcf", emoji: "\u2615", tag: "Free shipping", title: "Fast Heat Stainless Steel Kettle 3L Auto Swich-off", rating: 4.6, sold: "34", discountPct: 45, price: 19.30, originalPrice: 34.94, highlight: true },
    ],
  },
  {
    id: "best-sellers",
    title: "Best sellers",
    cardType: "standard",
    rows: 2,
    products: [
      { id: "s5-1", color: "#dbe6c8", emoji: "\u{1F955}", tag: "Free shipping", title: "Crispy Green Snack Ready To Enjoy - 258g", rating: 4.6, sold: "797", discountPct: 0, price: 5.38, originalPrice: null },
      { id: "s5-2", color: "#dedede", emoji: "\u{1F45F}", tag: "Free shipping", title: "Sports Casual Sneakers - Clearance Sale", rating: 4.6, sold: "15.6K", discountPct: 78, price: 14.57, originalPrice: 67.29 },
      { id: "s5-3", color: "#222222", emoji: "\u{1F455}", tag: "Free shipping", title: "3D Men's Printed Training T-Shirt Gym Short Sleeve", rating: 0, sold: "40", discountPct: 51, price: 10.30, originalPrice: 21.18 },
      { id: "s5-4", color: "#f0dede", emoji: "\u{1F9F8}", tag: "Free shipping", title: "Plush Doll Pendant Blind Box Collectible", rating: 4.9, sold: "234", discountPct: 0, price: 35.40, originalPrice: null },
      { id: "s5-5", color: "#e5e5e5", emoji: "\u{1F455}", tag: "Free shipping", title: "Cropped Short Sleeve T-Shirt Summer Slimming", rating: 4.6, sold: "903", discountPct: 53, price: 8.00, originalPrice: 17.00 },
      { id: "s5-6", color: "#d9d9d9", emoji: "\u{1F9FA}", tag: "Free shipping", title: "Thick Magic Cleaning Cloths Microfiber - 10 Pack", rating: 4.7, sold: "1.3K", discountPct: 10, price: 9.40, originalPrice: 10.45 },
      { id: "s5-7", color: "#c9cfc4", emoji: "\u{1F45C}", tag: "Free shipping", title: "Crossbody Bag Shoulder Messenger Bag Travel", rating: 4.8, sold: "1.5K", discountPct: 58, price: 22.49, originalPrice: 54.00 },
      { id: "s5-8", color: "#f2d9e6", emoji: "\u{1F484}", tag: "Free shipping", title: "2-in-1 Hair Straightener & Curler Wand 32mm", rating: 4.9, sold: "380", discountPct: 50, price: 27.90, originalPrice: 56.00 },
      { id: "s5-9", color: "#ece3d4", emoji: "\u{1F49B}", tag: "Free shipping", title: "Thank You Cards Gift Set", rating: 0, sold: "781", discountPct: 0, price: 7.12, originalPrice: null },
      { id: "s5-10", color: "#dedede", emoji: "\u{1F456}", tag: "Free shipping", title: "Men's Baggy Casual Pants Geometric Print Mid-Rise", rating: 5.0, sold: "40", discountPct: 40, price: 11.40, originalPrice: 19.00 },
    ],
  },
];
