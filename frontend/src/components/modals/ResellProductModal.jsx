import { useEffect, useState } from "react";
import { API } from "../../data/catalogue.js";

export const ResellProductModal = ({ product, listing, onClose, onSaved }) => {
  const isEdit = !!listing;
  const source = product || listing || {};
  const supplierPrice = Number(source.supplier_price || source.reseller_base_price || source.price || 0);
  const minimumPrice = Math.max(
    supplierPrice,
    Number(source.minimum_listing_price || source.min_resale_price || 0)
  );

  const [price, setPrice] = useState(
    String(
      isEdit
        ? Number(listing.selling_price || 0)
        : Math.max(minimumPrice, Number(source.price || minimumPrice))
    )
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit) setPrice(String(Number(listing.selling_price || 0)));
  }, [isEdit, listing?.id]);

  const save = async () => {
    setError("");
    const n = Number(price);

    if (!Number.isFinite(n) || n < minimumPrice) {
      setError(`Selling price must be at least $${minimumPrice.toFixed(2)}`);
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("shopToken");

      const url = isEdit
        ? `${API}/products/reseller-listings/${listing.id}`
        : `${API}/products/reseller-listings`;

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(
          isEdit
            ? { selling_price: n }
            : { product_id: product.id, selling_price: n }
        ),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Could not save reseller listing");
      }

      onSaved?.(data.listing);
      onClose?.();
    } catch (err) {
      setError(err.message || "Could not save reseller listing");
    } finally {
      setSaving(false);
    }
  };

  const profit = Math.max(0, Number(price || 0) - supplierPrice);
  const img =
    Array.isArray(source.images) && source.images.length
      ? source.images[0]
      : source.img || null;

  return (
    <>
      <div
        onClick={() => !saving && onClose?.()}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.68)",
          backdropFilter: "blur(7px)",
          zIndex: 700,
        }}
      />

      <div
        style={{
          position: "fixed",
          left: "50%",
          top: "50%",
          transform: "translate(-50%,-50%)",
          width: "min(480px,94vw)",
          maxHeight: "90vh",
          overflowY: "auto",
          zIndex: 701,
          background: "#fff",
          borderRadius: 18,
          border: "1px solid #e8e8e8",
          boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
        }}
      >
        <div
          style={{
            padding: "18px 20px",
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 800 }}>
              {isEdit ? "Edit Reseller Price" : "Add to My Store"}
            </h3>
            <p style={{ fontSize: 11.5, color: "#777", marginTop: 3 }}>
              Stock remains controlled by the original supplier.
            </p>
          </div>

          <button
            onClick={() => !saving && onClose?.()}
            style={{
              width: 32,
              height: 32,
              border: "none",
              borderRadius: "50%",
              background: "#f2f2f2",
              cursor: "pointer",
              fontSize: 18,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: 20 }}>
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              padding: 12,
              background: "#fafafa",
              border: "1px solid #eee",
              borderRadius: 12,
              marginBottom: 18,
            }}
          >
            <div
              style={{
                width: 62,
                height: 62,
                borderRadius: 10,
                overflow: "hidden",
                background: "#eee",
                flexShrink: 0,
              }}
            >
              {img ? (
                <img
                  src={img}
                  alt={source.title || "Product"}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : null}
            </div>

            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  fontSize: 13.5,
                  fontWeight: 700,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {source.title}
              </p>
              <p style={{ fontSize: 11.5, color: "#666", marginTop: 4 }}>
                Supplier: {source.supplier_name || "Original seller"}
              </p>
              <p style={{ fontSize: 11.5, color: "#666", marginTop: 2 }}>
                Available stock: {Number(source.stock || 0)}
              </p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                background: "#fafafa",
                border: "1px solid #eee",
                borderRadius: 10,
                padding: 12,
              }}
            >
              <p style={{ fontSize: 10.5, color: "#777" }}>SUPPLIER PRICE</p>
              <p style={{ fontSize: 16, fontWeight: 800, marginTop: 4 }}>
                ${supplierPrice.toFixed(2)}
              </p>
            </div>

            <div
              style={{
                background: "#fafafa",
                border: "1px solid #eee",
                borderRadius: 10,
                padding: 12,
              }}
            >
              <p style={{ fontSize: 10.5, color: "#777" }}>MINIMUM LISTING</p>
              <p style={{ fontSize: 16, fontWeight: 800, marginTop: 4 }}>
                ${minimumPrice.toFixed(2)}
              </p>
            </div>
          </div>

          <label
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 7,
            }}
          >
            My Selling Price ($)
          </label>

          <input
            type="number"
            min={minimumPrice}
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            style={{
              width: "100%",
              border: "1px solid #222",
              borderRadius: 10,
              padding: "12px 14px",
              fontFamily: "inherit",
              fontSize: 14,
              outline: "none",
            }}
          />

          <div
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 10,
              background: "rgba(52,211,153,0.08)",
              border: "1px solid rgba(52,211,153,0.2)",
            }}
          >
            <p style={{ fontSize: 12.5, color: "#198754", fontWeight: 700 }}>
              Gross profit per unit: ${profit.toFixed(2)}
            </p>
            <p style={{ fontSize: 10.5, color: "#777", marginTop: 3 }}>
              Platform fee is currently $0 in this implementation.
            </p>
          </div>

          {error ? (
            <p style={{ color: "#fe2c55", fontSize: 12, marginTop: 12 }}>
              {error}
            </p>
          ) : null}

          <button
            disabled={saving}
            onClick={save}
            style={{
              width: "100%",
              marginTop: 18,
              border: "none",
              borderRadius: 100,
              padding: "12px 16px",
              background: "linear-gradient(135deg,#fe2c55,#ff6b35)",
              color: "#fff",
              fontFamily: "inherit",
              fontWeight: 800,
              cursor: saving ? "default" : "pointer",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving
              ? "Saving..."
              : isEdit
              ? "Save Price"
              : "Add to My Store"}
          </button>
        </div>
      </div>
    </>
  );
};

export default ResellProductModal;
