import { useState } from "react";
import { API, SHOP_CATS, SIZES, SWATCH_COLORS } from "../../data/catalogue.js";
import Btn from "../common/Btn.jsx";
import Field from "../common/Field.jsx";

const fmt = (n) => (n ? `$${Number(n).toLocaleString()}` : "");

export const AddProductModal = ({ onClose, onAdded, onAdd, showToast }) => {
  const [images, setImages] = useState([]); // {file, preview}
  const [uploadingImages, setUploadingImages] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [stock, setStock] = useState("");
  const [brand, setBrand] = useState("");
  const [sku, setSku] = useState("");
  const [weight, setWeight] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");

  const [hasSizes, setHasSizes] = useState(false);
  const [selSizes, setSelSizes] = useState([]);
  const [hasColors, setHasColors] = useState(false);
  const [selColors, setSelColors] = useState([]);
  const [customSize, setCustomSize] = useState("");
  const [customColor, setCustomColor] = useState("#111111");

  const [allowReselling, setAllowReselling] = useState(false);
  const [resellerBasePrice, setResellerBasePrice] = useState("");
  const [minResalePrice, setMinResalePrice] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const addImages = (files) => {
    const remaining = 5 - images.length;
    const picked = Array.from(files).slice(0, remaining);
    const withPreview = picked.map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setImages((prev) => [...prev, ...withPreview]);
  };

  const removeImage = (i) => setImages((prev) => prev.filter((_, idx) => idx !== i));

  const toggleSize = (s) => setSelSizes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  const toggleColor = (c) => setSelColors((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const addCustomSize = () => {
    const value = customSize.trim();
    if (!value) return;
    setHasSizes(true);
    setSelSizes((prev) => prev.some((x) => x.toLowerCase() === value.toLowerCase()) ? prev : [...prev, value]);
    setCustomSize("");
  };

  const addCustomColor = () => {
    setHasColors(true);
    setSelColors((prev) => prev.includes(customColor) ? prev : [...prev, customColor]);
  };

  const submit = async () => {
    setError("");
    if (!title.trim()) return setError("Product title is required");
    if (!price || Number(price) <= 0) return setError("Selling price is required");
    if (!stock || Number(stock) < 0) return setError("Stock is required");
    if (!category) return setError("Please select a category");
    if (!subcategory) return setError("Please select a subcategory");

    if (allowReselling) {
      const base = Number(resellerBasePrice || price);
      const minimum = Number(minResalePrice || resellerBasePrice || price);
      if (!Number.isFinite(base) || base <= 0) return setError("Enter a valid reseller base price");
      if (!Number.isFinite(minimum) || minimum < base) {
        return setError("Minimum resale price cannot be below the reseller base price");
      }
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("shopToken");

      // 1) Upload images first (if any), get back Cloudinary URLs
      let imageUrls = [];
      if (images.length) {
        setUploadingImages(true);
        const fd = new FormData();
        images.forEach((img) => fd.append("images", img.file));
        const upRes = await fetch(`${API}/products/upload-images`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        const upData = await upRes.json();
        if (!upRes.ok) throw new Error(upData.message || "Image upload failed");
        imageUrls = upData.images;
        setUploadingImages(false);
      }

      // 2) Create the product
      const res = await fetch(`${API}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          price: Number(price),
          original_price: originalPrice ? Number(originalPrice) : null,
          category,
          subcategory,
          stock: Number(stock),
          images: imageUrls,
          brand: brand.trim() || null,
          sku: sku.trim() || null,
          weight_grams: weight ? Number(weight) : null,
          sizes: hasSizes ? selSizes : [],
          colors: hasColors ? selColors : [],
          allow_reselling: allowReselling,
          reseller_base_price: allowReselling
            ? Number(resellerBasePrice || price)
            : null,
          min_resale_price: allowReselling
            ? Number(minResalePrice || resellerBasePrice || price)
            : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add product");

      showToast?.("Product submitted for review!");
      onAdded?.(data.product || data);
      onAdd?.(data.product || data);
      onClose?.();
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
    setSaving(false);
    setUploadingImages(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={(e) => { if (e.target === e.currentTarget && !saving) onClose?.(); }}>
      <div style={{ width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", background: "#fff", borderRadius: 16, padding: 24 }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 19, fontWeight: 800, color: "#111" }}>Add New Product</h2>
          <button onClick={() => !saving && onClose?.()} style={{ background: "rgba(0,0,0,0.06)", border: "none", width: 30, height: 30, borderRadius: "50%", cursor: "pointer", fontSize: 16 }}>×</button>
        </div>

        {/* Images */}
        <p style={{ fontSize: 12, fontWeight: 700, color: "#888", letterSpacing: "0.03em", marginBottom: 10 }}>PRODUCT IMAGES (MAX 5)</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22 }}>
          {images.map((img, i) => (
            <div key={i} style={{ position: "relative", width: 76, height: 76, borderRadius: 10, overflow: "hidden", border: "1px solid #eee" }}>
              <img src={img.preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button onClick={() => removeImage(i)} style={{ position: "absolute", top: 3, right: 3, width: 18, height: 18, borderRadius: "50%", background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", fontSize: 11, cursor: "pointer" }}>×</button>
            </div>
          ))}
          {images.length < 5 && (
            <label style={{ width: 76, height: 76, borderRadius: 10, border: "2px dashed #ddd", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 22, color: "#999" }}>
              +
              <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => addImages(e.target.files)} />
            </label>
          )}
        </div>

        <Field label="Product Title" value={title} onChange={setTitle} placeholder="e.g. Aesthetic Oversized Hoodie" />

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, color: "#888", marginBottom: 7, fontWeight: 500 }}>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your product — material, features, care instructions..." rows={3}
            style={{ width: "100%", padding: "12px 14px", background: "#fff", border: "1px solid #222", borderRadius: 10, color: "#111", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", resize: "vertical" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Selling Price ($)" value={price} onChange={setPrice} placeholder="2499" type="number" />
          <Field label="Original Price ($)" value={originalPrice} onChange={setOriginalPrice} placeholder="3500" type="number" req={false} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Stock" value={stock} onChange={setStock} placeholder="100" type="number" />
          <Field label="Brand" value={brand} onChange={setBrand} placeholder="e.g. Nike, Local" req={false} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="SKU / Product Code" value={sku} onChange={setSku} placeholder="e.g. HOD-001" req={false} />
          <Field label="Weight (grams)" value={weight} onChange={setWeight} placeholder="500" type="number" req={false} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, color: "#888", marginBottom: 7, fontWeight: 500 }}>
              <span style={{ color: "#fe2c55", marginRight: 4 }}>*</span>Category
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setSubcategory("");
              }}
              style={{ width: "100%", padding: "12px 14px", background: "#fff", border: "1px solid #222", borderRadius: 10, color: "#111", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
            >
              <option value="">Select category...</option>
              {SHOP_CATS.map((c) => (
                <option key={c.slug} value={c.slug}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, color: "#888", marginBottom: 7, fontWeight: 500 }}>
              <span style={{ color: "#fe2c55", marginRight: 4 }}>*</span>Subcategory
            </label>
            <select
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              disabled={!category}
              style={{ width: "100%", padding: "12px 14px", background: category ? "#fff" : "#f5f5f5", border: "1px solid #222", borderRadius: 10, color: "#111", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
            >
              <option value="">{category ? "Select subcategory..." : "Select category first"}</option>
              {(SHOP_CATS.find((c) => c.slug === category)?.subcategories || []).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sizes — independent, optional */}
        <div style={{ marginBottom: 18, border: "1px solid #eee", borderRadius: 12, padding: 14 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: hasSizes ? 12 : 0 }}>
            <input type="checkbox" checked={hasSizes} onChange={(e) => setHasSizes(e.target.checked)} style={{ width: 16, height: 16, accentColor: "#fe2c55" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>This product has sizes</span>
          </label>
          {hasSizes && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(SIZES || ["XS", "S", "M", "L", "XL", "XXL"]).map((s) => (
                <button key={s} type="button" onClick={() => toggleSize(s)}
                  style={{ padding: "8px 14px", borderRadius: 8, border: `2px solid ${selSizes.includes(s) ? "#fe2c55" : "#eee"}`, background: selSizes.includes(s) ? "rgba(254,44,85,0.06)" : "#fff", color: selSizes.includes(s) ? "#fe2c55" : "#555", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>
                  {s}
                </button>
              ))}
              <div style={{ width:"100%", display:"flex", gap:8, marginTop:10 }}>
                <input value={customSize} onChange={(e)=>setCustomSize(e.target.value)} onKeyDown={(e)=>{if(e.key==="Enter"){e.preventDefault();addCustomSize();}}} placeholder="Custom size e.g. 42, Free Size"
                  style={{ flex:1, minWidth:0, padding:"10px 12px", border:"1px solid #ddd", borderRadius:8, fontFamily:"inherit", fontSize:13 }} />
                <button type="button" onClick={addCustomSize}
                  style={{ padding:"10px 14px", border:"none", borderRadius:8, background:"#111", color:"#fff", fontWeight:700, cursor:"pointer" }}>+ Add Size</button>
              </div>
              {selSizes.length>0&&<div style={{width:"100%",display:"flex",gap:6,flexWrap:"wrap",marginTop:10}}>
                {selSizes.map(s=><span key={`chosen-${s}`} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"6px 9px",borderRadius:100,background:"#f4f4f4",fontSize:12}}>{s}<button type="button" onClick={()=>setSelSizes(prev=>prev.filter(x=>x!==s))} style={{border:"none",background:"none",cursor:"pointer",fontWeight:800}}>×</button></span>)}
              </div>}
            </div>
          )}
        </div>

        {/* Colors — independent, optional */}
        <div style={{ marginBottom: 22, border: "1px solid #eee", borderRadius: 12, padding: 14 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: hasColors ? 12 : 0 }}>
            <input type="checkbox" checked={hasColors} onChange={(e) => setHasColors(e.target.checked)} style={{ width: 16, height: 16, accentColor: "#fe2c55" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>This product has colors</span>
          </label>
          {hasColors && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {(SWATCH_COLORS || ["#000000", "#ffffff", "#fe2c55", "#3b82f6", "#10b981"]).map((c) => (
                <button key={c} type="button" onClick={() => toggleColor(c)}
                  style={{ width: 36, height: 36, borderRadius: "50%", background: c, border: `3px solid ${selColors.includes(c) ? "#fe2c55" : "#eee"}`, cursor: "pointer", boxShadow: c === "#ffffff" ? "inset 0 0 0 1px #ddd" : "none" }} />
              ))}
              <div style={{ width:"100%", display:"flex", alignItems:"center", gap:8, marginTop:10 }}>
                <input type="color" value={customColor} onChange={(e)=>setCustomColor(e.target.value)}
                  style={{ width:48, height:40, padding:2, border:"1px solid #ddd", borderRadius:8, background:"#fff", cursor:"pointer" }} />
                <input value={customColor} onChange={(e)=>/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)&&setCustomColor(e.target.value)}
                  style={{ flex:1, minWidth:0, padding:"10px 12px", border:"1px solid #ddd", borderRadius:8, fontFamily:"monospace", fontSize:13 }} />
                <button type="button" onClick={addCustomColor}
                  style={{ padding:"10px 14px", border:"none", borderRadius:8, background:"#111", color:"#fff", fontWeight:700, cursor:"pointer" }}>+ Add Color</button>
              </div>
              {selColors.length>0&&<div style={{width:"100%",display:"flex",gap:8,flexWrap:"wrap",marginTop:10}}>
                {selColors.map(c=><span key={`chosen-${c}`} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"5px 8px",borderRadius:100,background:"#f4f4f4",fontSize:11}}><span style={{width:14,height:14,borderRadius:"50%",background:c,border:"1px solid #ccc"}}/>{c}<button type="button" onClick={()=>setSelColors(prev=>prev.filter(x=>x!==c))} style={{border:"none",background:"none",cursor:"pointer",fontWeight:800}}>×</button></span>)}
              </div>}
            </div>
          )}
        </div>


        {/* Reseller settings */}
        <div style={{ marginBottom: 22, border: "1px solid #eee", borderRadius: 12, padding: 14 }}>
          <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, cursor: "pointer" }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>Allow Reselling</p>
              <p style={{ fontSize: 11.5, color: "#777", marginTop: 3 }}>
                Let other TokZoo sellers add this product to their stores. You keep control of the real stock.
              </p>
            </div>
            <input
              type="checkbox"
              checked={allowReselling}
              onChange={(e) => {
                const checked = e.target.checked;
                setAllowReselling(checked);
                if (checked && !resellerBasePrice) setResellerBasePrice(price || "");
                if (checked && !minResalePrice) setMinResalePrice(price || "");
              }}
              style={{ width: 18, height: 18, accentColor: "#fe2c55", flexShrink: 0 }}
            />
          </label>

          {allowReselling && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field
                  label="Supplier / Base Price ($)"
                  value={resellerBasePrice}
                  onChange={setResellerBasePrice}
                  placeholder={price || "20"}
                  type="number"
                />
                <Field
                  label="Minimum Resale Price ($)"
                  value={minResalePrice}
                  onChange={setMinResalePrice}
                  placeholder={resellerBasePrice || price || "20"}
                  type="number"
                />
              </div>

              <p style={{ fontSize: 11.5, color: "#777", lineHeight: 1.6 }}>
                Example: base price $20 and reseller sells for $28 → reseller gross margin is $8 before any future platform fee.
              </p>
            </div>
          )}
        </div>

        {/* Preview */}
        {title && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#fafafa", border: "1px solid #eee", borderRadius: 10, padding: 12, marginBottom: 18 }}>
            <div style={{ width: 44, height: 44, borderRadius: 8, overflow: "hidden", background: "#eee", flexShrink: 0 }}>
              {images[0] && <img src={images[0].preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</p>
              <p style={{ fontSize: 12.5, color: "#fe2c55", fontWeight: 700 }}>{fmt(price) || "Product preview"}</p>
            </div>
          </div>
        )}

        {error && <p style={{ color: "#fe2c55", fontSize: 12.5, marginBottom: 14 }}>{error}</p>}

        <div style={{ display: "flex", gap: 10 }}>
          <Btn full loading={saving} onClick={submit}>
            {uploadingImages ? "Uploading images..." : saving ? "Adding..." : "Add Product"}
          </Btn>
          <button onClick={() => !saving && onClose?.()} style={{ padding: "0 24px", background: "#fff", border: "1px solid #ddd", borderRadius: 100, color: "#555", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
