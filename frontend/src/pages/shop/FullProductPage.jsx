import { useState, useEffect, useMemo } from "react";
import { CATALOGUE, PRODUCT_REVIEWS, SIZES, SWATCH_COLORS } from "../../data/catalogue.js";

const Stars = ({ rating = 0, size = 13, gap = 2 }) => (
  <div style={{ display: "flex", gap, lineHeight: 1 }}>
    {Array.from({ length: 5 }).map((_, i) => (
      <span key={i} style={{ fontSize: size, color: i < Math.round(rating) ? "#ff9500" : "#e2e2e2" }}>★</span>
    ))}
  </div>
);

const ProductThumb = ({ img, emoji, size = "100%" }) =>
  img ? (
    <img src={img} alt="" style={{ width: size, height: size, objectFit: "cover", display: "block" }} />
  ) : (
    <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", fontSize: typeof size === "number" ? size * 0.55 : 40, background: "#fafafa" }}>
      {emoji || "🛍️"}
    </div>
  );

const PAGE_SIZE = 5;

export const FullProductPage = ({
  prod,
  onClose,
  addToCart,
  setCart,
  onBuyNow,
  likedP,
  toggleLP,
  showToast,
}) => {
  const [selSize, setSz] = useState(null);
  const [selColor, setClr] = useState(0);
  const [qty, setQty] = useState(1);
  const [mainImg, setMainImg] = useState(0);
  const [descOpen, setDescOpen] = useState(true);
  const [descExpanded, setDescExpanded] = useState(false);
  const [sortBy, setSortBy] = useState("recommended");
  const [visualsOnly, setVisualsOnly] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);

  const rawReviews = PRODUCT_REVIEWS?.[prod.id] || PRODUCT_REVIEWS?.[3] || [];
  const rating = Number(prod.rating) || 4.5;
  const sold = Number(prod.sold) || 0;
  const hasDiscount = Number(prod.disc) > 0 && Number(prod.orig) > Number(prod.price);
  const hasSizes =
    prod.sizes?.length > 0 ||
    (prod.cat && ["fashion", "clothing", "footwear", "sports", "menswear"].some((c) => prod.cat?.toLowerCase().includes(c)));
  const hasColors =
    prod.colors?.length > 0 ||
    (prod.cat && ["fashion", "clothing", "footwear", "menswear"].some((c) => prod.cat?.toLowerCase().includes(c)));
  const sizeList = prod.sizes || SIZES || ["S", "M", "L", "XL", "2XL"];
  const colorList = prod.colors || SWATCH_COLORS || ["#111", "#777", "#2b3a55", "#8a6d3b"];

  useEffect(() => {
    window.scrollTo(0, 0);
    setQty(1);
    setSz(null);
    setMainImg(0);
    setReviewPage(1);
  }, [prod.id]);

  const gallery = prod.images?.length ? prod.images : prod.img ? [prod.img, prod.img, prod.img, prod.img] : [];

  const ratingBuckets = [
    { star: 5, pct: 78 },
    { star: 4, pct: 14 },
    { star: 3, pct: 5 },
    { star: 2, pct: 2 },
    { star: 1, pct: 1 },
  ];
  const totalReviews = rawReviews.length || sold || 0;

  // Normalize review shape — PRODUCT_REVIEWS entries use {n,loc,ago,stars,txt,hasPhoto}
  const reviews = useMemo(() => {
    return rawReviews.map((r, i) => ({
      name: r.n || r.name || r.buyer_name || "Verified Buyer",
      loc: r.loc || "",
      ago: r.ago || r.date || "Recently",
      stars: r.stars ?? r.rating ?? 5,
      txt: r.txt || r.comment || r.text || "",
      hasPhoto: !!r.hasPhoto,
      photo: r.hasPhoto ? `https://placehold.co/120x120/${(prod.color || "#fe2c55").replace("#", "")}/ffffff?text=` : null,
      itemColor: typeof colorList[i % colorList.length] === "string" && !colorList[i % colorList.length].startsWith("#")
        ? colorList[i % colorList.length]
        : ["NAVY BLUE", "BLACK", "GREY", "NAVY GREEN"][i % 4],
      itemSize: sizeList[i % sizeList.length],
    }));
  }, [rawReviews]);

  const photoReviews = reviews.filter((r) => r.hasPhoto);

  const filteredReviews = useMemo(() => {
    let list = visualsOnly ? reviews.filter((r) => r.hasPhoto) : reviews;
    if (sortBy === "highest") list = [...list].sort((a, b) => b.stars - a.stars);
    if (sortBy === "lowest") list = [...list].sort((a, b) => a.stars - b.stars);
    return list;
  }, [reviews, visualsOnly, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / PAGE_SIZE));
  const pagedReviews = filteredReviews.slice((reviewPage - 1) * PAGE_SIZE, reviewPage * PAGE_SIZE);

  const related = CATALOGUE.filter((p) => p.id !== prod.id && p.cat === prod.cat)
    .slice(0, 10)
    .concat(CATALOGUE.filter((p) => p.id !== prod.id).slice(0, 10))
    .slice(0, 15);

  const fromSeller = CATALOGUE
    .filter((p) => p.id !== prod.id && (p.seller || p.brand) === (prod.seller || prod.brand))
    .slice(0, 5);
  const sellerName = prod.seller || prod.brand || "this seller";

  const canBuy = !hasSizes || !!selSize;

  const handleAddToCart = () => {
    if (!canBuy) { showToast?.("Please select a size"); return; }
    for (let i = 0; i < qty; i++) addToCart({ ...prod, size: selSize, color: colorList[selColor] });
    showToast?.(`${qty} item${qty > 1 ? "s" : ""} added to cart`);
  };

  const handleBuyNow = () => {
    if (!canBuy) { showToast?.("Please select a size"); return; }
    setCart([{ ...prod, qty, size: selSize, color: colorList[selColor] }]);
    onBuyNow();
    onClose();
  };

  const swatchLabel = (c, i) => {
    if (typeof c === "string" && c.startsWith("#")) return `Option ${i + 1}`;
    return c;
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fff", paddingBottom: 60 }}>
      {/* Breadcrumb */}
      <div style={{ borderBottom: "1px solid #eee", padding: "14px 28px", display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#888", flexWrap: "wrap" }}>
        <span onClick={onClose} style={{ cursor: "pointer", color: "#fe2c55", fontWeight: 600 }}>Shop</span>
        <span>›</span>
        <span>{prod.cat || "Products"}</span>
        <span>›</span>
        <span style={{ color: "#333", fontWeight: 500, maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{prod.title}</span>
        <button onClick={onClose} style={{ marginLeft: "auto", background: "#f5f5f5", border: "1px solid #eee", borderRadius: 8, color: "#555", padding: "6px 16px", cursor: "pointer", fontFamily: "inherit", fontSize: 12.5, fontWeight: 600 }}>← Back</button>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 28px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "460px 1fr", gap: 44, marginBottom: 44 }} className="product-page-grid">
          {/* LEFT: Gallery */}
          <div>
            <div style={{ border: "1px solid #eee", borderRadius: 16, aspectRatio: "1", overflow: "hidden", position: "relative", background: "#fafafa" }}>
              <ProductThumb img={gallery[mainImg]} emoji={prod.emoji} size="100%" />
              {hasDiscount && (
                <div style={{ position: "absolute", top: 14, left: 14, background: "#fe2c55", color: "#fff", fontSize: 12.5, fontWeight: 800, padding: "5px 12px", borderRadius: 100 }}>
                  -{prod.disc}% OFF
                </div>
              )}
              <button onClick={() => toggleLP(prod.id)} style={{ position: "absolute", top: 14, right: 14, width: 34, height: 34, borderRadius: "50%", border: "1px solid #eee", background: "rgba(255,255,255,0.9)", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {likedP?.has(prod.id) ? "❤️" : "🤍"}
              </button>
            </div>

            {gallery.length > 1 && (
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                {gallery.slice(0, 5).map((img, i) => (
                  <div key={i} onClick={() => setMainImg(i)} style={{ flex: 1, aspectRatio: "1", borderRadius: 8, overflow: "hidden", cursor: "pointer", border: `2px solid ${mainImg === i ? "#fe2c55" : "#eee"}`, transition: "border-color .15s" }}>
                    <ProductThumb img={img} emoji={prod.emoji} size="100%" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Details */}
          <div>
            {/* Price row */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
              {hasDiscount && <span style={{ color: "#fe2c55", fontWeight: 800, fontSize: 18 }}>-{prod.disc}%</span>}
              <span style={{ color: "#fe2c55", fontFamily: "'TikTok Sans',sans-serif", fontWeight: 800, fontSize: 32 }}>Rs {Number(prod.price).toLocaleString()}</span>
              {hasDiscount && <span style={{ fontSize: 15, color: "#aaa", textDecoration: "line-through" }}>Rs {Number(prod.orig).toLocaleString()}</span>}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 18, color: "#0aa15c", fontSize: 12.5, fontWeight: 600 }}>
              <span>🚚</span> Free shipping
            </div>

            <h1 style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.4, color: "#111", marginBottom: 10 }}>{prod.title}</h1>

            <div style={{ fontSize: 12.5, color: "#888", marginBottom: 8 }}>
              Sold by <span style={{ color: "#111", fontWeight: 600 }}>{prod.seller || prod.brand || "ShopTok Seller"}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <Stars rating={rating} size={14} />
              <span style={{ fontSize: 12.5, color: "#888" }}>{rating} ({totalReviews.toLocaleString()}) · {sold.toLocaleString()} sold</span>
            </div>

            {/* Colors */}
            {hasColors && (
              <div style={{ marginBottom: 22 }}>
                <p style={{ fontSize: 12.5, color: "#555", fontWeight: 600, marginBottom: 10 }}>
                  Color: <span style={{ color: "#111" }}>{swatchLabel(colorList[selColor], selColor)}</span>
                </p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {colorList.map((c, i) => (
                    <button key={i} onClick={() => setClr(i)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                      <span style={{ width: 52, height: 52, borderRadius: 8, border: `2px solid ${selColor === i ? "#fe2c55" : "#eee"}`, background: typeof c === "string" && c.startsWith("#") ? c : "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#555" }}>
                        {typeof c === "string" && !c.startsWith("#") ? c.slice(0, 3).toUpperCase() : ""}
                      </span>
                      <span style={{ fontSize: 10, color: selColor === i ? "#fe2c55" : "#888", fontWeight: selColor === i ? 700 : 500, maxWidth: 56, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {swatchLabel(c, i)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {hasSizes && (
              <div style={{ marginBottom: 22 }}>
                <p style={{ fontSize: 12.5, color: "#555", fontWeight: 600, marginBottom: 10 }}>
                  Size: <span style={{ color: "#111" }}>{selSize || "Select a size"}</span>
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {sizeList.map((s) => (
                    <button key={s} onClick={() => setSz(s)} style={{ minWidth: 52, padding: "10px 16px", borderRadius: 8, border: `2px solid ${selSize === s ? "#fe2c55" : "#eee"}`, background: selSize === s ? "rgba(254,44,85,0.06)" : "#fff", color: selSize === s ? "#fe2c55" : "#333", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
              <p style={{ fontSize: 12.5, color: "#555", fontWeight: 600 }}>Quantity:</p>
              <div style={{ display: "flex", alignItems: "center", border: "1px solid #eee", borderRadius: 8, overflow: "hidden" }}>
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} style={{ width: 38, height: 38, background: "none", border: "none", color: "#111", fontSize: 18, cursor: "pointer" }}>−</button>
                <span style={{ fontWeight: 700, fontSize: 14, minWidth: 36, textAlign: "center", borderLeft: "1px solid #eee", borderRight: "1px solid #eee", lineHeight: "38px" }}>{qty}</span>
                <button onClick={() => setQty((q) => Math.min(q + 1, prod.stock || 99))} style={{ width: 38, height: 38, background: "none", border: "none", color: "#111", fontSize: 18, cursor: "pointer" }}>+</button>
              </div>
              <span style={{ fontSize: 12, color: "#0aa15c", fontWeight: 600 }}>{prod.stock || "In"} in stock</span>
            </div>

            {/* CTA — single "Buy now" like the reference, cart icon alongside */}
            <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
              <button onClick={handleAddToCart} title="Add to Cart" style={{ width: 52, height: 52, flexShrink: 0, background: "#fff", border: "2px solid #fe2c55", borderRadius: 100, color: "#fe2c55", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>🛒</button>
              <button onClick={handleBuyNow} style={{ flex: 1, padding: "15px", background: "linear-gradient(135deg,#fe2c55,#ff6b35)", border: "none", borderRadius: 100, color: "#fff", fontFamily: "'TikTok Sans',sans-serif", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Buy now</button>
            </div>

            {/* Trust badges */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
              {[
                ["🚚", "Free Delivery", "On orders above Rs 1,000"],
                ["💵", "Cash on Delivery", "Pay when you receive"],
                ["↩️", "7-Day Returns", "Easy return policy"],
                ["🔒", "Secure Payment", "USDT, Bank & Crypto"],
              ].map(([ic, t, s]) => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 10, background: "#fafafa", border: "1px solid #eee", borderRadius: 10, padding: "12px 14px" }}>
                  <span style={{ fontSize: 18 }}>{ic}</span>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 2, color: "#111" }}>{t}</p>
                    <p style={{ fontSize: 11, color: "#999" }}>{s}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RATING SUMMARY ─────────────────────────────────────────── */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            <span style={{ fontFamily: "'TikTok Sans',sans-serif", fontWeight: 800, fontSize: 20, color: "#111" }}>{rating}</span>
            <span style={{ color: "#ff9500", fontSize: 16 }}>★</span>
            <span style={{ fontSize: 14, color: "#555" }}>{totalReviews.toLocaleString()} global reviews</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 420, marginBottom: 20 }}>
            {ratingBuckets.map(({ star, pct }) => (
              <div key={star} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: "#555", minWidth: 12 }}>{star}</span>
                <div style={{ flex: 1, height: 6, background: "#eee", borderRadius: 100 }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: "#111", borderRadius: 100 }} />
                </div>
                <span style={{ fontSize: 11.5, color: "#999", minWidth: 34, textAlign: "right" }}>{Math.round((pct / 100) * totalReviews)}</span>
              </div>
            ))}
          </div>

          {/* Photos from reviews */}
          {photoReviews.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: "#111" }}>Photos from reviews</p>
              </div>
              <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
                {photoReviews.slice(0, 6).map((r, i) => (
                  <div key={i} style={{ flexShrink: 0, width: 90, height: 90, borderRadius: 10, overflow: "hidden", position: "relative" }}>
                    <img src={r.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <span style={{ position: "absolute", bottom: 4, left: 4, fontSize: 10, color: "#fff", fontWeight: 700, textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>{r.stars}★</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sort / Filter controls */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginBottom: 6 }}>
            <div>
              <p style={{ fontSize: 11, color: "#999", marginBottom: 4 }}>Sort by</p>
              <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setReviewPage(1); }} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 12.5, fontFamily: "inherit", color: "#111", background: "#fff" }}>
                <option value="recommended">Recommended</option>
                <option value="highest">Highest rating</option>
                <option value="lowest">Lowest rating</option>
              </select>
            </div>
            <div>
              <p style={{ fontSize: 11, color: "#999", marginBottom: 4 }}>Filter by</p>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setVisualsOnly(false); setReviewPage(1); }} style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${!visualsOnly ? "#111" : "#ddd"}`, background: !visualsOnly ? "#111" : "#fff", color: !visualsOnly ? "#fff" : "#555", fontSize: 12.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>★ All</button>
                <button onClick={() => { setVisualsOnly(true); setReviewPage(1); }} style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${visualsOnly ? "#111" : "#ddd"}`, background: visualsOnly ? "#111" : "#fff", color: visualsOnly ? "#fff" : "#555", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>Includes visuals</button>
                <button style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", color: "#555", fontSize: 12.5, fontWeight: 600, cursor: "default" }}>Verified purchase</button>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "14px 0" }}>
            <p style={{ fontSize: 12.5, color: "#888" }}>Displaying {filteredReviews.length} of {reviews.length} reviews</p>
            {(visualsOnly || sortBy !== "recommended") && (
              <span onClick={() => { setVisualsOnly(false); setSortBy("recommended"); setReviewPage(1); }} style={{ fontSize: 12.5, color: "#fe2c55", fontWeight: 600, cursor: "pointer" }}>Reset filters</span>
            )}
          </div>

          {/* Review list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {pagedReviews.length === 0 && (
              <p style={{ fontSize: 13, color: "#999", padding: "24px 0" }}>No reviews match this filter.</p>
            )}
            {pagedReviews.map((r, i) => (
              <div key={i} style={{ borderBottom: "1px solid #f0f0f0", padding: "20px 0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(254,44,85,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fe2c55", fontSize: 13 }}>
                    {r.name[0]}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{r.name} · <span style={{ fontWeight: 400, color: "#888" }}>Verified purchase</span></p>
                    <p style={{ fontSize: 11, color: "#999" }}>{r.loc}</p>
                  </div>
                </div>
                <Stars rating={r.stars} size={12} gap={1} />
                <p style={{ fontSize: 13, color: "#333", lineHeight: 1.6, margin: "8px 0" }}>{r.txt}</p>
                {r.hasPhoto && (
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    {Array.from({ length: 3 }).map((_, pi) => (
                      <img key={pi} src={r.photo} alt="" style={{ width: 64, height: 64, borderRadius: 8, objectFit: "cover" }} />
                    ))}
                  </div>
                )}
                <p style={{ fontSize: 11.5, color: "#999" }}>Item: {r.itemColor}, {r.itemSize}</p>
                <p style={{ fontSize: 11, color: "#bbb", marginTop: 2 }}>{r.ago}</p>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", padding: "24px 0 40px" }}>
              <button onClick={() => setReviewPage((p) => Math.max(1, p - 1))} disabled={reviewPage === 1} style={{ background: "none", border: "none", color: reviewPage === 1 ? "#ccc" : "#555", fontSize: 12.5, fontWeight: 600, cursor: reviewPage === 1 ? "default" : "pointer" }}>← Previous</button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => setReviewPage(i + 1)} style={{ width: 28, height: 28, borderRadius: 6, border: "none", background: reviewPage === i + 1 ? "#111" : "transparent", color: reviewPage === i + 1 ? "#fff" : "#555", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>{i + 1}</button>
              ))}
              <button onClick={() => setReviewPage((p) => Math.min(totalPages, p + 1))} disabled={reviewPage === totalPages} style={{ background: "none", border: "none", color: reviewPage === totalPages ? "#ccc" : "#555", fontSize: 12.5, fontWeight: 600, cursor: reviewPage === totalPages ? "default" : "pointer" }}>Next →</button>
            </div>
          )}
        </div>

        {/* ── ABOUT THIS PRODUCT ─────────────────────────────────────── */}
        <div style={{ marginBottom: 44 }}>
          <h2 style={{ fontFamily: "'TikTok Sans',sans-serif", fontWeight: 800, fontSize: 20, color: "#111", marginBottom: 16 }}>About this product</h2>
          <div style={{ border: "1px solid #eee", borderRadius: 14, overflow: "hidden" }}>
            <button onClick={() => setDescOpen((o) => !o)} style={{ width: "100%", background: "#fafafa", border: "none", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontFamily: "inherit" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>Product description</span>
              <span style={{ fontSize: 13, color: "#888", transform: descOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }}>▾</span>
            </button>
            {descOpen && (
              <div style={{ padding: "24px 20px", maxWidth: 800 }}>
                <p style={{ fontSize: 13.5, color: "#555", lineHeight: 1.9, marginBottom: 20, maxHeight: descExpanded ? "none" : 96, overflow: "hidden" }}>
                  {prod.description ||
                    `${prod.title} — a premium quality product available on ShopTok. This product is carefully curated to meet the highest standards of quality and value.`}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                  {[
                    ["Category", prod.cat || "General"],
                    ["Brand", prod.brand || "ShopTok Select"],
                    ["Stock", `${prod.stock || 0} units`],
                    ["Sold", `${sold.toLocaleString()} units`],
                  ].map(([k, v]) => (
                    <div key={k} style={{ background: "#fafafa", border: "1px solid #eee", borderRadius: 10, padding: "12px 16px", display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 12.5, color: "#999" }}>{k}</span>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: "#111" }}>{v}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => setDescExpanded((e) => !e)} style={{ background: "#f5f5f5", border: "1px solid #eee", borderRadius: 8, padding: "9px 24px", fontSize: 12.5, fontWeight: 600, color: "#111", cursor: "pointer", fontFamily: "inherit" }}>
                  {descExpanded ? "View less" : "View more"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── EXPLORE MORE FROM SELLER ───────────────────────────────── */}
        {fromSeller.length > 0 && (
          <div style={{ marginBottom: 44 }}>
            <h2 style={{ fontFamily: "'TikTok Sans',sans-serif", fontWeight: 800, fontSize: 20, color: "#111", marginBottom: 16 }}>Explore more from {sellerName}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14 }} className="related-grid">
              {fromSeller.map((p) => (
                <ProductCard key={p.id} p={p} onClose={onClose} />
              ))}
            </div>
          </div>
        )}

        {/* ── YOU MAY ALSO LIKE ──────────────────────────────────────── */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: "'TikTok Sans',sans-serif", fontWeight: 800, fontSize: 20, color: "#111", marginBottom: 16 }}>You may also like</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14 }} className="related-grid">
            {related.map((p) => (
              <ProductCard key={p.id} p={p} onClose={onClose} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({ p, onClose }) => (
  <div
    onClick={() => onClose()}
    style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, overflow: "hidden", cursor: "pointer", transition: "border-color .2s" }}
    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#fe2c55")}
    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#eee")}
  >
    <div style={{ aspectRatio: "1", background: "#fafafa" }}>
      <ProductThumb img={p.img} emoji={p.emoji} size="100%" />
    </div>
    <div style={{ padding: 12 }}>
      <p style={{ fontSize: 12.5, fontWeight: 500, marginBottom: 6, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</p>
      {Number(p.disc) > 0 && <p style={{ fontSize: 11, fontWeight: 700, color: "#fe2c55", marginBottom: 2 }}>-{p.disc}%</p>}
      <p style={{ fontFamily: "'TikTok Sans',sans-serif", fontWeight: 700, color: "#fe2c55", fontSize: 13.5 }}>Rs {Number(p.price).toLocaleString()}</p>
    </div>
  </div>
);

export default FullProductPage;
