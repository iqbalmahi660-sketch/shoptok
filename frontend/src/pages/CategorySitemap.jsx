import { CATEGORY_TREE } from "../data/catalogue.js";

export const CategorySitemap = ({
  setPage,
  setCat,
  setSubcat,
}) => {
  const openCategory = (slug, subcategory = "all") => {
    setCat(slug);
    setSubcat?.(subcategory);
    setPage("shop");
    window.scrollTo(0, 0);
  };

  const backToShop = () => {
    setCat("all");
    setSubcat?.("all");
    setPage("shop");
    window.scrollTo(0, 0);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        paddingBottom: 80,
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "36px 24px 0",
        }}
      >
        <button
          type="button"
          onClick={backToShop}
          style={{
            background: "none",
            border: "none",
            color: "rgba(0,0,0,0.5)",
            cursor: "pointer",
            fontSize: 13,
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "inherit",
          }}
        >
          ← Back to Home
        </button>

        <h1
          style={{
            fontFamily: "'TikTok Sans',sans-serif",
            fontWeight: 800,
            fontSize: 26,
            marginBottom: 34,
          }}
        >
          Categories
        </h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "34px 28px",
          }}
        >
          {CATEGORY_TREE.map((category) => (
            <div key={category.slug}>
              <button
                type="button"
                onClick={() => openCategory(category.slug, "all")}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  fontFamily: "'TikTok Sans',sans-serif",
                  fontWeight: 700,
                  fontSize: 15,
                  color: "#111",
                  marginBottom: 12,
                  textAlign: "left",
                }}
              >
                {category.label}
              </button>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {(category.subcategories || []).map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => openCategory(category.slug, sub)}
                    style={{
                      width: "fit-content",
                      background: "none",
                      border: "none",
                      padding: 0,
                      fontSize: 13,
                      color: "rgba(0,0,0,0.55)",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#fe2c55";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "rgba(0,0,0,0.55)";
                    }}
                  >
                    {sub}
                  </button>
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
