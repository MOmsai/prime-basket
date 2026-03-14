// src/pages/CategoryPage.jsx
import { useEffect, useState } from "react";
import { database } from "../firebase";
import { ref, get } from "firebase/database";

const CATEGORIES = [
  { value: "rice",               icon: "fa-seedling",        label: "Rice" },
  { value: "oil",                icon: "fa-tint",            label: "Oil" },
  { value: "wheat-flour",        icon: "fa-bread-slice",     label: "Wheat Flour" },
  { value: "salt",               icon: "fa-mortar-pestle",   label: "Salt" },
  { value: "sugar",              icon: "fa-cube",            label: "Sugar" },
  { value: "chilli-powder",      icon: "fa-pepper-hot",      label: "Chilli Powder" },
  { value: "turmeric-powder",    icon: "fa-leaf",            label: "Turmeric Powder" },
  { value: "pulses",             icon: "fa-circle",          label: "Pulses" },
  { value: "masala",             icon: "fa-mortar-pestle",   label: "Masala" },
  { value: "fruits",             icon: "fa-apple-alt",       label: "Fruits" },
  { value: "vegetables",         icon: "fa-carrot",          label: "Vegetables" },
  { value: "dairyProducts",      icon: "fa-cheese",          label: "Dairy Products" },
  { value: "feminineHygiene",    icon: "fa-female",          label: "Feminine Hygiene" },
  { value: "homeNeeds",          icon: "fa-broom",           label: "Home Needs" },
  { value: "babyCare",           icon: "fa-baby",            label: "Baby Care" },
  { value: "instantFood",        icon: "fa-bolt",            label: "Instant Food" },
  { value: "milkPowders",        icon: "fa-glass-whiskey",   label: "Milk Powders" },
  { value: "chipsAndNamkeens",   icon: "fa-cookie-bite",     label: "Chips & Namkeens" },
  { value: "oralCare",           icon: "fa-tooth",           label: "Oral Care" },
  { value: "biscuitsAndCookies", icon: "fa-cookie",          label: "Biscuits & Cookies" },
  { value: "coolDrinks",         icon: "fa-glass-cheers",    label: "Cool Drinks" },
  { value: "bodyCare",           icon: "fa-spa",             label: "Body Care" },
];

export default function CategoryPage({ category, onCategoryChange, onBack, onAddCart, onOpenProduct, cart = [], wishlist = [], toggleWishlist }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);

  const activeLabel = CATEGORIES.find((c) => c.value === category)?.label || category;

  useEffect(() => {
    if (!category) return;
    setLoading(true);
    setProducts([]);
    get(ref(database, "categories/" + category)).then((snap) => {
      const data = snap.val();
      setProducts(
        data
          ? Object.values(data).map((p, i) => ({ ...p, _cat: category, _index: i, _uid: `${category}_${i}` }))
          : []
      );
      setLoading(false);
    });
  }, [category]);

  return (
    <div style={{ background: "#f2f3f4", minHeight: "100vh", paddingBottom: 40 }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @media(max-width:900px){ .cat-page-wrap{ grid-template-columns:1fr !important; } .cat-sidebar{ display:none !important; } }
        @media(max-width:768px){ .products-grid{ grid-template-columns:repeat(2,1fr) !important; } }
      `}</style>

      {/* Breadcrumb */}
      <div style={{ background: "#fff", borderBottom: "1px solid #ececec", padding: "12px 0" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#7e7e7e" }}>
          <span onClick={onBack} style={{ color: "#1d5ba0", fontWeight: 600, cursor: "pointer" }}>Home</span>
          <i className="fas fa-chevron-right" style={{ fontSize: 10 }}></i>
          <span style={{ color: "#253d4e", fontWeight: 700 }}>{activeLabel}</span>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 28 }}>
        <div className="cat-page-wrap" style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 24, alignItems: "start" }}>

          {/* Sidebar */}
          <aside className="cat-sidebar">
            <div className="cat-box">
              <h3>All Categories</h3>
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.value}
                  className="cat-item"
                  onClick={() => onCategoryChange(cat.value)}
                  style={cat.value === category ? { color: "#1d5ba0", fontWeight: 700, background: "#e8f0fb", borderRadius: 6, padding: "8px 8px", marginBottom: 2 } : { cursor: "pointer" }}
                >
                  <div className="cat-item-l">
                    <div className="cicon"><i className={`fas ${cat.icon}`}></i></div>
                    {cat.label}
                  </div>
                  {cat.value === category && <i className="fas fa-chevron-right" style={{ fontSize: 10, color: "#1d5ba0" }}></i>}
                </div>
              ))}
            </div>
          </aside>

          {/* Main */}
          <main>
            {/* Header row */}
            <div style={{ background: "#fff", borderRadius: 10, padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 8px rgba(0,0,0,.05)" }}>
              <div>
                <h2 style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 20, fontWeight: 800, color: "#253d4e", margin: 0 }}>{activeLabel}</h2>
                {!loading && <p style={{ fontSize: 12, color: "#7e7e7e", marginTop: 3, marginBottom: 0 }}>{products.length} product{products.length !== 1 ? "s" : ""} found</p>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#7e7e7e" }}>
                <i className="fas fa-sliders-h" style={{ color: "#1d5ba0" }}></i>
                <span>Sort by: <strong style={{ color: "#253d4e" }}>Default</strong></span>
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="products-grid" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} style={{ background: "#fff", borderRadius: 10, height: 240, animation: "pulse 1.4s infinite" }} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div style={{ background: "#fff", borderRadius: 12, padding: "60px 20px", textAlign: "center" }}>
                <i className="fas fa-box-open" style={{ fontSize: 40, color: "#d0d8e4", marginBottom: 14, display: "block" }}></i>
                <p style={{ fontWeight: 700, color: "#253d4e" }}>No products found</p>
              </div>
            ) : (
              <div className="products-grid" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
                {products.map((item, i) => {
                  const inCart  = cart.find((c) => c._uid === item._uid);
                  const qty     = inCart ? inCart.quantity : 0;
                  const isWished = wishlist.some((w) => w._uid === item._uid);
                  return (
                    <div
                      key={item._uid}
                      className="pcard"
                      style={{ cursor: "pointer" }}
                      onClick={() => onOpenProduct && onOpenProduct(item)}
                    >
                      {item.badge && <span className="pbadge bo">{item.badge}</span>}
                      <button
                        className="pwish"
                        style={isWished ? { opacity: 1, background: "#ff3b81", color: "#fff" } : {}}
                        onClick={(e) => { e.stopPropagation(); toggleWishlist && toggleWishlist(item); }}
                      >
                        <i className={isWished ? "fas fa-heart" : "far fa-heart"}></i>
                      </button>
                      <div className="pimg"><img src={item.imageUrl} alt={item.name} loading="lazy" /></div>
                      <div className="pbrand">{item.brand}</div>
                      <div className="pname">{item.name}</div>
                      {item.stars != null && <div className="pstars">⭐ {item.stars}{item.reviews && <span> ({item.reviews})</span>}</div>}
                      <div className="pprice">
                        <span className="pnew">{item.price}</span>
                        {item.oldPrice && <span className="pold">{item.oldPrice}</span>}
                      </div>
                      <button className="padd" onClick={(e) => { e.stopPropagation(); onAddCart && onAddCart(item); }}>
                        {qty > 0 ? <><i className="fas fa-check"></i> Added ({qty})</> : <><i className="fas fa-shopping-cart"></i> Add</>}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}