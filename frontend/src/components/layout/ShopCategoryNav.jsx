import { CATS, CATEGORY_ICONS } from "../../data/catalogue.js";

// Marketplace-style category list for the shop left sidebar — mirrors the
// icon strip on the homepage so switching category works from either place.
export const ShopCategoryNav = ({ cat = "all", setCat }) => (
  <div className="shop-sidebar-cats">
    <p className="shop-sidebar-cats-title">Categories</p>
    <div className="shop-sidebar-cats-list">
      {CATS.map((c) => (
        <button
          key={c.s}
          type="button"
          className={`shop-sidebar-cat ${cat === c.s ? "active" : ""}`}
          onClick={() => setCat(c.s)}
        >
          <span className="shop-sidebar-cat-icon">{c.s === "all" ? "🛍️" : CATEGORY_ICONS[c.s] || "•"}</span>
          <span className="shop-sidebar-cat-label">{c.l}</span>
        </button>
      ))}
    </div>
  </div>
);

export default ShopCategoryNav;
