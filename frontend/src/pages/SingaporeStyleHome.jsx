import { useMemo, useState } from "react";
import { CATS, CATEGORY_ICONS, CATEGORY_SHORT_LABELS as CATEGORY_LABELS } from "../data/catalogue.js";
import { ProductMiniCard } from "../components/products/ProductMiniCard.jsx";
import { VideoProductCard } from "../components/products/VideoProductCard.jsx";
import { ScrollRow } from "../components/shop/ScrollRow.jsx";

const HomeSection = ({ title, children }) => (
  <section className="sg-section">
    <h2 className="sg-section-title">{title}</h2>
    {children}
  </section>
);

export default function SingaporeStyleHome({
  products = [],
  vids = [],
  onOpen,
  onAdd,
  search = "",
  setSearch,
  cat = "all",
  setCat,
  loading = false,
}) {
  const [showAll, setShowAll] = useState(false);

  const pick = (start, count) => {
    if (!products.length) return [];
    return Array.from({ length: count }, (_, i) => products[(start + i) % products.length]);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const category = `${p.cat || ""} ${p.category || ""}`.toLowerCase();
      return (cat === "all" || category.includes(cat.toLowerCase())) &&
        (!q || `${p.title || ""} ${p.description || ""}`.toLowerCase().includes(q));
    });
  }, [products, search, cat]);

  const topDeals = pick(0, 5);
  const popular = pick(5, 5);
  const starDeals = [...products].filter((p) => Number(p.rating || 0) >= 4).slice(0, 5);
  const bestSellers = [...products].sort((a, b) => Number(b.sold || 0) - Number(a.sold || 0));

  const savings = vids.slice(0, 5).map((v, i) => ({
    v,
    p: products.find((p) => (v.prods || []).includes(p.id)) || pick(i, 1)[0],
  }));

  return (
    <main className="sg-home" style={{ maxWidth: 2400, width: "100%", margin: "0 auto" }}>
      <h2 className="sg-section-title sg-categories-title">Categories</h2>

      <div className="sg-categories" aria-label="Categories">
        {CATS.filter((c) => c.s !== "all").map((c) => (
          <button
            key={c.s}
            type="button"
            className={`sg-category ${cat === c.s ? "active" : ""}`}
            onClick={() => setCat(c.s)}
          >
            <span className="sg-category-icon">
              <img src={CATEGORY_ICONS[c.s]} alt={c.l} style={{ width: 32, height: 32, objectFit: "contain" }} />
            </span>
            <span>{CATEGORY_LABELS[c.s] || c.l}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="sg-loading">Loading products…</div>
      ) : search || cat !== "all" ? (
        <HomeSection title={cat === "all" ? "Search results" : (CATS.find((c) => c.s === cat)?.l || "Products")}>
          {filtered.length ? (
            <div className="sg-product-grid">
              {filtered.map((p) => (
                <ProductMiniCard key={p.id} p={p} onOpen={onOpen} onAdd={onAdd} dark={false} />
              ))}
            </div>
          ) : (
            <div className="sg-empty">No products found.</div>
          )}
        </HomeSection>
      ) : (
        <>
          <HomeSection title="Savings for you">
            <ScrollRow>
              {savings.map(({ v, p }, i) => p ? (
                <VideoProductCard key={`${v.id}-${i}`} v={v} p={p} onOpen={onOpen} onAdd={onAdd} dark={false} />
              ) : null)}
            </ScrollRow>
          </HomeSection>

          <HomeSection title="Top deals for you">
            <ScrollRow>
              {topDeals.map((p, i) => (
                <ProductMiniCard key={`${p.id}-top-${i}`} p={p} onOpen={onOpen} onAdd={onAdd} wide dark={false} />
              ))}
            </ScrollRow>
          </HomeSection>

          <HomeSection title="Popular items">
            <ScrollRow>
              {popular.map((p, i) => (
                <ProductMiniCard key={`${p.id}-popular-${i}`} p={p} onOpen={onOpen} onAdd={onAdd} wide dark={false} />
              ))}
            </ScrollRow>
          </HomeSection>

          <HomeSection title="4+ star deals for you">
            <ScrollRow>
              {starDeals.map((p, i) => (
                <ProductMiniCard key={`${p.id}-star-${i}`} p={p} onOpen={onOpen} onAdd={onAdd} wide dark={false} />
              ))}
            </ScrollRow>
          </HomeSection>

          <HomeSection title="Best sellers">
            <div className="sg-product-grid sg-best-sellers">
              {(showAll ? bestSellers : bestSellers.slice(0, 10)).map((p, i) => (
                <ProductMiniCard key={`${p.id}-seller-${i}`} p={p} onOpen={onOpen} onAdd={onAdd} dark={false} />
              ))}
            </div>
            {!showAll && bestSellers.length > 10 && (
              <div className="sg-view-more">
                <button type="button" onClick={() => setShowAll(true)}>View more</button>
              </div>
            )}
          </HomeSection>
        </>
      )}
    </main>
  );
}