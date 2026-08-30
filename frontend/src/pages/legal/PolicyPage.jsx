import { useState, useEffect, useRef } from "react";

// ─── NAV STRUCTURE (grouped sidebar, TikTok-Shop-style help center) ───────────
const NAV_GROUPS = [
  {
    label: "Company",
    items: [{ key: "about", label: "About Us" }],
  },
  {
    label: "Customer Support",
    items: [
      { key: "track-order", label: "Track Your Order" },
      { key: "return-refund", label: "Return & Refund" },
      { key: "delivery-info", label: "Delivery Information" },
      { key: "seller-guide", label: "Seller Guide" },
    ],
  },
  {
    label: "Legal",
    items: [
      { key: "legal", label: "Legal" },
      { key: "privacy-policy", label: "Privacy Policy" },
      { key: "terms-of-service", label: "Terms of Service" },
    ],
  },
];

// ─── LEGAL HUB CARDS ────────────────────────────────────────────────────────
const LEGAL_DOCS = [
  { key: "privacy-policy", title: "Privacy Policy", desc: "How we collect, use, and protect your personal information." },
  { key: "terms-of-service", title: "Terms of Service", desc: "The rules for buying, selling, and using the ShopTok platform." },
];

// ─── ABOUT US CONTENT (original — ShopTok) ─────────────────────────────────────
const ABOUT = {
  title: "About ShopTok",
  tagline: "Pakistan's shoppable video marketplace — where discovery meets delivery.",
  stats: [
    { v: "10,000+", l: "Active Sellers" },
    { v: "500K+", l: "Products Listed" },
    { v: "60+", l: "Cities Served" },
    { v: "4.7★", l: "Average Rating" },
  ],
  story: "ShopTok started with a simple idea: shopping should feel as effortless and entertaining as scrolling through your favourite videos. We connect local sellers across Pakistan directly with buyers through short-form video, live selling, and a fast, reliable checkout — all in one app. From home-based boutiques in Lahore to electronics resellers in Karachi, ShopTok gives every seller the tools to reach buyers nationwide, and gives every buyer a shopping experience built on trust, speed, and genuine product discovery.",
  values: [
    { h: "Trust & Safety", d: "Every seller is verified before they can list. Every order is protected by our buyer guarantee." },
    { h: "Fast, Local Delivery", d: "Nationwide courier network with Cash on Delivery, so getting your order is always simple." },
    { h: "Fair for Sellers", d: "Transparent commission, weekly payouts, and tools built to help small businesses grow." },
    { h: "Real Discovery", d: "Video-first browsing means you find products the way people actually shop — through stories, not static lists." },
  ],
};

export const PolicyPage = ({ page, setPage }) => {
  const pages = {
    "track-order": {
      title: " Track Your Order",
      icon: "",
      sections: [
        { h: "How to Track", body: "1. Go to 'My Account' → 'My Orders'\n2. Click on your order\n3. View real-time delivery status\n4. You'll receive SMS/email updates at each stage" },
        { h: "Order Statuses", body: "• Pending — Order placed, waiting confirmation\n• Confirmed — Seller has accepted your order\n• Processing — Order is being prepared\n• Shipped — On its way to you\n• Delivered — Successfully received\n• Cancelled — Order was cancelled" },
        { h: "Delivery Timeline", body: "Standard: 2-5 business days\nExpress: 1-2 business days (selected cities)\nRemote areas: 5-7 business days" },
        { h: "Need Help?", body: "Contact us: support@shoptok.pk\nWhatsApp: 0311-SHOPTOK\nHours: Mon-Sat 9am-9pm" },
      ],
    },
    "return-refund": {
      title: "↩ Return & Refund Policy",
      icon: "↩",
      sections: [
        { h: "Return Policy", body: "We offer a 7-day return policy from the date of delivery. Items must be:\n• Unused and in original condition\n• In original packaging with tags\n• Accompanied by proof of purchase" },
        { h: "Non-Returnable Items", body: "• Perishable goods (food, flowers)\n• Intimate or sanitary goods\n• Digital products or downloads\n• Customized/personalized items" },
        { h: "Refund Process", body: "1. Request return within 7 days\n2. We'll arrange pickup within 2 business days\n3. Quality check upon receipt (1-2 days)\n4. Refund processed within 5-7 business days\n5. Amount credited to original payment method" },
        { h: "Partial Refunds", body: "Partial refunds may be granted for:\n• Items not in original condition\n• Missing parts for reasons not due to our error\n• Items returned more than 7 days after delivery" },
        { h: "Contact Us", body: "Email: returns@shoptok.pk\nWhatsApp: 0311-SHOPTOK\nInclude order number and reason for return" },
      ],
    },
    "delivery-info": {
      title: " Delivery Information",
      icon: "",
      sections: [
        { h: "Delivery Areas", body: "We deliver to all major cities and towns across Pakistan including:\nKarachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta, Sialkot, Gujranwala and 200+ more cities" },
        { h: "Delivery Timeframes", body: "• Major cities: 2-3 business days\n• Other cities: 3-5 business days\n• Remote areas: 5-7 business days\n• Express delivery: Next day (select cities)" },
        { h: "Delivery Charges", body: "• Free delivery on orders above Rs 1,000\n• Standard delivery: Rs 150\n• Express delivery: Rs 300\n• Same-day delivery (Karachi/Lahore): Rs 500" },
        { h: "Payment on Delivery", body: "Cash on Delivery (COD) is available across Pakistan. Pay when you receive your order. No advance payment required for COD orders." },
        { h: "Order Tracking", body: "Track your order in real-time through:\n• My Account → My Orders\n• SMS updates to registered number\n• Email notifications at each stage" },
        { h: "Failed Delivery", body: "If delivery fails:\n1. Courier will attempt re-delivery next day\n2. After 3 attempts, order returned to seller\n3. Contact us within 24 hours to reschedule" },
      ],
    },
    "seller-guide": {
      title: " Seller Guide",
      icon: "",
      sections: [
        { h: "Getting Started", body: "1. Register for a ShopTok account\n2. Go to 'Sell on ShopTok' in menu\n3. Complete seller verification (CNIC + bank details)\n4. Set up your store profile\n5. Start listing products!" },
        { h: "Seller Requirements", body: "• Valid CNIC (Pakistani ID)\n• Active bank account\n• Pakistani phone number\n• Valid business address\n• Agreement to Seller Terms of Service" },
        { h: "Listing Products", body: "• Add clear product photos (min 3 photos)\n• Write detailed product descriptions\n• Set competitive prices\n• Keep stock levels updated\n• Add relevant categories and tags" },
        { h: "Commission & Fees", body: "• Platform commission: 8% per sale\n• Payment processing: 2%\n• No listing fees\n• No monthly charges\n• Payouts every Monday via bank transfer" },
        { h: "Order Management", body: "• You'll receive notifications for new orders\n• Confirm orders within 24 hours\n• Pack and dispatch within 48 hours\n• Update tracking information promptly\n• Maintain 90%+ on-time delivery rate" },
        { h: "Seller Performance", body: "Your seller rating depends on:\n• Customer reviews and ratings\n• On-time delivery rate\n• Order cancellation rate\n• Response time to customer queries\n• Product quality and accuracy" },
        { h: "Payouts", body: "Earnings are paid every Monday for previous week's delivered orders. Minimum payout: Rs 500. Bank transfer only. Processing time: 1-2 business days." },
      ],
    },
    "privacy-policy": {
      title: " Privacy Policy",
      icon: "",
      sections: [
        { h: "Information We Collect", body: "• Personal information (name, email, phone, address)\n• Payment information (encrypted, never stored in full)\n• Device information and IP address\n• Browsing and purchase history on ShopTok\n• Communications with our support team" },
        { h: "How We Use Your Information", body: "• To process and fulfill your orders\n• To send order updates and notifications\n• To improve our platform and services\n• To prevent fraud and ensure security\n• To personalize your shopping experience\n• To comply with legal obligations" },
        { h: "Data Sharing", body: "We NEVER sell your personal data. We may share with:\n• Delivery partners (for order fulfillment only)\n• Payment processors (encrypted data only)\n• Legal authorities (when required by law)\n• All third parties are bound by strict NDAs" },
        { h: "Data Security", body: "• 256-bit SSL encryption for all transactions\n• Regular security audits and penetration testing\n• Two-factor authentication available\n• PCI-DSS compliant payment processing\n• Data stored in secure, certified data centers" },
        { h: "Your Rights", body: "You have the right to:\n• Access your personal data\n• Correct inaccurate information\n• Delete your account and data\n• Opt-out of marketing communications\n• Data portability\n\nContact: privacy@shoptok.pk" },
        { h: "Cookies", body: "We use cookies to:\n• Keep you logged in\n• Remember your preferences\n• Analyze site traffic\n• Improve user experience\nYou can control cookies in your browser settings." },
        { h: "Updates to This Policy", body: "We may update this policy periodically. We'll notify you via email or app notification. Continued use of ShopTok after changes means you accept the updated policy." },
      ],
    },
    "terms-of-service": {
      title: " Terms of Service",
      icon: "",
      sections: [
        { h: "Acceptance of Terms", body: "By accessing or using ShopTok, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform." },
        { h: "User Accounts", body: "• You must be 18+ to create an account\n• Provide accurate and complete information\n• Keep your account credentials secure\n• You are responsible for all activity under your account\n• One person may not maintain multiple accounts" },
        { h: "Buyer Rules", body: "• Only purchase items for legitimate personal use\n• Provide accurate shipping information\n• Pay for orders on time (COD orders must be paid on delivery)\n• Do not abuse return/refund policies\n• Do not post fake reviews" },
        { h: "Seller Rules", body: "• List only genuine, legal products\n• Accurate product descriptions and photos\n• Fulfill orders within stated timeframes\n• Maintain adequate stock levels\n• No counterfeit or prohibited items\n• Sellers violating rules face permanent suspension" },
        { h: "Prohibited Items", body: "The following are NOT allowed on ShopTok:\n• Counterfeit or fake goods\n• Illegal drugs or substances\n• Weapons or dangerous items\n• Adult content\n• Stolen goods\n• Items that violate intellectual property rights" },
        { h: "Intellectual Property", body: "ShopTok and its logo are trademarks of ShopTok Pakistan. All content on this platform is protected by copyright. Sellers retain rights to their product content but grant ShopTok a license to display it." },
        { h: "Limitation of Liability", body: "ShopTok is a marketplace platform. We are not responsible for:\n• Product quality or authenticity claims\n• Seller fulfillment issues\n• Third-party delivery delays\n• Unauthorized use of your account\nOur liability is limited to the purchase price of the item." },
        { h: "Governing Law", body: "These terms are governed by the laws of Pakistan. Any disputes shall be resolved in the courts of Karachi, Pakistan. We encourage resolution through our support team first." },
        { h: "Contact", body: "For questions about these terms:\nEmail: legal@shoptok.pk\nAddress: ShopTok Pakistan, Main Boulevard, Gulshan-e-Iqbal, Karachi" },
      ],
    },
  };

  const isAbout = page === "about";
  const isLegalHub = page === "legal";
  const p = pages[page];
  if (!isAbout && !isLegalHub && !p) return null;

  const NavLink = ({ item }) => (
    <button
      onClick={() => { setPage(item.key); window.scrollTo(0, 0); }}
      style={{
        width: "100%", textAlign: "left", background: page === item.key ? "rgba(254,44,85,0.1)" : "transparent",
        border: "none", borderRadius: 8, padding: "9px 12px", marginBottom: 2, cursor: "pointer",
        fontFamily: "inherit", fontSize: 13, fontWeight: page === item.key ? 700 : 500,
        color: page === item.key ? "#fe2c55" : "rgba(0,0,0,0.6)", transition: "all 0.15s",
      }}
      onMouseEnter={(e) => { if (page !== item.key) e.currentTarget.style.background = "rgba(0,0,0,0.04)"; }}
      onMouseLeave={(e) => { if (page !== item.key) e.currentTarget.style.background = "transparent"; }}
    >{item.label}</button>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f7f7f8", paddingBottom: 80 }}>
      {/* Top banner */}
      <div style={{ background: "linear-gradient(135deg,rgba(254,44,85,0.08),rgba(37,244,238,0.05))", borderBottom: "1px solid rgba(0,0,0,0.07)", padding: "26px 24px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <button onClick={() => { setPage("shop"); window.scrollTo(0, 0); }} style={{ background: "none", border: "none", color: "rgba(0,0,0,0.5)", cursor: "pointer", fontSize: 13, marginBottom: 14, display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>← Back to Home</button>
          <h1 style={{ fontFamily: "'TikTok Sans',sans-serif", fontWeight: 800, fontSize: 26 }}>Help & Company Info</h1>
        </div>
      </div>

      {/* Body: sidebar + content */}
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 24px", display: "flex", gap: 32, alignItems: "flex-start" }} className="policy-layout">
        {/* Sidebar */}
        <aside style={{ width: 240, flexShrink: 0, position: "sticky", top: 24, background: "#fff", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 16, padding: 16 }}>
          {NAV_GROUPS.map((g) => (
            <div key={g.label} style={{ marginBottom: 18 }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(0,0,0,0.35)", padding: "0 12px", marginBottom: 6 }}>{g.label}</p>
              {g.items.map((item) => <NavLink key={item.key} item={item} />)}
            </div>
          ))}
        </aside>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {isAbout ? (
            <>
              {/* Hero */}
              <div style={{ background: "linear-gradient(135deg,#fe2c55,#ff6b35)", borderRadius: 20, padding: "44px 36px", marginBottom: 20, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
                <h1 style={{ fontFamily: "'TikTok Sans',sans-serif", fontWeight: 800, fontSize: 30, color: "#fff", marginBottom: 10, position: "relative" }}>{ABOUT.title}</h1>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.9)", maxWidth: 520, lineHeight: 1.6, position: "relative" }}>{ABOUT.tagline}</p>
              </div>

              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }} className="about-stats">
                {ABOUT.stats.map((s) => (
                  <div key={s.l} style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 14, padding: "18px 14px", textAlign: "center" }}>
                    <p style={{ fontFamily: "'TikTok Sans',sans-serif", fontWeight: 800, fontSize: 20, color: "#fe2c55" }}>{s.v}</p>
                    <p style={{ fontSize: 11, color: "rgba(0,0,0,0.45)", marginTop: 4 }}>{s.l}</p>
                  </div>
                ))}
              </div>

              {/* Story */}
              <div style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 16, padding: "24px 28px", marginBottom: 20 }}>
                <h2 style={{ fontFamily: "'TikTok Sans',sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 12, color: "#111" }}>Our Story</h2>
                <p style={{ fontSize: 14, color: "rgba(0,0,0,0.7)", lineHeight: 1.8 }}>{ABOUT.story}</p>
              </div>

              {/* Values */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="about-values">
                {ABOUT.values.map((v) => (
                  <div key={v.h} style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 14, padding: "18px 20px" }}>
                    <h3 style={{ fontFamily: "'TikTok Sans',sans-serif", fontWeight: 700, fontSize: 14, marginBottom: 6, color: "#fe2c55" }}>{v.h}</h3>
                    <p style={{ fontSize: 13, color: "rgba(0,0,0,0.6)", lineHeight: 1.6 }}>{v.d}</p>
                  </div>
                ))}
              </div>
            </>
          ) : isLegalHub ? (
            <>
              <div style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 20, padding: "36px 32px", marginBottom: 20 }}>
                <h1 style={{ fontFamily: "'TikTok Sans',sans-serif", fontWeight: 800, fontSize: 26, marginBottom: 8, color: "#111" }}>Legal</h1>
                <p style={{ fontSize: 14, color: "rgba(0,0,0,0.5)", maxWidth: 520, lineHeight: 1.6 }}>Policies and terms that govern how ShopTok, our sellers, and our buyers work together.</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="about-values">
                {LEGAL_DOCS.map((d) => (
                  <button
                    key={d.key}
                    onClick={() => { setPage(d.key); window.scrollTo(0, 0); }}
                    style={{ textAlign: "left", background: "#fff", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 14, padding: "20px 22px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#fe2c55"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.07)"; }}
                  >
                    <h3 style={{ fontFamily: "'TikTok Sans',sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 6, color: "#fe2c55" }}>{d.title} →</h3>
                    <p style={{ fontSize: 13, color: "rgba(0,0,0,0.55)", lineHeight: 1.6 }}>{d.desc}</p>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <h1 style={{ fontFamily: "'TikTok Sans',sans-serif", fontWeight: 800, fontSize: 24, marginBottom: 4 }}>{p.title}</h1>
              <p style={{ fontSize: 12, color: "rgba(0,0,0,0.4)", marginBottom: 24 }}>Last updated: April 2026 · ShopTok Pakistan</p>
              {p.sections.map((s, i) => (
                <div key={i} style={{ marginBottom: 16, background: "#fff", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 16, padding: "22px 26px" }}>
                  <h2 style={{ fontFamily: "'TikTok Sans',sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 12, color: "#fe2c55" }}>{s.h}</h2>
                  <div style={{ fontSize: 14, color: "rgba(0,0,0,0.7)", lineHeight: 1.8, whiteSpace: "pre-line" }}>{s.body}</div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .policy-layout { flex-direction: column; }
          .policy-layout aside { width: 100% !important; position: static !important; }
          .about-stats { grid-template-columns: repeat(2,1fr) !important; }
          .about-values { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default PolicyPage;
