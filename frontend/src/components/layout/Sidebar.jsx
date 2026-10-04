import { useMemo } from "react";

export const Sidebar = ({
  user,
  profileImg,
  tab,
  setTab,
  onAddProduct,
  onLogout,
  onEditProfile,
  tabs = [],
  showAdd = false,
}) => {
  const visibleTabs = useMemo(() => tabs.filter(Boolean), [tabs]);

  const productKeys = new Set(["products", "refunds", "reviews", "warehouse"]);
  const topTabs = visibleTabs.filter(t => !productKeys.has(t.key) && !["bestsellers", "storesetting", "venture"].includes(t.key));
  const productTabs = visibleTabs.filter(t => productKeys.has(t.key));
  const bottomTabs = visibleTabs.filter(t => ["bestsellers", "storesetting", "venture"].includes(t.key));

  const TabButton = ({ item }) => (
    <button
      className={`seller-side-tab ${tab === item.key ? "active" : ""}`}
      onClick={() => setTab(item.key)}
      type="button"
    >
      {item.icon ? <span className="seller-side-tab-icon">{item.icon}</span> : null}
      <span className="seller-side-tab-label">{item.label}</span>
      {item.badge ? <span className="seller-side-tab-badge">{item.badge}</span> : null}
    </button>
  );

  return (
    <aside className="seller-sidebar">
      <style>{`
        .seller-sidebar{
          width:220px;
          flex:0 0 220px;
          min-height:calc(100vh - 60px);
          background:#fff;
          border-right:1px solid rgba(0,0,0,.07);
          display:flex;
          flex-direction:column;
          overflow:hidden;
        }

        .seller-sidebar-profile{
          padding:12px 14px;
          border-bottom:1px solid rgba(0,0,0,.06);
          display:flex;
          align-items:center;
          gap:10px;
          flex-shrink:0;
          cursor:pointer;
        }

        .seller-sidebar-avatar{
          width:38px;
          height:38px;
          border-radius:50%;
          overflow:hidden;
          background:linear-gradient(135deg,#fe2c55,#ff6b35);
          display:flex;
          align-items:center;
          justify-content:center;
          flex:0 0 38px;
          position:relative;
        }

        .seller-sidebar-avatar img{
          width:100%;
          height:100%;
          object-fit:cover;
        }

        .seller-sidebar-name{
          min-width:0;
          flex:1;
        }

        .seller-sidebar-name p{
          font-size:12px;
          font-weight:700;
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
          margin:0 0 2px;
        }

        .seller-role{
          display:inline-block;
          font-size:9px;
          padding:2px 7px;
          border-radius:999px;
          background:rgba(37,244,238,.10);
          color:#0aa7a1;
        }

        .seller-sidebar-scroll{
          flex:1;
          overflow-y:auto;
          padding:8px;
        }

        .seller-side-group-title{
          font-size:9px;
          font-weight:800;
          color:#666;
          text-transform:uppercase;
          letter-spacing:.08em;
          padding:8px 8px 5px;
        }

        .seller-side-tab{
          width:100%;
          border:none;
          background:transparent;
          color:rgba(0,0,0,.55);
          min-height:34px;
          border-radius:8px;
          padding:7px 8px;
          margin:1px 0;
          display:flex;
          align-items:center;
          gap:7px;
          text-align:left;
          font-family:inherit;
          font-size:11px;
          cursor:pointer;
        }

        .seller-side-tab.active{
          background:rgba(254,44,85,.12);
          color:#fe2c55;
          font-weight:700;
        }

        .seller-side-tab-label{
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
          min-width:0;
          flex:1;
        }

        .seller-side-tab-badge{
          min-width:18px;
          height:18px;
          padding:0 5px;
          border-radius:9px;
          background:#fe2c55;
          color:#fff;
          font-size:9px;
          display:flex;
          align-items:center;
          justify-content:center;
        }

        .seller-sidebar-footer{
          padding:8px;
          border-top:1px solid rgba(0,0,0,.06);
        }

        .seller-add-btn,
        .seller-logout-btn{
          width:100%;
          min-height:34px;
          border:none;
          border-radius:8px;
          font-family:inherit;
          cursor:pointer;
          font-size:11px;
        }

        .seller-add-btn{
          background:rgba(254,44,85,.10);
          color:#fe2c55;
          font-weight:700;
          margin-bottom:4px;
        }

        .seller-logout-btn{
          background:transparent;
          color:rgba(0,0,0,.38);
        }

        @media(max-width:900px){
          .seller-sidebar{
            width:100%;
            max-width:100%;
            flex:0 0 auto;
            min-height:0;
            border-right:none;
            border-bottom:1px solid rgba(0,0,0,.08);
            overflow:visible;
          }

          .seller-sidebar-profile{
            padding:10px 12px;
          }

          .seller-sidebar-avatar{
            width:34px;
            height:34px;
            flex-basis:34px;
          }

          .seller-sidebar-scroll{
            display:flex;
            align-items:center;
            gap:6px;
            overflow-x:auto;
            overflow-y:hidden;
            padding:8px 10px;
            scrollbar-width:none;
            -webkit-overflow-scrolling:touch;
          }

          .seller-sidebar-scroll::-webkit-scrollbar{
            display:none;
          }

          .seller-side-group-title{
            display:none;
          }

          .seller-side-tab{
            width:auto;
            min-width:max-content;
            flex:0 0 auto;
            min-height:38px;
            margin:0;
            padding:8px 12px;
            border:1px solid #eee;
            background:#fff;
            border-radius:999px;
            white-space:nowrap;
          }

          .seller-side-tab.active{
            border-color:rgba(254,44,85,.22);
            background:rgba(254,44,85,.10);
          }

          .seller-side-tab-label{
            overflow:visible;
            text-overflow:clip;
            white-space:nowrap;
          }

          .seller-sidebar-footer{
            display:flex;
            gap:8px;
            padding:0 10px 10px;
            border-top:none;
          }

          .seller-add-btn,
          .seller-logout-btn{
            width:auto;
            flex:1;
            min-height:38px;
            margin:0;
          }
        }

        @media(max-width:480px){
          .seller-sidebar-profile{
            padding:8px 10px;
          }

          .seller-sidebar-name p{
            font-size:11px;
          }

          .seller-sidebar-scroll{
            padding:7px 8px;
            gap:5px;
          }

          .seller-side-tab{
            font-size:10.5px;
            padding:8px 11px;
          }

          .seller-sidebar-footer{
            padding:0 8px 8px;
          }
        }
      `}</style>

      <div className="seller-sidebar-profile" onClick={onEditProfile}>
        <div className="seller-sidebar-avatar">
          {profileImg
            ? <img src={profileImg} alt="" />
            : <span>{user?.avatar || user?.name?.[0]?.toUpperCase() || "U"}</span>}
        </div>
        <div className="seller-sidebar-name">
          <p>{user?.name || "Seller"}</p>
          <span className="seller-role">Seller</span>
        </div>
      </div>

      <nav className="seller-sidebar-scroll" aria-label="Seller dashboard">
        {topTabs.map(item => <TabButton key={item.key} item={item} />)}

        {productTabs.length > 0 && <div className="seller-side-group-title">Product Management</div>}
        {productTabs.map(item => <TabButton key={item.key} item={item} />)}

        {bottomTabs.map(item => <TabButton key={item.key} item={item} />)}
      </nav>

      <div className="seller-sidebar-footer">
        {showAdd && (
          <button className="seller-add-btn" onClick={onAddProduct} type="button">
            + Add Product
          </button>
        )}
        <button className="seller-logout-btn" onClick={onLogout} type="button">
          Log Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
