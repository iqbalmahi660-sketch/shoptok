import { CATS } from "../data/catalogue.js";

// Sub-category labels shown under each main category on the sitemap page.
// Purely organizational/browsing links — clicking one filters the shop by
// that main category.
const SUBCATEGORIES = {
  fashion: ["Women's Dresses", "Women's Tops", "Women's Bottoms", "Women's Suits & Sets", "Women's Sleepwear", "Women's Underwear", "Women's Special Occasion"],
  electronics: ["Mobile Phones", "Phone Accessories", "Audio & Headphones", "Smart Watches & Wearables", "Cameras & Photography", "Laptops & Computers", "Gaming & Consoles"],
  accessories: ["Jewelry", "Watches", "Sunglasses & Eyewear", "Hair Accessories", "Belts", "Wallets & Cardholders"],
  menswear: ["Men's Shirts", "Men's Bottoms", "Men's Suits & Sets", "Men's Underwear", "Men's Sleepwear", "Men's Outerwear"],
  home: ["Home Decor", "Kitchen & Dining", "Bedding & Linens", "Storage & Organization", "Cleaning Supplies", "Lighting"],
  beauty: ["Skincare", "Makeup", "Haircare & Styling", "Fragrance", "Bath & Body Care", "Personal Care Appliances"],
  shoes: ["Women's Shoes", "Men's Shoes", "Kids' Shoes", "Sports Shoes", "Sandals & Slippers"],
  sports: ["Fitness Equipment", "Outdoor & Camping", "Cycling", "Team Sports", "Activewear", "Yoga & Wellness"],
  bags: ["Handbags", "Backpacks", "Travel Luggage", "Wallets", "Laptop Bags", "Duffel Bags"],
};

export const CategorySitemap = ({ setPage, setCat }) => {
  const cats = CATS.filter((c) => c.s !== "all");

  const openCategory = (slug) => {
    setCat(slug);
    setPage("shop");
    window.scrollTo(0, 0);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 24px 0" }}>
        <button
          onClick={() => { setPage("shop"); window.scrollTo(0, 0); }}
          style={{ background: "none", border: "none", color: "rgba(0,0,0,0.5)", cursor: "pointer", fontSize: 13, marginBottom: 20, display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}
        >← Back to Home</button>
        <h1 style={{ fontFamily: "'TikTok Sans',sans-serif", fontWeight: 800, fontSize: 26, marginBottom: 34 }}>Categories</h1>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "34px 28px" }}>
          {cats.map((c) => (
            <div key={c.s}>
              <button
                onClick={() => openCategory(c.s)}
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "'TikTok Sans',sans-serif", fontWeight: 700, fontSize: 15, color: "#111", marginBottom: 12, textAlign: "left" }}
              >{c.l}</button>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(SUBCATEGORIES[c.s] || []).map((sub) => (
                  <span
                    key={sub}
                    onClick={() => openCategory(c.s)}
                    style={{ fontSize: 13, color: "rgba(0,0,0,0.55)", cursor: "pointer" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#fe2c55")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(0,0,0,0.55)")}
                  >{sub}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategorySitemap;
