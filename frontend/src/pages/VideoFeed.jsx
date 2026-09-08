import { useState, useEffect, useRef } from "react";
import { API, VIDS } from "../data/catalogue.js";

// ─── VIDEO FEED (TikTok-style vertical scroll) ────────────────────────────────
export default function VideoFeed({ products, onOpen, onAdd, likedV, toggleLV, setPage, showToast }) {
  const [vids, setVids] = useState(VIDS);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/videos?limit=50`)
      .then((r) => r.json())
      .then((d) => {
        if (d.videos && d.videos.length) {
          setVids(d.videos.map((v) => ({
            id: v.id,
            creator: v.shop_name || v.creator || "seller",
            img: v.thumbnail_url || null,
            videoUrl: v.video_url,
            title: v.title || v.caption || "",
            likes: Number(v.likes) || 0,
            comments: Number(v.comments) || 0,
            views: v.views || "0",
            prodId: v.product_id || null,
            tags: v.hashtags || [],
            bg: "linear-gradient(135deg,#1a0a1e,#2d1b33)",
          })));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const findProduct = (v) => {
    if (v.prodId) return products.find((p) => p.id === v.prodId);
    if (v.prods && v.prods.length) return products.find((p) => v.prods.includes(p.id)) || products[0];
    return null;
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000", zIndex: 130 }}>
      <button
        onClick={() => { setPage("shop"); window.scrollTo(0, 0); }}
        style={{ position: "absolute", top: 16, left: 16, zIndex: 10, width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,0.5)", border: "none", color: "#fff", cursor: "pointer", fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center" }}
      >←</button>

      <div
        ref={containerRef}
        style={{ height: "100vh", overflowY: "auto", scrollSnapType: "y mandatory" }}
        className="hscroll"
      >
        {loading ? (
          <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>Loading videos…</div>
        ) : vids.length === 0 ? (
          <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.5)", gap: 10 }}>
            <p style={{ fontSize: 40 }}>🎥</p>
            <p>No videos yet</p>
          </div>
        ) : (
          vids.map((v) => {
            const p = findProduct(v);
            return (
              <div key={v.id} style={{ height: "100vh", scrollSnapAlign: "start", position: "relative", display: "flex", alignItems: "flex-end", background: v.bg || "#111" }}>
                {v.videoUrl ? (
                  <video src={v.videoUrl} autoPlay loop muted playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                ) : v.img ? (
                  <img src={v.img} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                ) : null}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.1) 40%, transparent 70%)" }} />

                {/* Right-side action rail */}
                <div style={{ position: "absolute", right: 12, bottom: 90, display: "flex", flexDirection: "column", gap: 22, alignItems: "center" }}>
                  <button onClick={() => toggleLV(v.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 26, color: likedV.has(v.id) ? "#fe2c55" : "#fff" }}>{likedV.has(v.id) ? "♥" : "♡"}</span>
                    <span style={{ fontSize: 11, color: "#fff" }}>{(v.likes || 0).toLocaleString()}</span>
                  </button>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 24, color: "#fff" }}>💬</span>
                    <span style={{ fontSize: 11, color: "#fff" }}>{(v.comments || 0).toLocaleString()}</span>
                  </div>
                  {p && (
                    <button onClick={() => onOpen(p)} style={{ background: "#fff", border: "none", width: 40, height: 40, borderRadius: 10, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>🛍️</button>
                  )}
                </div>

                {/* Bottom info */}
                <div style={{ position: "relative", padding: "0 16px 24px", maxWidth: "78%", color: "#fff" }}>
                  <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>@{v.creator}</p>
                  <p style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 8 }}>{v.title}</p>
                  {v.tags?.length > 0 && (
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginBottom: 10 }}>{v.tags.map((t) => `#${t}`).join(" ")}</p>
                  )}
                  {p && (
                    <div onClick={() => onOpen(p)} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", borderRadius: 12, padding: "8px 12px", cursor: "pointer", maxWidth: 260 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(254,44,85,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{p.emoji || "🛍️"}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</p>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "#fe2c55" }}>Rs {Number(p.price).toLocaleString()}</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); onAdd(p); showToast?.(`${p.emoji || ""} Added to cart!`); }} style={{ background: "#fe2c55", border: "none", width: 26, height: 26, borderRadius: "50%", color: "#fff", cursor: "pointer", fontSize: 14, flexShrink: 0 }}>+</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
