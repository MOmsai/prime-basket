// src/pages/HomePage.jsx
import { useState, useEffect } from "react";
import { database } from "../firebase";
import { ref, get } from "firebase/database";

const ALL_CATS = [
  "rice", "oil", "wheat-flour", "salt", "sugar", "chilli-powder",
  "turmeric-powder", "pulses", "masala", "fruits", "vegetables",
  "dairyProducts", "feminineHygiene", "homeNeeds", "babyCare",
  "instantFood", "milkPowders", "chipsAndNamkeens", "oralCare",
  "biscuitsAndCookies", "coolDrinks", "bodyCare",
];

const DEAL_CATS = ["fruits", "vegetables", "dairyProducts", "biscuitsAndCookies", "instantFood", "coolDrinks"];

const MULTICOL_CATS = {
  topSelling:    "rice",
  trending:      "oil",
  recentlyAdded: "masala",
  topRated:      "pulses",
};

const fetchCategory = (cat) =>
  get(ref(database, "categories/" + cat)).then((snap) => {
    const val = snap.val();
    return val ? Object.values(val).map((p, i) => ({ ...p, _cat: cat, _index: i, _uid: `${cat}_${i}` })) : [];
  });

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
const BADGE_CLASSES = ["bs", "bh", "bo", "bn"];

export default function HomePage({ onAddCart, onCategorySelect, onOpenProduct, cart = [], wishlist = [], toggleWishlist }) {
  const [popular15, setPopular15] = useState([]);
  const [deals, setDeals]         = useState([]);
  const [multiCols, setMultiCols] = useState({ topSelling: [], trending: [], recentlyAdded: [], topRated: [] });
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const popularResults = await Promise.all(ALL_CATS.map(fetchCategory));
        const allPopular = shuffle(popularResults.flat());

        const dealResults = await Promise.all(DEAL_CATS.map(fetchCategory));
        const allDeals = dealResults.flat().filter((p) => p.oldPrice);

        const [ts, tr, ra, tp] = await Promise.all(
          Object.values(MULTICOL_CATS).map(fetchCategory)
        );

        if (!cancelled) {
          setPopular15(allPopular.slice(0, 15));
          setDeals(shuffle(allDeals).slice(0, 4));
          setMultiCols({
            topSelling:    ts.slice(0, 3),
            trending:      tr.slice(0, 3),
            recentlyAdded: ra.slice(0, 3),
            topRated:      tp.slice(0, 3),
          });
          setLoading(false);
        }
      } catch (err) {
        console.error("HomePage fetch error:", err);
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const SkeletonCard = () => (
    <div style={{ background: "#fff", borderRadius: "10px", height: "240px", animation: "pulse 1.4s infinite ease-in-out" }} />
  );

  // Fully reactive product card — works with cart & wishlist state
  const ProductCard = ({ p, idx }) => {
    const inCart  = cart.find((c) => c._uid === p._uid);
    const qty     = inCart ? inCart.quantity : 0;
    const isWished = wishlist.some((w) => w._uid === p._uid);

    return (
      <div className="pcard" data-cat={p._cat} style={{ cursor: "pointer" }} onClick={() => onOpenProduct && onOpenProduct(p)}>
        <span className={`pbadge ${BADGE_CLASSES[idx % BADGE_CLASSES.length]}`}>
          {p.badge || (p.oldPrice ? "Sale" : "New")}
        </span>
        <button
          className="pwish"
          style={isWished ? { opacity: 1, background: "#ff3b81", color: "#fff" } : {}}
          onClick={(e) => { e.stopPropagation(); toggleWishlist && toggleWishlist(p); }}
        >
          <i className={isWished ? "fas fa-heart" : "far fa-heart"}></i>
        </button>
        <div className="pimg">
          <img src={p.imageUrl} alt={p.name} loading="lazy" decoding="async" />
        </div>
        <div className="pbrand">{p.brand}</div>
        <div className="pname">{p.name}</div>
        {p.stars != null && (
          <div className="pstars">⭐ {p.stars} {p.reviews && <span>({p.reviews})</span>}</div>
        )}
        <div className="pprice">
          <span className="pnew">{p.price}</span>
          {p.oldPrice && <span className="pold">{p.oldPrice}</span>}
        </div>
        <button
          className="padd"
          style={qty > 0 ? { background: "var(--green)", color: "#fff" } : {}}
          onClick={(e) => { e.stopPropagation(); onAddCart && onAddCart(p); }}
        >
          {qty > 0
            ? <><i className="fas fa-check"></i> Added ({qty})</>
            : <><i className="fas fa-shopping-cart"></i> Add</>
          }
        </button>
      </div>
    );
  };

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.45; }
        }
      `}</style>

      {/* ── POPULAR PRODUCTS ── */}
      <section className="products-section">
        <div className="container">
          <div className="sec-header">
            <div>
              <div className="sec-title">Popular Products</div>
            </div>
          </div>

          <div className="products-layout">
            <div>
              <div className="products-grid" id="pGrid">
                {loading
                  ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
                  : popular15.length === 0
                    ? <p style={{ color: "#7e7e7e", padding: "20px 0" }}>No products found.</p>
                    : popular15.map((p, i) => <ProductCard key={p._uid} p={p} idx={i} />)
                }
              </div>
            </div>

            {/* SIDEBAR */}
            <div className="sidebar">
              <div className="cat-box">
                <h3>Category</h3>
                {[
                  { key: "fruits",           icon: "fa-apple-alt",    label: "Fresh Fruits" },
                  { key: "vegetables",       icon: "fa-carrot",       label: "Vegetables" },
                  { key: "dairyProducts",    icon: "fa-cheese",       label: "Dairy Products" },
                  { key: "chipsAndNamkeens", icon: "fa-cookie-bite",  label: "Chips & Namkeens" },
                  { key: "coolDrinks",       icon: "fa-glass-cheers", label: "Cool Drinks" },
                  { key: "instantFood",      icon: "fa-bolt",         label: "Instant Food" },
                  { key: "babyCare",         icon: "fa-baby",         label: "Baby Care" },
                  { key: "bodyCare",         icon: "fa-spa",          label: "Body Care" },
                ].map((c) => (
                  <div key={c.key} className="cat-item" style={{ cursor: "pointer" }} onClick={() => onCategorySelect && onCategorySelect(c.key)}>
                    <div className="cat-item-l">
                      <div className="cicon"><i className={`fas ${c.icon}`}></i></div>
                      {c.label}
                    </div>
                    <i className="fas fa-chevron-right" style={{ fontSize: "10px", color: "#bbb" }}></i>
                  </div>
                ))}
              </div>
              <div className="tags-box">
                <h3>Product Tags</h3>
                {["Organic", "Fresh", "Dairy", "Snacks", "Beverages", "Fruits", "Vegetables", "Spices"].map((tag) => (
                  <span key={tag} className="tag-pill">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DEALS OF THE DAY ── */}
      <section className="deals-section">
        <div className="deals-header">
          <h2 className="deals-title">Deals Of The Day</h2>
          <a href="#" className="deals-all-link">
            All Deals <i className="fa-solid fa-chevron-right" style={{ fontSize: "10px" }}></i>
          </a>
        </div>
        <div className="deals-grid">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: "12px", height: "320px", animation: "pulse 1.4s infinite" }} />
              ))
            : deals.map((d, i) => {
                const inCart  = cart.find((c) => c._uid === d._uid);
                const qty     = inCart ? inCart.quantity : 0;
                const isWished = wishlist.some((w) => w._uid === d._uid);
                return (
                  <div key={d._uid} className="prod-card" style={{ cursor: "pointer", position: "relative" }} onClick={() => onOpenProduct && onOpenProduct(d)}>
                    <div className="card-img-zone">
                      <span className="disc-badge">{d.badge || "Sale"}</span>
                      {/* Wishlist button on deal card */}
                      <button
                        style={{
                          position: "absolute", top: 10, right: 10,
                          width: 30, height: 30, borderRadius: "50%",
                          border: "1px solid #eee",
                          background: isWished ? "#ff3b81" : "#fff",
                          color: isWished ? "#fff" : "#ff3b81",
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 13, zIndex: 2, transition: ".2s",
                        }}
                        onClick={(e) => { e.stopPropagation(); toggleWishlist && toggleWishlist(d); }}
                      >
                        <i className={isWished ? "fas fa-heart" : "far fa-heart"}></i>
                      </button>
                      <img src={d.imageUrl} alt={d.name} loading="lazy" />
                    </div>
                    <div className="card-info">
                      <div className="card-title">{d.name}</div>
                      <div className="card-seller">{d.brand}</div>
                      <div className="card-price-row">
                        <span className="price-new">{d.price}</span>
                        <span className="price-old">{d.oldPrice}</span>
                        <button
                          className="padd"
                          style={qty > 0 ? { background: "var(--green)", color: "#fff" } : {}}
                          onClick={(e) => { e.stopPropagation(); onAddCart && onAddCart(d); }}
                        >
                          {qty > 0
                            ? <><i className="fas fa-check"></i> Added ({qty})</>
                            : <><i className="fas fa-shopping-cart"></i> Add</>
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
          }
        </div>
      </section>

      {/* ── BANNER TRIO ── */}
      <div className="container">
        <div className="banners">
          <div className="bcard b1">
            <div className="btext">
              <h2>Everyday Fresh &amp; Clean with Our Products</h2>
              <a href="#" className="bbtn">Shop Now <i className="fa-solid fa-arrow-right" style={{ fontSize: "8px" }}></i></a>
            </div>
            <div className="bimg"><img src="assets/fresh&clean.png" alt="" /></div>
          </div>
          <div className="bcard b2">
            <div className="btext">
              <h2>Make your Breakfast Healthy &amp; Easy</h2>
              <a href="#" className="bbtn">Shop Now <i className="fa-solid fa-arrow-right" style={{ fontSize: "8px" }}></i></a>
            </div>
            <div className="bimg"><img src="assets/healthy-breakfast.png" alt="" /></div>
          </div>
          <div className="bcard b3">
            <div className="btext">
              <h2>The best Organic Products Online</h2>
              <a href="#" className="bbtn">Shop Now <i className="fa-solid fa-arrow-right" style={{ fontSize: "8px" }}></i></a>
            </div>
            <div className="bimg"><img src="assets/organic-food.png" alt="" /></div>
          </div>
        </div>
      </div>

      {/* ── SHOP BY CATEGORIES ── */}
      <section className="cat-section">
        <div className="container">
          <div className="sec-header">
            <div className="sec-title">Shop by Categories</div>
            <a href="#" className="view-all">
              All Categories <i className="fa-solid fa-chevron-right" style={{ fontSize: "10px" }}></i>
            </a>
          </div>
          <div className="cat-grid">
            {[
              { key: "dairyProducts",      img: "assets/category-1.png",  name: "Milks & Dairies" },
              { key: "coolDrinks",         img: "assets/category-2.png",  name: "Cool Drinks" },
              { key: "bodyCare",           img: "assets/category-3.png",  name: "Body Care" },
              { key: "babyCare",           img: "assets/category-4.png",  name: "Baby Care" },
              { key: "instantFood",        img: "assets/category-5.png",  name: "Instant Food" },
              { key: "biscuitsAndCookies", img: "assets/category-6.png",  name: "Biscuits & Cookies" },
              { key: "vegetables",         img: "assets/category-7.png",  name: "Vegetables" },
              { key: "fruits",             img: "assets/category-10.png", name: "Fresh Fruits" },
            ].map((cat, i) => (
              <div key={i} className="catbox" style={{ cursor: "pointer" }} onClick={() => onCategorySelect && onCategorySelect(cat.key)}>
                <div className="catbox-icon"><img src={cat.img} alt="" /></div>
                <h5>{cat.name}</h5>
                <span>Shop now</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOP SELLING / TRENDING / RECENTLY ADDED / TOP RATED ── */}
      <section>
        <div className="container">
          <div className="multicol">
            {[
              { title: "Top Selling",    items: multiCols.topSelling },
              { title: "Trending",       items: multiCols.trending },
              { title: "Recently Added", items: multiCols.recentlyAdded },
              { title: "Top Rated",      items: multiCols.topRated },
            ].map((col, ci) => (
              <div key={ci}>
                <div className="coltitle">{col.title}</div>
                {loading
                  ? Array.from({ length: 3 }).map((_, ii) => (
                      <div key={ii} style={{ display: "flex", gap: "10px", padding: "10px 0", alignItems: "center" }}>
                        <div style={{ width: 58, height: 58, borderRadius: 8, background: "#ececec", flexShrink: 0, animation: "pulse 1.4s infinite" }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ height: 12, background: "#ececec", borderRadius: 4, marginBottom: 6, animation: "pulse 1.4s infinite" }} />
                          <div style={{ height: 10, background: "#ececec", borderRadius: 4, width: "60%", animation: "pulse 1.4s infinite" }} />
                        </div>
                      </div>
                    ))
                  : col.items.map((item, ii) => {
                      const inCart  = cart.find((c) => c._uid === item._uid);
                      const qty     = inCart ? inCart.quantity : 0;
                      const isWished = wishlist.some((w) => w._uid === item._uid);
                      return (
                        <div key={ii} className="mprod" style={{ cursor: "pointer" }} onClick={() => onOpenProduct && onOpenProduct(item)}>
                          <div className="mimg">
                            <img src={item.imageUrl} alt={item.name} loading="lazy" />
                          </div>
                          <div className="minfo">
                            <h6>{item.name}</h6>
                            <div className="pstars">⭐ {item.stars || "4.0"} <span>({item.reviews || 0})</span></div>
                            <div className="mbrand">{item.brand}</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                              <span className="mprice">{item.price}</span>
                              {item.oldPrice && <span className="mpold">{item.oldPrice}</span>}
                            </div>
                            <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                              <button
                                className="padd"
                                style={{ fontSize: 11, padding: "4px 10px", ...(qty > 0 ? { background: "var(--green)", color: "#fff" } : {}) }}
                                onClick={(e) => { e.stopPropagation(); onAddCart && onAddCart(item); }}
                              >
                                {qty > 0 ? <><i className="fas fa-check"></i> ({qty})</> : <><i className="fas fa-shopping-cart"></i> Add</>}
                              </button>
                              <button
                                className="pwish"
                                style={{ position: "static", opacity: 1, width: 28, height: 28, fontSize: 12, flexShrink: 0, ...(isWished ? { background: "#ff3b81", color: "#fff" } : {}) }}
                                onClick={(e) => { e.stopPropagation(); toggleWishlist && toggleWishlist(item); }}
                              >
                                <i className={isWished ? "fas fa-heart" : "far fa-heart"}></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                }
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="promo-banner">
        <div className="banner-content">
          <h1>Stay home &amp; get your daily needs from our shop</h1>
          <p>Start Your Daily Shopping with <span>Prime Basket</span></p>
          <form className="subscribe" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Your email address" required />
            <button type="submit">Subscribe</button>
          </form>
        </div>
        <div className="banner-images">
          <img className="img-person" src="assets/banner-9-min.png" alt="delivery person with groceries"
            onError={(e) => { e.target.style.background = "rgba(0,0,0,0.05)"; e.target.style.borderRadius = "8px"; e.target.style.minHeight = "220px"; }}
          />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="features">
        <div className="container">
          <div className="feat-grid">
            {[
              { img: "assets/icon-1.png", title: "Best prices & offers", sub: "Orders $50 or more" },
              { img: "assets/icon-2.png", title: "Free delivery",         sub: "24/7 amazing services" },
              { img: "assets/icon-3.png", title: "Great daily deal",      sub: "When you sign up" },
              { img: "assets/icon-4.png", title: "Wide assortment",       sub: "Mega Discounts" },
              { img: "assets/icon-5.png", title: "Easy returns",          sub: "Within 30 days" },
            ].map((f, i) => (
              <div key={i} className="feat-item">
                <div className="ficon"><img src={f.img} alt="" /></div>
                <div className="ftext">
                  <h5>{f.title}</h5>
                  <p>{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}