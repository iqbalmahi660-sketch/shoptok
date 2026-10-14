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
  stores = [],
  storesLoading = false,
  onOpenStore,
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


        .sg-home .sg-section-title{
          line-height:1.25;
        }

        .sg-store-row{
          width:100%;
          display:flex;
          gap:14px;
          overflow-x:auto;
          overflow-y:hidden;
          padding:2px 2px 10px;
          scrollbar-width:none;
          -webkit-overflow-scrolling:touch;
          scroll-snap-type:x proximity;
        }

        .sg-store-row::-webkit-scrollbar{display:none;}

        .sg-store-card{
          appearance:none;
          position:relative;
          flex:0 0 250px;
          min-width:250px;
          border:1px solid #ededf0;
          background:#fff;
          border-radius:18px;
          padding:0;
          overflow:hidden;
          text-align:left;
          cursor:pointer;
          font-family:inherit;
          box-shadow:0 4px 18px rgba(15,23,42,.055);
          transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease;
          scroll-snap-align:start;
        }

        .sg-store-card:hover{
          transform:translateY(-3px);
          border-color:#dcdce2;
          box-shadow:0 12px 30px rgba(15,23,42,.11);
        }

        .sg-store-cover{
          height:62px;
          background:
            radial-gradient(circle at 86% 18%,rgba(255,255,255,.34),transparent 27%),
            linear-gradient(125deg,#111827 0%,#2d3748 54%,#fe2c55 140%);
        }

        .sg-store-body{
          position:relative;
          padding:34px 14px 14px;
        }

        .sg-store-logo{
          position:absolute;
          top:-31px;
          left:14px;
          width:58px;
          height:58px;
          border-radius:50%;
          overflow:hidden;
          border:3px solid #fff;
          background:linear-gradient(135deg,#fe2c55,#ff7a59);
          color:#fff;
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:22px;
          font-weight:800;
          box-shadow:0 4px 12px rgba(15,23,42,.15);
        }

        .sg-store-logo img{width:100%;height:100%;object-fit:cover;display:block;}
        .sg-store-name{font-size:14px;font-weight:800;color:#111827;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-right:4px;}
        .sg-store-meta{font-size:11.5px;color:#7b8190;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .sg-store-footer{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:12px;}
        .sg-store-stats{font-size:11px;color:#555f70;display:flex;gap:8px;align-items:center;min-width:0;}
        .sg-store-visit{font-size:11px;font-weight:800;color:#fe2c55;white-space:nowrap;}

        @media(max-width:860px){
          .sg-store-row{gap:10px;padding-bottom:8px;}
          .sg-store-card{flex-basis:220px;min-width:220px;}
        }
        @media(max-width:640px){
          .sg-store-card{flex-basis:190px;min-width:190px;border-radius:15px;}
          .sg-store-cover{height:54px;}
          .sg-store-body{padding:31px 12px 12px;}
          .sg-store-logo{width:52px;height:52px;top:-27px;left:12px;}
          .sg-store-name{font-size:13px;}
          .sg-store-meta{font-size:10.5px;}
          .sg-store-stats{font-size:10px;gap:6px;}
          .sg-store-visit{font-size:10px;}
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






        /* ===== FINAL CATEGORY CAROUSEL: internal scroll only ===== */
        .sg-home .sg-category-viewport{
          width:100%;
          max-width:100%;
          min-width:0;
          overflow:hidden;
          box-sizing:border-box;
        }

        .sg-home .sg-categories{
          width:100%;
          max-width:100%;
          min-width:0;
          display:flex;
          flex-wrap:nowrap;
          overflow-x:auto;
          overflow-y:hidden;
          margin:0;
          box-sizing:border-box;
          scrollbar-width:none;
          -webkit-overflow-scrolling:touch;
          overscroll-behavior-x:contain;
          touch-action:pan-x;
        }

        .sg-home .sg-categories::-webkit-scrollbar{
          display:none;
        }

        @media (max-width:640px){
          .sg-home .sg-category-viewport{
            padding:0 10px;
          }

          .sg-home .sg-categories{
            gap:0 !important;
            padding:0 0 6px !important;
            scroll-snap-type:x mandatory;
          }

          .sg-home .sg-category{
            flex:0 0 25% !important;
            width:25% !important;
            min-width:0 !important;
            max-width:25% !important;
            padding:0 4px !important;
            margin:0 !important;
            box-sizing:border-box !important;
            scroll-snap-align:start;
          }

          .sg-home .sg-category > span:last-child{
            width:100%;
            max-width:100%;
            display:block;
            white-space:normal;
            overflow-wrap:anywhere;
            text-align:center;
          }
        }

`}</style>
      <h2 className="sg-section-title sg-categories-title">Categories</h2>

      <div className="sg-category-viewport">
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
      </div>

      {!search && cat === "all" && (
        <HomeSection title="Stores">
          {storesLoading ? (
            <div className="sg-loading">Loading stores…</div>
          ) : stores.length ? (
            <div className="sg-store-row">
              {stores.map((store) => (
                <button
                  type="button"
                  className="sg-store-card"
                  key={store.id}
                  onClick={() => onOpenStore?.(store)}
                >
                  <div className="sg-store-cover" />
                  <div className="sg-store-body">
                    <div className="sg-store-logo">
                      {store.profile_img ? (
                        <img src={store.profile_img} alt={store.shop_name || "Store"} />
                      ) : (
                        <span>{String(store.shop_name || "S").charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="sg-store-name">{store.shop_name || "Store"}</div>
                    <div className="sg-store-meta">{[store.category, store.city].filter(Boolean).join(" · ") || "TokZoo Seller"}</div>
                    <div className="sg-store-footer">
                      <div className="sg-store-stats">
                        <span>★ {Number(store.rating || 0).toFixed(1)}</span>
                        <span>{Number(store.product_count || 0)} items</span>
                      </div>
                      <span className="sg-store-visit">View Store →</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="sg-empty">No seller stores available yet.</div>
          )}
        </HomeSection>
      )}

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
