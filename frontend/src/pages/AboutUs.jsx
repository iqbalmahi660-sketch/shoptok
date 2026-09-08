// Theme colors (matching the rest of tiktokshop — replaces the undefined CSS vars
// var(--ink)/var(--pink)/var(--cyan)/var(--grey)/var(--paper)/var(--line))
const C = {
  ink: "#111111",
  pink: "#fe2c55",
  cyan: "#25f4ee",
  grey: "rgba(0,0,0,0.5)",
  paper: "#ffffff",
  line: "rgba(0,0,0,0.1)",
};

export default function AboutUs({ setPage }) {
  const go = (p) => { setPage(p); window.scrollTo(0, 0); };

  return (
    <div style={{ background: "#fff" }}>
      <header className="hero" style={{ padding: "96px 0 72px" }}>
        <div className="wrap" style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.pink, fontWeight: 600, marginBottom: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.pink, display: "inline-block" }}></span> About ShopTok
          </div>
          <h1 style={{ fontSize: "clamp(40px, 6vw, 76px)", lineHeight: 0.98, maxWidth: 900, fontFamily: "'TikTok Sans',sans-serif", fontWeight: 800, color: C.ink }}>
            Where entertainment<br />meets commerce.
          </h1>
          <p style={{ fontSize: 19, color: C.grey, maxWidth: 560, marginTop: 28, lineHeight: 1.6 }}>
            We built a marketplace inside the feed — so discovering a product feels as natural as discovering your next favourite video.
          </p>
          <div style={{ display: "flex", gap: 14, marginTop: 36 }}>
            <button onClick={() => go("shop")} style={{ background: C.pink, color: "#fff", border: "none", padding: "14px 26px", borderRadius: 999, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 14 }}>Explore the Shop</button>
            <button onClick={() => go("seller")} style={{ background: "transparent", border: `1.5px solid ${C.ink}`, padding: "14px 26px", borderRadius: 999, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", fontSize: 14 }}>
              Become a Seller
            </button>
          </div>
        </div>
      </header>

      <section style={{ background: C.ink, color: "#fff", borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }}>
        <div className="wrap" style={{ maxWidth: 1120, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", padding: "40px 32px" }}>
          {[
            { num: "2024", label: "Launched in Pakistan", color: C.cyan },
            { num: "10K+", label: "Local sellers onboarded", color: "#fff" },
            { num: "500K+", label: "Shoppable videos & LIVEs", color: C.pink },
            { num: "24/7", label: "Buyer protection coverage", color: "#fff" },
          ].map((s, i) => (
            <div key={s.label} style={{ padding: "0 20px", borderLeft: i === 0 ? "none" : "1px solid rgba(255,255,255,0.14)" }}>
              <div style={{ fontFamily: "'TikTok Sans',sans-serif", fontWeight: 800, fontSize: 34, color: s.color }}>{s.num}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "112px 0" }}>
        <div className="wrap" style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 64 }}>
          <div>
            <div style={{ fontSize: 14, color: C.pink, fontWeight: 600, marginBottom: 18 }}>Our Story</div>
            <h2 style={{ fontSize: "clamp(30px,4vw,44px)", lineHeight: 1.08, fontFamily: "'TikTok Sans',sans-serif", fontWeight: 800, color: C.ink }}>
              Shopping used to be a task.<br />We made it a scroll.
            </h2>
          </div>
          <div>
            <p style={{ fontSize: 17, lineHeight: 1.75, color: "#2A2A2A", maxWidth: "52ch", marginBottom: 20 }}>
              ShopTok started with a simple observation: people were already discovering products in their feed — through a creator's honest review, a livestream demo, a video that stopped the scroll. The checkout was just missing.
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.75, color: "#2A2A2A", maxWidth: "52ch", marginBottom: 20 }}>
              So we brought commerce into the same space as content. No leaving the app, no separate cart, no cold product pages. Just a shopping cart that lives inside the videos, LIVEs, and Showcase pages you already spend time in.
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.75, color: "#2A2A2A", maxWidth: "52ch" }}>
              Today, we work with home-grown brands, independent sellers, and creators across Pakistan to turn everyday scrolling into a place where small businesses genuinely grow.
            </p>
          </div>
        </div>
      </section>

      <section style={{ padding: "0 0 112px" }}>
        <div className="wrap" style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ maxWidth: 600, marginBottom: 56 }}>
            <h2 style={{ fontSize: "clamp(28px,4vw,40px)", fontFamily: "'TikTok Sans',sans-serif", fontWeight: 800, color: C.ink }}>Three things we're building, all at once.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: C.line, border: `1px solid ${C.line}` }}>
            {[
              { icon: "🔎", title: "Discovery", body: "Interest-based recommendations surface products shoppers didn't know they were looking for — no search bar required.", bg: "rgba(37,244,238,0.18)" },
              { icon: "🎥", title: "Shoppertainment", body: "Shoppable videos and LIVE sessions let sellers demo, explain, and sell in real time, with the cart just one tap away.", bg: "rgba(254,44,85,0.14)" },
              { icon: "🏪", title: "Seller growth", body: "Tools, logistics support, and creator partnerships built specifically to help Pakistan's small businesses scale.", bg: "rgba(10,10,10,0.06)" },
            ].map((p) => (
              <div key={p.title} style={{ background: C.paper, padding: "44px 34px" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28, fontSize: 20, background: p.bg }}>{p.icon}</div>
                <h3 style={{ fontSize: 21, marginBottom: 12, fontFamily: "'TikTok Sans',sans-serif", fontWeight: 700, color: C.ink }}>{p.title}</h3>
                <p style={{ fontSize: 15, color: C.grey, lineHeight: 1.65, margin: 0 }}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: `linear-gradient(100deg, ${C.ink} 0%, #171717 100%)`, color: "#fff", padding: "96px 0" }}>
        <div className="wrap" style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 60, alignItems: "center" }}>
          <div>
            <span style={{ display: "inline-block", fontSize: 13, fontWeight: 600, padding: "6px 14px", borderRadius: 999, background: "rgba(37,244,238,0.14)", color: C.cyan, marginBottom: 20 }}>
              For Creators & Sellers
            </span>
            <h2 style={{ fontSize: "clamp(28px,4vw,42px)", color: "#fff", lineHeight: 1.1, fontFamily: "'TikTok Sans',sans-serif", fontWeight: 800 }}>
              Every LIVE has a story. Every viewer makes it better.
            </h2>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 16, lineHeight: 1.7, marginTop: 20, maxWidth: "46ch" }}>
              Creators bring products to life through unboxings, tutorials, and real conversation. Sellers get direct access to an audience that's already watching, already engaged, already ready to buy.
            </p>
          </div>
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: 28 }}>
            {[
              ["LIVE now", "Skincare routine w/ @glowskin_pk"],
              ["Viewers", "3,204 watching"],
              ["Cart adds", "+186 in last 10 min"],
              ["Sellers featured", "4 local brands"],
            ].map((row, i) => (
              <div key={row[0]} style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", borderBottom: i === 3 ? "none" : "1px solid rgba(255,255,255,0.08)", fontSize: 14 }}>
                <span style={{ color: "rgba(255,255,255,0.55)" }}>{row[0]}</span>
                <span style={{ fontWeight: 600 }}>{row[1]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "112px 0" }}>
        <div className="wrap" style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ maxWidth: 640, marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(28px,4vw,40px)", fontFamily: "'TikTok Sans',sans-serif", fontWeight: 800, color: C.ink }}>Built on trust, not just transactions.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "1px 48px" }}>
            {[
              ["01", "Verified sellers", "Every merchant goes through identity and business verification before listing a single product."],
              ["02", "Buyer protection", "Guaranteed refunds on items that arrive damaged, wrong, or not as described."],
              ["03", "Local logistics", "Partnered fulfilment across Pakistan for faster, trackable delivery on every order."],
              ["04", "Community standards", "Product listings and LIVE content are reviewed against clear, consistently enforced policies."],
            ].map(([num, title, body]) => (
              <div key={num} style={{ display: "flex", gap: 18, padding: "26px 0", borderTop: `1px solid ${C.line}` }}>
                <div style={{ fontFamily: "'TikTok Sans',sans-serif", fontWeight: 700, fontSize: 15, color: C.pink, minWidth: 28 }}>{num}</div>
                <div>
                  <h4 style={{ fontSize: 16, margin: "0 0 6px", color: C.ink }}>{title}</h4>
                  <p style={{ fontSize: "14.5px", color: C.grey, margin: 0, lineHeight: 1.6 }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: C.ink, color: "#fff", padding: "88px 0", textAlign: "center" }}>
        <div className="wrap" style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px" }}>
          <h2 style={{ fontSize: "clamp(30px,5vw,50px)", color: "#fff", lineHeight: 1.06, fontFamily: "'TikTok Sans',sans-serif", fontWeight: 800 }}>Ready to be part of the feed?</h2>
          <p style={{ color: "rgba(255,255,255,0.6)", marginTop: 18, fontSize: 16 }}>
            Whether you're browsing, creating, or building a brand — there's a place for you here.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 36 }}>
            <button onClick={() => go("shop")} style={{ background: C.cyan, color: C.ink, border: "none", padding: "14px 26px", borderRadius: 999, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 14 }}>Shop Now</button>
            <button onClick={() => go("seller")} style={{ background: "transparent", border: "1.5px solid rgba(255,255,255,0.4)", color: "#fff", padding: "14px 26px", borderRadius: 999, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 14 }}>Sign Up to Sell</button>
          </div>
        </div>
      </section>
    </div>
  );
}
