import { useMemo, useState } from "react";
import { CATS, CATEGORY_ICONS, CATEGORY_SHORT_LABELS as CATEGORY_LABELS } from "../data/catalogue.js";
import { ProductMiniCard } from "../components/products/ProductMiniCard.jsx";
import { VideoProductCard } from "../components/products/VideoProductCard.jsx";

const HomeSection = ({ title, children }) => (
  <section className="sg-section">
    <h2 className="sg-section-title">{title}</h2>
    {children}
  </section>
);

const FullWidthRow = ({ children }) => (
  <div className="sg-full-row">
    {children}
  </div>
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
    <main className="sg-home" style={{ width: "100%", maxWidth: "none", margin: 0, minWidth: 0 }}>
      <style>{`
        .sg-home{
          width:100%;
          max-width:none;
          min-width:0;
        }

        .sg-home .sg-section{
          width:100%;
          max-width:none;
        }

        .sg-full-row{
          width:100%;
          display:grid;
          grid-template-columns:repeat(5,minmax(0,1fr));
          gap:12px;
          align-items:stretch;
        }

        .sg-full-row > .hcard{
          width:100% !important;
          min-width:0 !important;
          max-width:none !important;
        }

        .sg-home .sg-product-grid{
          width:100%;
          max-width:none;
          grid-template-columns:repeat(5,minmax(0,1fr)) !important;
          gap:12px !important;
        }

        .sg-home .sg-product-grid > .hcard{
          width:100% !important;
          min-width:0 !important;
          max-width:none !important;
        }

        .sg-home .sg-categories{
          width:100%;
          max-width:none;
          display:flex;
          gap:12px;
          overflow-x:auto;
          overflow-y:hidden;
          scrollbar-width:none;
          padding-bottom:6px;
          -webkit-overflow-scrolling:touch;
        }

        .sg-home .sg-categories::-webkit-scrollbar{
          display:none;
        }

        .sg-home .sg-category{
          flex:0 0 auto;
        }

        .sg-home .sg-section-title{
          line-height:1.25;
        }

        @media (min-width: 1500px){
          .sg-full-row,
          .sg-home .sg-product-grid{
            grid-template-columns:repeat(5,minmax(0,1fr)) !important;
          }
        }

        @media (max-width: 1100px){
          .sg-full-row,
          .sg-home .sg-product-grid{
            grid-template-columns:repeat(4,minmax(0,1fr)) !important;
          }
        }

        @media (max-width: 860px){
          .sg-full-row,
          .sg-home .sg-product-grid{
            grid-template-columns:repeat(3,minmax(0,1fr)) !important;
          }
        }

        @media (max-width: 640px){
          .sg-full-row,
          .sg-home .sg-product-grid{
            grid-template-columns:repeat(2,minmax(0,1fr)) !important;
            gap:8px !important;
          }
        }

        @media (max-width: 1200px){
          .sg-home{
            padding-left:0;
            padding-right:0;
          }
        }

        @media (max-width: 768px){
          .sg-home .sg-section{
            margin-bottom:24px;
          }

          .sg-home .sg-section-title{
            font-size:18px !important;
          }

          .sg-home .sg-category{
            min-width:86px;
          }

          .sg-home .sg-category-icon{
            width:48px !important;
            height:48px !important;
          }
        }

        @media (max-width: 480px){
          .sg-home .sg-section{
            margin-bottom:20px;
          }

          .sg-home .sg-section-title{
            font-size:16px !important;
          }

          .sg-home .sg-category{
            min-width:78px;
            font-size:11px;
          }

          .sg-home .sg-category-icon{
            width:44px !important;
            height:44px !important;
          }
        }

      

        @media (max-width: 860px){
          .sg-home{
            width:100%;
            max-width:100%;
            margin:0;
            padding:0;
            overflow:hidden;
            background:#fff;
          }

          .sg-home .sg-categories-title{
            padding-left:12px;
            padding-right:12px;
            margin-top:10px;
          }

          .sg-home .sg-categories{
            padding-left:12px;
            padding-right:12px;
          }

          .sg-home .sg-section{
            width:100%;
            max-width:100%;
            padding-left:12px;
            padding-right:12px;
          }

          .sg-full-row,
          .sg-home .sg-product-grid{
            width:100%;
            max-width:100%;
          }
        }

        @media (max-width: 480px){
          .sg-home .sg-section,
          .sg-home .sg-categories-title{
            padding-left:10px;
            padding-right:10px;
          }

          .sg-home .sg-categories{
            padding-left:10px;
            padding-right:10px;
          }
        }



        /* ===== MOBILE OVERFLOW CONTAINMENT ===== */
        .sg-home,
        .sg-home .sg-section,
        .sg-full-row,
        .sg-home .sg-product-grid{
          min-width:0;
          box-sizing:border-box;
        }

        .sg-home{
          max-width:100%;
          overflow-x:clip;
        }

        .sg-home .sg-section,
        .sg-full-row,
        .sg-home .sg-product-grid{
          max-width:100%;
        }

        .sg-full-row > *,
        .sg-home .sg-product-grid > *{
          min-width:0 !important;
          max-width:100% !important;
        }

        /* Categories are the only intentionally horizontal-scrolling row */
        .sg-home .sg-categories{
          width:100%;
          max-width:100%;
          min-width:0;
          overflow-x:auto;
          overflow-y:hidden;
          overscroll-behavior-x:contain;
          touch-action:pan-x;
        }

        @media(max-width:860px){
          .sg-home{
            width:100%!important;
            max-width:100%!important;
            margin:0!important;
            overflow-x:clip!important;
          }

          .sg-home .sg-section{
            width:100%!important;
            max-width:100%!important;
            min-width:0!important;
          }

          .sg-full-row,
          .sg-home .sg-product-grid{
            width:100%!important;
            max-width:100%!important;
            min-width:0!important;
          }
        }

`}</style>
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
            <FullWidthRow>
              {savings.map(({ v, p }, i) => p ? (
                <VideoProductCard key={`${v.id}-${i}`} v={v} p={p} onOpen={onOpen} onAdd={onAdd} dark={false} />
              ) : null)}
            </FullWidthRow>
          </HomeSection>

          <HomeSection title="Top deals for you">
            <FullWidthRow>
              {topDeals.map((p, i) => (
                <ProductMiniCard key={`${p.id}-top-${i}`} p={p} onOpen={onOpen} onAdd={onAdd} wide dark={false} />
              ))}
            </FullWidthRow>
          </HomeSection>

          <HomeSection title="Popular items">
            <FullWidthRow>
              {popular.map((p, i) => (
                <ProductMiniCard key={`${p.id}-popular-${i}`} p={p} onOpen={onOpen} onAdd={onAdd} wide dark={false} />
              ))}
            </FullWidthRow>
          </HomeSection>

          <HomeSection title="4+ star deals for you">
            <FullWidthRow>
              {starDeals.map((p, i) => (
                <ProductMiniCard key={`${p.id}-star-${i}`} p={p} onOpen={onOpen} onAdd={onAdd} wide dark={false} />
              ))}
            </FullWidthRow>
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