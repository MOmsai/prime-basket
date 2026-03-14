// src/pages/ProductDetailPage.jsx
import { useState, useEffect } from "react";
import { database } from "../firebase";
import { ref, get } from "firebase/database";

const allCoupons = [
  { code: "ONECARD",  text: "Get 5% off with OneCard"                  },
  { code: "BHIM25",   text: "Upto ₹25 cashback with BHIM app"          },
  { code: "ZAGG20",   text: "20% off with Zagg Rupay Credit Card"       },
  { code: "AMZPAY",   text: "Upto ₹100 cashback with Amazon Pay Later"  },
  { code: "POP10",    text: "Flat ₹10 cashback with POP UPI"            },
  { code: "SBI50",    text: "₹50 cashback with SBI Credit Card"         },
  { code: "HDFC10",   text: "10% instant discount — HDFC Bank Cards"    },
  { code: "AXIS200",  text: "Flat ₹200 off with Axis Bank Debit Card"   },
  { code: "GPAY75",   text: "Upto ₹75 cashback using Google Pay"        },
  { code: "PAYTM30",  text: "Flat ₹30 cashback with Paytm Wallet"       },
];

const RELATED = {
  rice: ["wheat-flour", "pulses", "sugar"],
  oil: ["masala", "chilli-powder", "turmeric-powder"],
  "wheat-flour": ["rice", "pulses", "salt"],
  fruits: ["vegetables", "dairyProducts", "coolDrinks"],
  vegetables: ["fruits", "dairyProducts", "masala"],
  dairyProducts: ["milkPowders", "fruits", "biscuitsAndCookies"],
  chipsAndNamkeens: ["biscuitsAndCookies", "coolDrinks", "instantFood"],
  biscuitsAndCookies: ["chipsAndNamkeens", "coolDrinks", "milkPowders"],
  coolDrinks: ["chipsAndNamkeens", "biscuitsAndCookies", "instantFood"],
  instantFood: ["chipsAndNamkeens", "biscuitsAndCookies", "masala"],
  babyCare: ["oralCare", "bodyCare", "feminineHygiene"],
  oralCare: ["bodyCare", "babyCare", "homeNeeds"],
  bodyCare: ["oralCare", "feminineHygiene", "homeNeeds"],
  feminineHygiene: ["bodyCare", "babyCare", "homeNeeds"],
  homeNeeds: ["oralCare", "bodyCare", "babyCare"],
};

const BADGE_CLS = ["bs", "bh", "bo", "bn"];
const NAV_H = 88; // header height in px — adjust if yours is different

export default function ProductDetailPage({ product, onBack, onAddCart, cart = [], wishlist = [], toggleWishlist }) {
  const [similar, setSimilar]               = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(true);
  const [showAllCoupons, setShowAllCoupons] = useState(false);
  const [shareMsg, setShareMsg]             = useState("");
  const [activeThumb, setActiveThumb]       = useState(0);
  const [copiedCode, setCopiedCode]         = useState("");

  const inCart   = cart.find((c) => c._uid === product._uid);
  const qty      = inCart ? inCart.quantity : 0;
  const isWished = wishlist.some((w) => w._uid === product._uid);
  const displayed = showAllCoupons ? allCoupons : allCoupons.slice(0, 5);

  const discountPct = (() => {
    const old = parseFloat(String(product.oldPrice || "").replace(/[^0-9.]/g, ""));
    const cur = parseFloat(String(product.price    || "").replace(/[^0-9.]/g, ""));
    return old && cur && old > cur ? Math.round(((old - cur) / old) * 100) : null;
  })();

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [product._uid]);

  useEffect(() => {
    setLoadingSimilar(true);
    const relCats = RELATED[product._cat] || ["fruits", "vegetables", "dairyProducts"];
    Promise.all(
      relCats.map((cat) =>
        get(ref(database, "categories/" + cat)).then((snap) => {
          const v = snap.val();
          if (!v) return [];
          return Object.values(v).slice(0, 4).map((p, i) => ({
            ...p, _cat: cat, _index: i, _uid: `${cat}_${i}`,
          }));
        })
      )
    ).then((res) => { setSimilar(res.flat().slice(0, 10)); setLoadingSimilar(false); });
  }, [product._uid]);

  const handleShare = async () => {
    const text = `${product.name} — ${product.price} on Prime Basket!`;
    try {
      if (navigator.share) await navigator.share({ title: product.name, text });
      else { await navigator.clipboard.writeText(text); setShareMsg("Copied!"); setTimeout(() => setShareMsg(""), 2000); }
    } catch { /**/ }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code); setTimeout(() => setCopiedCode(""), 2000);
  };

  return (
    <>
      <style>{`
        /* ── Page ── */
        .pdp { background: var(--bg); min-height: 100vh; padding-bottom: 60px; }

        /* ── Breadcrumb ── */
        .pdp-crumb { background:#fff; border-bottom:1px solid var(--border); padding:11px 0; }
        .pdp-crumb-inner { display:flex; align-items:center; gap:8px; font-size:13px; color:var(--body); }
        .pdp-crumb-back { display:flex; align-items:center; gap:5px; color:#1d5ba0; font-weight:700; cursor:pointer; }
        .pdp-crumb-back:hover { text-decoration:underline; }
        .pdp-crumb-sep { font-size:10px; }
        .pdp-crumb-cat { color:#1d5ba0; font-weight:600; cursor:pointer; text-transform:capitalize; }
        .pdp-crumb-cat:hover { text-decoration:underline; }
        .pdp-crumb-name { color:var(--dark); font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:300px; }

        /* ── Two-column layout ──
           Left  = thumbs (64px) + image panel (flex:0 0 420px) → sticky
           Right = all info → scrolls naturally with page
        */
        .pdp-body { display:grid; grid-template-columns:500px 1fr; gap:28px; align-items:start; padding:28px 0 0; }

        /* Left sticky column */
        .pdp-left { position:sticky; top:${NAV_H}px; display:flex; gap:12px; align-self:start; }

        /* Thumbnail strip */
        .pdp-thumbs { display:flex; flex-direction:column; gap:10px; }
        .pdp-thumb {
          width:62px; height:62px; border-radius:10px; border:2px solid var(--border);
          background:#fff; display:flex; align-items:center; justify-content:center;
          cursor:pointer; padding:5px; transition:.2s; overflow:hidden; flex-shrink:0;
        }
        .pdp-thumb:hover, .pdp-thumb.active {
          border-color:#1d5ba0;
          box-shadow:0 0 0 3px rgba(29,91,160,.12);
        }
        .pdp-thumb img { max-width:100%; max-height:100%; object-fit:contain; }

        /* Image card */
        .pdp-imgcard {
          flex:1;
          background:#fff;
          border:1px solid var(--border);
          border-radius:14px;
          padding:20px 20px 16px;
          display:flex;
          flex-direction:column;
          align-items:stretch;
          min-height:520px;
          position:relative;
          overflow:hidden;
        }
        /* Centered image zone */
        .pdp-img-zone {
          flex:1;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:40px 10px;
        }
        .pdp-disc-badge {
          position:absolute; top:14px; left:14px;
          background:var(--red); color:#fff;
          font-size:11px; font-weight:800;
          padding:4px 10px; border-radius:4px 10px 4px 10px;
          z-index:2;
        }
        .pdp-icon-col { position:absolute; top:14px; right:14px; display:flex; flex-direction:column; gap:8px; z-index:2; }
        .pdp-icon-btn {
          width:36px; height:36px; border-radius:50%;
          background:#fff; border:1px solid var(--border);
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; color:#1d5ba0; font-size:14px;
          box-shadow:0 2px 8px rgba(0,0,0,.07); transition:.2s;
        }
        .pdp-icon-btn:hover { background:#1d5ba0; color:#fff; border-color:#1d5ba0; }
        .pdp-icon-btn.wished { background:var(--red); color:#fff; border-color:var(--red); }
        .pdp-share-toast {
          position:absolute; top:14px; left:50%; transform:translateX(-50%);
          background:#1d5ba0; color:#fff; font-size:12px; font-weight:700;
          padding:5px 14px; border-radius:8px; white-space:nowrap; z-index:10;
        }
        .pdp-bigimg {
          max-height:320px; max-width:100%; object-fit:contain;
          display:block; transition:transform .35s;
        }
        .pdp-imgcard:hover .pdp-bigimg { transform:scale(1.04); }
        .pdp-add-btn {
          width:100%; background:#1d5ba0; color:#fff; border:none; border-radius:8px;
          padding:12px 0; font-size:14px; font-weight:700; cursor:pointer;
          font-family:inherit; display:flex; align-items:center; justify-content:center;
          gap:8px; transition:.2s; margin-top:auto;
        }
        .pdp-add-btn:hover { background:#174d8a; }
        .pdp-add-btn.added { background:#16a34a; }
        .pdp-add-btn.added:hover { background:#15803d; }

        /* ── Right scrollable column ── */
        .pdp-right { display:flex; flex-direction:column; gap:20px; }

        /* Info card */
        .pdp-infocard {
          background:#fff; border:1px solid var(--border);
          border-radius:14px; padding:26px 28px;
          box-shadow:var(--shadow);
        }
        .pdp-cat-tag {
          font-size:10px; font-weight:800; letter-spacing:1px; text-transform:uppercase;
          color:#1d5ba0; background:#e8f0fb;
          padding:3px 10px; border-radius:20px;
          display:inline-block; margin-bottom:12px;
        }
        .pdp-pname {
          font-size:22px; font-weight:800; color:var(--dark); line-height:1.3;
          margin:0 0 12px; font-family:'Quicksand',sans-serif;
        }
        .pdp-meta { display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:16px; }
        .pdp-by { font-size:13px; color:var(--body); }
        .pdp-by strong { color:#1d5ba0; font-weight:700; }
        .pdp-star {
          display:inline-flex; align-items:center; gap:5px;
          background:var(--bg); border:1px solid var(--border);
          border-radius:20px; padding:3px 10px;
          font-size:12px; font-weight:700; color:var(--dark);
        }
        .pdp-star span { color:var(--body); font-weight:400; }
        .pdp-prices { display:flex; align-items:baseline; gap:10px; margin-bottom:4px; flex-wrap:wrap; }
        .pdp-price { font-size:30px; font-weight:800; color:#1d5ba0; font-family:'Quicksand',sans-serif; }
        .pdp-oldprice { font-size:17px; color:var(--body); text-decoration:line-through; }
        .pdp-savepill {
          font-size:12px; font-weight:700; color:#16a34a;
          background:#dcfce7; padding:2px 9px; border-radius:20px; align-self:center;
        }
        .pdp-taxnote { font-size:11px; color:var(--body); margin-bottom:18px; }
        .pdp-pills { display:flex; gap:7px; flex-wrap:wrap; margin-bottom:20px; }
        .pdp-pill {
          display:inline-flex; align-items:center; gap:5px;
          background:var(--bg); border:1px solid var(--border);
          border-radius:20px; padding:5px 11px;
          font-size:11px; font-weight:700; color:#1d5ba0;
        }
        .pdp-pill i { font-size:10px; }
        .pdp-divider { border:none; border-top:1px solid var(--border); margin:0 0 18px; }

        /* Coupons */
        .pdp-coup-head {
          font-size:14px; font-weight:800; color:var(--dark); margin:0 0 12px;
          font-family:'Quicksand',sans-serif; display:flex; align-items:center; gap:7px;
        }
        .pdp-coup-item {
          display:flex; align-items:center; gap:10px;
          padding:8px 0; border-bottom:1px solid var(--bg); cursor:pointer;
        }
        .pdp-coup-item:last-of-type { border-bottom:none; }
        .pdp-coup-item:hover .pdp-coup-code { background:#1d5ba0; color:#fff; border-color:#1d5ba0; border-style:solid; }
        .pdp-coup-code {
          font-size:10px; font-weight:800;
          border:1.5px dashed #1d5ba0; color:#1d5ba0;
          padding:3px 8px; border-radius:5px;
          white-space:nowrap; letter-spacing:.6px;
          transition:.2s; flex-shrink:0; min-width:70px; text-align:center;
        }
        .pdp-coup-code.copied { background:#16a34a; color:#fff; border-color:#16a34a; border-style:solid; }
        .pdp-coup-text { font-size:13px; color:var(--body); flex:1; line-height:1.4; }
        .pdp-coup-arrow { font-size:9px; color:var(--red); flex-shrink:0; }
        .pdp-coup-more {
          background:none; border:none; color:var(--red);
          font-size:12px; font-weight:700; cursor:pointer;
          padding:8px 0 0; font-family:inherit; display:block;
        }

        /* Highlights + Product Info cards */
        .pdp-bcard {
          background:#fff; border:1px solid var(--border);
          border-radius:14px; padding:22px 26px;
          box-shadow:var(--shadow);
        }
        .pdp-bcard-title {
          font-size:15px; font-weight:800; color:var(--dark); margin:0 0 16px;
          font-family:'Quicksand',sans-serif;
          padding-bottom:10px; border-bottom:2px solid #1d5ba0;
        }
        .pdp-trow {
          display:grid; grid-template-columns:130px 1fr;
          gap:10px; padding:10px 0;
          border-bottom:1px solid var(--bg); font-size:13px;
        }
        .pdp-trow:last-child { border-bottom:none; }
        .pdp-tlabel { color:var(--body); }
        .pdp-tvalue { color:var(--dark); font-weight:600; text-transform:capitalize; }
        .pdp-tlink { color:#1d5ba0; font-weight:600; }
        .pdp-desc { font-size:13px; color:var(--body); line-height:1.7; margin-bottom:14px; }

        /* Below-image cards (highlights + product info) sit beneath left column */
        .pdp-below { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-top:20px; }

        /* Similar products */
        .pdp-similar { margin-top:44px; }

        /* ── Responsive ── */
        @media(max-width:1100px) {
          .pdp-body { grid-template-columns:420px 1fr; }
          .pdp-below { grid-template-columns:1fr; }
        }
        @media(max-width:900px) {
          .pdp-body { grid-template-columns:1fr; }
          .pdp-left { position:static; }
          .pdp-thumbs { flex-direction:row; overflow-x:auto; padding-bottom:4px; }
          .pdp-thumb { flex-shrink:0; }
          .pdp-below { grid-template-columns:1fr; }
          .products-grid { grid-template-columns:repeat(2,1fr) !important; }
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
      `}</style>

      <div className="pdp">

        {/* ── BREADCRUMB ── */}
        <div className="pdp-crumb">
          <div className="container pdp-crumb-inner">
            <span className="pdp-crumb-back" onClick={onBack}>
              <i className="fas fa-arrow-left" style={{ fontSize: 10 }}></i> Back
            </span>
            <i className="fas fa-chevron-right pdp-crumb-sep"></i>
            <span className="pdp-crumb-cat" onClick={onBack}>{product._cat}</span>
            <i className="fas fa-chevron-right pdp-crumb-sep"></i>
            <span className="pdp-crumb-name">{product.name}</span>
          </div>
        </div>

        <div className="container">
          <div className="pdp-body">

            {/* ════════════════════════════════
                LEFT — sticky: thumbs + image
            ════════════════════════════════ */}
            <div className="pdp-left">

              {/* Thumbnail strip */}
              <div className="pdp-thumbs">
                {[0,1,2,3,4].map((i) => (
                  <div
                    key={i}
                    className={`pdp-thumb${activeThumb === i ? " active" : ""}`}
                    onClick={() => setActiveThumb(i)}
                  >
                    <img src={product.imageUrl} alt="" />
                  </div>
                ))}
              </div>

              {/* Main image card */}
              <div className="pdp-imgcard">
                {discountPct && <div className="pdp-disc-badge">-{discountPct}% Off</div>}

                <div className="pdp-icon-col">
                  <button
                    className={`pdp-icon-btn${isWished ? " wished" : ""}`}
                    onClick={() => toggleWishlist && toggleWishlist(product)}
                    title={isWished ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <i className={isWished ? "fas fa-heart" : "far fa-heart"}></i>
                  </button>
                  <button className="pdp-icon-btn" onClick={handleShare} title="Share">
                    <i className="fas fa-share-alt"></i>
                  </button>
                </div>

                {shareMsg && <div className="pdp-share-toast">{shareMsg}</div>}

                <div className="pdp-img-zone">
                  <img src={product.imageUrl} alt={product.name} className="pdp-bigimg" />
                </div>

                <button
                  className={`pdp-add-btn${qty > 0 ? " added" : ""}`}
                  onClick={() => onAddCart && onAddCart(product)}
                  style={{ width: "100%" }}
                >
                  {qty > 0
                    ? <><i className="fas fa-check"></i> Added to Basket ({qty})</>
                    : <><i className="fas fa-shopping-cart"></i> Add to Basket</>
                  }
                </button>
              </div>

            </div>
            {/* end left */}

            {/* ════════════════════════════════
                RIGHT — scrollable: info + coupons + highlights + product info
            ════════════════════════════════ */}
            <div className="pdp-right">

              {/* Info card */}
              <div className="pdp-infocard">
                <span className="pdp-cat-tag">{product._cat}</span>
                <h1 className="pdp-pname">{product.name}</h1>

                <div className="pdp-meta">
                  {product.brand && (
                    <span className="pdp-by">By <strong>{product.brand}</strong></span>
                  )}
                  {product.stars && (
                    <span className="pdp-star">
                      ⭐ {product.stars}
                      {product.reviews && <span>({product.reviews} reviews)</span>}
                    </span>
                  )}
                </div>

                <div className="pdp-prices">
                  <span className="pdp-price">{product.price}</span>
                  {product.oldPrice && <span className="pdp-oldprice">{product.oldPrice}</span>}
                  {discountPct && <span className="pdp-savepill">{discountPct}% off</span>}
                </div>
                <p className="pdp-taxnote">Inclusive of all taxes</p>

                <div className="pdp-pills">
                  {[
                    { icon: "fa-truck",      text: "Free Delivery" },
                    { icon: "fa-undo-alt",   text: "Easy Returns"  },
                    { icon: "fa-shield-alt", text: "100% Genuine"  },
                    { icon: "fa-bolt",       text: "Fast Dispatch" },
                  ].map((b, i) => (
                    <span key={i} className="pdp-pill">
                      <i className={`fas ${b.icon}`}></i> {b.text}
                    </span>
                  ))}
                </div>

                <hr className="pdp-divider" />

                {/* Coupons */}
                <p className="pdp-coup-head">
                  <i className="fas fa-tag" style={{ color: "#1d5ba0" }}></i>
                  Available Coupons
                </p>
                {displayed.map((c, i) => (
                  <div key={i} className="pdp-coup-item" onClick={() => copyCode(c.code)}>
                    <span className={`pdp-coup-code${copiedCode === c.code ? " copied" : ""}`}>
                      {copiedCode === c.code ? "✓ Copied" : c.code}
                    </span>
                    <span className="pdp-coup-text">{c.text}</span>
                    <i className="fas fa-chevron-right pdp-coup-arrow"></i>
                  </div>
                ))}
                <button className="pdp-coup-more" onClick={() => setShowAllCoupons(!showAllCoupons)}>
                  {showAllCoupons ? "▲ Show less" : `+ ${allCoupons.length - 5} more coupons`}
                </button>
              </div>

              {/* Highlights */}
              <div className="pdp-bcard">
                <h2 className="pdp-bcard-title">Highlights</h2>
                {[
                  { label: "Brand",     value: product.brand || "—" },
                  { label: "Category",  value: product._cat },
                  { label: "Price",     value: product.price },
                  { label: "Packaging", value: "Standard" },
                  { label: "Country",   value: "India" },
                ].map((row, i) => (
                  <div key={i} className="pdp-trow">
                    <span className="pdp-tlabel">{row.label}</span>
                    <span className="pdp-tvalue">{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Product Information */}
              <div className="pdp-bcard">
                <h2 className="pdp-bcard-title">Product Information</h2>
                <p className="pdp-desc">
                  <strong>{product.name}</strong> by {product.brand || "Prime Basket"} is a quality
                  product in the <span style={{ textTransform: "capitalize" }}>{product._cat}</span> category.
                  Sourced fresh and delivered directly to your doorstep.
                </p>
                <p className="pdp-desc" style={{ fontSize: 12 }}>
                  <strong>Disclaimer:</strong> Images are for representational purposes only. Please read the label before use.
                </p>
                {[
                  { label: "Customer Care", value: "support@primebasket.com", link: true },
                  { label: "Seller",        value: "Prime Basket Retail Pvt. Ltd." },
                  { label: "Shelf Life",    value: "Check product label" },
                ].map((row, i) => (
                  <div key={i} className="pdp-trow">
                    <span className="pdp-tlabel">{row.label}</span>
                    <span className={row.link ? "pdp-tlink" : "pdp-tvalue"}>{row.value}</span>
                  </div>
                ))}
              </div>

            </div>
            {/* end right */}

          </div>

          {/* ── SIMILAR PRODUCTS ── */}
          <div className="pdp-similar products-section" style={{ paddingTop: 0 }}>
            <div className="sec-header">
              <div className="sec-title">Similar Products</div>
            </div>
            {loadingSimilar ? (
              <div className="products-grid" style={{ gridTemplateColumns: "repeat(5,1fr)" }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} style={{ background: "#fff", borderRadius: 10, height: 240, animation: "pulse 1.4s infinite" }} />
                ))}
              </div>
            ) : similar.length > 0 ? (
              <div className="products-grid" style={{ gridTemplateColumns: "repeat(5,1fr)" }}>
                {similar.map((item, i) => {
                  const simInCart = cart.find((c) => c._uid === item._uid);
                  const simQty   = simInCart ? simInCart.quantity : 0;
                  const simWish  = wishlist.some((w) => w._uid === item._uid);
                  return (
                    <div
                      key={item._uid}
                      className="pcard"
                      style={{ cursor: "pointer" }}
                      onClick={() => window.dispatchEvent(new CustomEvent("open-product", { detail: item }))}
                    >
                      <span className={`pbadge ${BADGE_CLS[i % BADGE_CLS.length]}`}>
                        {item.oldPrice ? "Sale" : "New"}
                      </span>
                      <button
                        className="pwish"
                        style={simWish ? { opacity: 1, background: "var(--red)", color: "#fff" } : {}}
                        onClick={(e) => { e.stopPropagation(); toggleWishlist && toggleWishlist(item); }}
                      >
                        <i className={simWish ? "fas fa-heart" : "far fa-heart"}></i>
                      </button>
                      <div className="pimg"><img src={item.imageUrl} alt={item.name} loading="lazy" /></div>
                      <div className="pbrand">{item.brand}</div>
                      <div className="pname">{item.name}</div>
                      {item.stars && (
                        <div className="pstars">⭐ {item.stars} {item.reviews && <span>({item.reviews})</span>}</div>
                      )}
                      <div className="pprice">
                        <span className="pnew">{item.price}</span>
                        {item.oldPrice && <span className="pold">{item.oldPrice}</span>}
                      </div>
                      <button
                        className="padd"
                        onClick={(e) => { e.stopPropagation(); onAddCart && onAddCart(item); }}
                      >
                        {simQty > 0
                          ? <><i className="fas fa-check"></i> Added ({simQty})</>
                          : <><i className="fas fa-shopping-cart"></i> Add</>
                        }
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>

        </div>
      </div>
    </>
  );
}