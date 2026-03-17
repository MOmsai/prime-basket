// src/pages/CategoryPage.jsx
import { useEffect, useState, useMemo } from "react";
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

const SORT_OPTIONS = [
  { value: "default",       label: "Default" },
  { value: "price_asc",     label: "Price: Low → High" },
  { value: "price_desc",    label: "Price: High → Low" },
  { value: "top_rated",     label: "Top Rated" },
  { value: "whats_new",     label: "What's New" },
  { value: "best_discount", label: "Best Discount" },
];

// Parse price string like "₹45.00" or "45" → number
function parsePrice(val) {
  if (typeof val === "number") return val;
  return parseFloat(String(val || "").replace(/[^0-9.]/g, "")) || 0;
}

// Calculate discount % between oldPrice and price
function calcDiscount(price, oldPrice) {
  const p = parsePrice(price);
  const o = parsePrice(oldPrice);
  if (!o || !p || o <= p) return 0;
  return Math.round(((o - p) / o) * 100);
}

export default function CategoryPage({
  category, onCategoryChange, onBack,
  onAddCart, onOpenProduct,
  cart = [], wishlist = [], toggleWishlist,
}) {
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);

  // ── Filter state ──────────────────────────────────────────────────────────
  const [brandSearch, setBrandSearch]       = useState("");
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange]         = useState([0, 5000]);
  const [discountRange, setDiscountRange]   = useState([0, 50]);
  const [sortBy, setSortBy]                 = useState("default");
  const [sortOpen, setSortOpen]             = useState(false);
  const [filterOpen, setFilterOpen]         = useState(false); // mobile

  const activeLabel = CATEGORIES.find((c) => c.value === category)?.label || category;

  // ── Load products from Firebase ───────────────────────────────────────────
  useEffect(() => {
    if (!category) return;
    setLoading(true);
    setProducts([]);
    // Reset filters on category change
    setSelectedBrands([]);
    setBrandSearch("");
    setPriceRange([0, 5000]);
    setDiscountRange([0, 50]);
    setSortBy("default");

    get(ref(database, "categories/" + category)).then((snap) => {
      const data = snap.val();
      setProducts(
        data
          ? Object.values(data).map((p, i) => ({
              ...p,
              _cat:   category,
              _index: i,
              _uid:   `${category}_${i}`,
              _price: parsePrice(p.price),
              _oldPrice: parsePrice(p.oldPrice),
              _discount: calcDiscount(p.price, p.oldPrice),
            }))
          : []
      );
      setLoading(false);
    });
  }, [category]);

  // ── Derived: price bounds from loaded products ────────────────────────────
  const priceBounds = useMemo(() => {
    if (!products.length) return [0, 5000];
    const prices = products.map((p) => p._price).filter(Boolean);
    if (!prices.length) return [0, 5000];
    return [0, Math.ceil(Math.max(...prices) / 100) * 100];
  }, [products]);

  // Set price range to actual bounds when products load
  useEffect(() => {
    setPriceRange(priceBounds);
  }, [priceBounds]);

  // ── Derived: brand list with counts ──────────────────────────────────────
  const brandList = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      if (p.brand) map[p.brand] = (map[p.brand] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [products]);

  const filteredBrands = brandList.filter((b) =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  // ── Apply filters + sort ─────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Brand filter
    if (selectedBrands.length > 0) {
      list = list.filter((p) => selectedBrands.includes(p.brand));
    }

    // Price range
    list = list.filter(
      (p) => p._price >= priceRange[0] && p._price <= priceRange[1]
    );

    // Discount range
    list = list.filter(
      (p) => p._discount >= discountRange[0] && p._discount <= discountRange[1]
    );

    // Sort
    switch (sortBy) {
      case "price_asc":
        list.sort((a, b) => a._price - b._price);
        break;
      case "price_desc":
        list.sort((a, b) => b._price - a._price);
        break;
      case "top_rated":
        list.sort((a, b) => (b.stars || 0) - (a.stars || 0));
        break;
      case "whats_new":
        list.sort((a, b) => b._index - a._index);
        break;
      case "best_discount":
        list.sort((a, b) => b._discount - a._discount);
        break;
      default:
        break;
    }

    return list;
  }, [products, selectedBrands, priceRange, discountRange, sortBy]);

  // ── Active filter tags ────────────────────────────────────────────────────
  const activeTags = useMemo(() => {
    const tags = [];
    if (selectedBrands.length > 0) {
      selectedBrands.forEach((b) => tags.push({ key: `brand_${b}`, label: b, onRemove: () => setSelectedBrands((prev) => prev.filter((x) => x !== b)) }));
    }
    if (priceRange[0] !== priceBounds[0] || priceRange[1] !== priceBounds[1]) {
      tags.push({ key: "price", label: `₹${priceRange[0]} – ₹${priceRange[1]}`, onRemove: () => setPriceRange(priceBounds) });
    }
    if (discountRange[0] !== 0 || discountRange[1] !== 50) {
      tags.push({ key: "discount", label: `${discountRange[0]}%–${discountRange[1]}% off`, onRemove: () => setDiscountRange([0, 50]) });
    }
    return tags;
  }, [selectedBrands, priceRange, discountRange, priceBounds]);

  const clearAllFilters = () => {
    setSelectedBrands([]);
    setBrandSearch("");
    setPriceRange(priceBounds);
    setDiscountRange([0, 50]);
    setSortBy("default");
  };

  const toggleBrand = (name) => {
    setSelectedBrands((prev) =>
      prev.includes(name) ? prev.filter((b) => b !== name) : [...prev, name]
    );
  };

  // ── Range slider helper (two-thumb) ──────────────────────────────────────
  function RangeSlider({ min, max, value, onChange, prefix = "", suffix = "" }) {
    const pct = (v) => ((v - min) / (max - min)) * 100;
    return (
      <div style={{ padding: "4px 0 12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, color: "#1d5ba0", marginBottom: 10 }}>
          <span>{prefix}{value[0]}{suffix}</span>
          <span>{prefix}{value[1]}{suffix}</span>
        </div>
        <div style={{ position: "relative", height: 20 }}>
          {/* Track background */}
          <div style={{ position: "absolute", top: 8, left: 0, right: 0, height: 4, background: "#e2e8f0", borderRadius: 4 }} />
          {/* Filled track */}
          <div style={{
            position: "absolute", top: 8, height: 4,
            left: `${pct(value[0])}%`,
            width: `${pct(value[1]) - pct(value[0])}%`,
            background: "#1d5ba0", borderRadius: 4,
          }} />
          {/* Min thumb */}
          <input type="range" min={min} max={max} value={value[0]}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (v < value[1]) onChange([v, value[1]]);
            }}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", opacity: 0, cursor: "pointer", height: 20, zIndex: value[0] > max - (max - min) * 0.1 ? 5 : 3 }}
          />
          {/* Max thumb */}
          <input type="range" min={min} max={max} value={value[1]}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (v > value[0]) onChange([value[0], v]);
            }}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", opacity: 0, cursor: "pointer", height: 20, zIndex: 4 }}
          />
          {/* Min handle */}
          <div style={{ position: "absolute", top: 3, left: `calc(${pct(value[0])}% - 7px)`, width: 14, height: 14, background: "#1d5ba0", border: "2.5px solid #fff", borderRadius: "50%", boxShadow: "0 1px 6px rgba(29,91,160,.35)", pointerEvents: "none", zIndex: 2 }} />
          {/* Max handle */}
          <div style={{ position: "absolute", top: 3, left: `calc(${pct(value[1])}% - 7px)`, width: 14, height: 14, background: "#1d5ba0", border: "2.5px solid #fff", borderRadius: "50%", boxShadow: "0 1px 6px rgba(29,91,160,.35)", pointerEvents: "none", zIndex: 2 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
          <span>{prefix}{min}{suffix}</span>
          <span>{prefix}{max}{suffix}</span>
        </div>
      </div>
    );
  }

  // ── Filter Sidebar panel ──────────────────────────────────────────────────
  const FilterPanel = () => (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>

      {/* Header */}
      <div style={{ padding: "14px 18px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8faff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontWeight: 800, fontSize: 14, color: "#253d4e" }}>
          <i className="fas fa-sliders-h" style={{ color: "#1d5ba0" }}></i> Filters
        </div>
        {activeTags.length > 0 && (
          <button onClick={clearAllFilters} style={{ background: "none", border: "none", color: "#e63946", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            Clear All
          </button>
        )}
      </div>

      {/* BRAND */}
      <div style={{ padding: "14px 18px", borderBottom: "1px solid #f0f3f9" }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#253d4e", textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 10 }}>Brand</div>
        <div style={{ position: "relative", marginBottom: 10 }}>
          <i className="fas fa-search" style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "#b0bcce", fontSize: 11 }}></i>
          <input
            type="text"
            placeholder="Search brand..."
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
            style={{ width: "100%", padding: "7px 10px 7px 28px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 12, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ maxHeight: 180, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
          {filteredBrands.length === 0 ? (
            <div style={{ fontSize: 12, color: "#94a3b8", padding: "6px 0" }}>No brands found</div>
          ) : (
            filteredBrands.map(({ name, count }) => (
              <label key={name} style={{ display: "flex", alignItems: "center", gap: 9, padding: "5px 4px", cursor: "pointer", borderRadius: 6, transition: ".12s" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#f0f5ff"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(name)}
                  onChange={() => toggleBrand(name)}
                  style={{ accentColor: "#1d5ba0", width: 14, height: 14, cursor: "pointer", flexShrink: 0 }}
                />
                <span style={{ flex: 1, fontSize: 13, color: "#374151", fontWeight: selectedBrands.includes(name) ? 700 : 400 }}>{name}</span>
                <span style={{ fontSize: 11, color: "#94a3b8", background: "#f0f3f9", padding: "1px 7px", borderRadius: 20, fontWeight: 600 }}>{count}</span>
              </label>
            ))
          )}
        </div>
      </div>

      {/* PRICE RANGE */}
      <div style={{ padding: "14px 18px", borderBottom: "1px solid #f0f3f9" }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#253d4e", textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 6 }}>Price Range</div>
        <RangeSlider
          min={priceBounds[0]} max={priceBounds[1]}
          value={priceRange} onChange={setPriceRange}
          prefix="₹"
        />
      </div>

      {/* DISCOUNT RANGE */}
      <div style={{ padding: "14px 18px" }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#253d4e", textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 6 }}>Discount Range</div>
        <RangeSlider
          min={0} max={50}
          value={discountRange} onChange={setDiscountRange}
          suffix="%"
        />
      </div>
    </div>
  );

  // ── Sort dropdown ─────────────────────────────────────────────────────────
  const SortDropdown = () => (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setSortOpen((v) => !v)}
        style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 9, fontSize: 13, fontWeight: 700, color: "#253d4e", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 1px 4px rgba(0,0,0,.05)", transition: ".15s" }}
      >
        <i className="fas fa-sort-amount-down" style={{ color: "#1d5ba0", fontSize: 12 }}></i>
        Sort by: <span style={{ color: "#1d5ba0" }}>{SORT_OPTIONS.find((o) => o.value === sortBy)?.label}</span>
        <i className={`fas fa-chevron-${sortOpen ? "up" : "down"}`} style={{ fontSize: 10, color: "#94a3b8" }}></i>
      </button>
      {sortOpen && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,.12)", zIndex: 100, minWidth: 200, overflow: "hidden", animation: "fadeDown .15s ease" }}>
          {SORT_OPTIONS.map((opt) => (
            <div
              key={opt.value}
              onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
              style={{ padding: "10px 16px", fontSize: 13, fontWeight: sortBy === opt.value ? 700 : 400, color: sortBy === opt.value ? "#1d5ba0" : "#374151", background: sortBy === opt.value ? "#e8f0fb" : "transparent", cursor: "pointer", transition: ".12s", display: "flex", alignItems: "center", justifyContent: "space-between" }}
              onMouseEnter={(e) => { if (sortBy !== opt.value) e.currentTarget.style.background = "#f0f5ff"; }}
              onMouseLeave={(e) => { if (sortBy !== opt.value) e.currentTarget.style.background = "transparent"; }}
            >
              {opt.label}
              {sortBy === opt.value && <i className="fas fa-check" style={{ fontSize: 11, color: "#1d5ba0" }}></i>}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ background: "#f2f3f4", minHeight: "100vh", paddingBottom: 40 }} onClick={() => sortOpen && setSortOpen(false)}>
      <style>{`
        @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes fadeDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        @media(max-width:1200px){ .cat-page-wrap{ grid-template-columns:200px 1fr 200px !important; } }
        @media(max-width:960px) { .cat-page-wrap{ grid-template-columns:180px 1fr !important; } .cat-right-col{ display:none !important; } .mobile-filter-btn{ display:flex !important; } }
        @media(max-width:700px) { .cat-page-wrap{ grid-template-columns:1fr !important; } .cat-left-col{ display:none !important; } }
        @media(max-width:768px) { .products-grid{ grid-template-columns:repeat(2,1fr) !important; } }
        .filter-drawer { display:none; position:fixed; inset:0; z-index:1000; }
        @media(max-width:960px){ .filter-drawer.open{ display:flex !important; } }
        ::-webkit-scrollbar{ width:4px; } ::-webkit-scrollbar-track{ background:transparent; } ::-webkit-scrollbar-thumb{ background:#d0daf0; border-radius:4px; }
      `}</style>

      {/* Breadcrumb */}
      <div style={{ background: "#fff", borderBottom: "1px solid #ececec", padding: "12px 0" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#7e7e7e" }}>
          <span onClick={onBack} style={{ color: "#1d5ba0", fontWeight: 600, cursor: "pointer" }}>Home</span>
          <i className="fas fa-chevron-right" style={{ fontSize: 10 }}></i>
          <span style={{ color: "#253d4e", fontWeight: 700 }}>{activeLabel}</span>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 24 }}>
        <div className="cat-page-wrap" style={{ display: "grid", gridTemplateColumns: "220px 1fr 240px", gap: 22, alignItems: "start" }}>

          {/* ── LEFT COLUMN: All Categories only ── */}
          <div className="cat-left-col">
            <div className="cat-box">
              <h3>All Categories</h3>
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.value}
                  className="cat-item"
                  onClick={() => onCategoryChange(cat.value)}
                  style={cat.value === category
                    ? { color: "#1d5ba0", fontWeight: 700, background: "#e8f0fb", borderRadius: 6, padding: "8px 8px", marginBottom: 2 }
                    : { cursor: "pointer" }}
                >
                  <div className="cat-item-l">
                    <div className="cicon"><i className={`fas ${cat.icon}`}></i></div>
                    {cat.label}
                  </div>
                  {cat.value === category && <i className="fas fa-chevron-right" style={{ fontSize: 10, color: "#1d5ba0" }}></i>}
                </div>
              ))}
            </div>
          </div>

          {/* ── MIDDLE: Products ── */}
          <main>

            {/* Header bar */}
            <div style={{ background: "#fff", borderRadius: 10, padding: "14px 20px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 8px rgba(0,0,0,.05)", gap: 12, flexWrap: "wrap" }}>
              <div>
                <h2 style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 20, fontWeight: 800, color: "#253d4e", margin: 0 }}>{activeLabel}</h2>
                {!loading && (
                  <p style={{ fontSize: 12, color: "#7e7e7e", marginTop: 3, marginBottom: 0 }}>
                    <strong style={{ color: "#1d5ba0" }}>{filteredProducts.length}</strong> product{filteredProducts.length !== 1 ? "s" : ""} found
                    {activeTags.length > 0 && <span style={{ color: "#94a3b8" }}> (filtered from {products.length})</span>}
                  </p>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {/* Mobile filter button */}
                <button
                  className="mobile-filter-btn"
                  onClick={(e) => { e.stopPropagation(); setFilterOpen(true); }}
                  style={{ display: "none", alignItems: "center", gap: 6, padding: "8px 14px", background: "#1d5ba0", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                >
                  <i className="fas fa-sliders-h"></i> Filters
                  {activeTags.length > 0 && (
                    <span style={{ background: "#fff", color: "#1d5ba0", borderRadius: 20, padding: "1px 7px", fontSize: 11, fontWeight: 800 }}>{activeTags.length}</span>
                  )}
                </button>
                <div onClick={(e) => e.stopPropagation()}>
                  <SortDropdown />
                </div>
              </div>
            </div>

            {/* Active filter tags */}
            {activeTags.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>ACTIVE:</span>
                {activeTags.map((tag) => (
                  <span key={tag.key} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#e8f0fb", color: "#1d5ba0", fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 20, border: "1px solid #c3d4f0" }}>
                    {tag.label}
                    <button onClick={tag.onRemove} style={{ background: "none", border: "none", color: "#1d5ba0", cursor: "pointer", padding: 0, fontSize: 12, display: "flex", alignItems: "center", lineHeight: 1 }}>
                      <i className="fas fa-times"></i>
                    </button>
                  </span>
                ))}
                <button onClick={clearAllFilters} style={{ fontSize: 12, fontWeight: 700, color: "#e63946", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: "4px 6px" }}>
                  Clear all
                </button>
              </div>
            )}

            {/* Product Grid */}
            {loading ? (
              <div className="products-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} style={{ background: "#fff", borderRadius: 10, height: 240, animation: "pulse 1.4s infinite" }} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ background: "#fff", borderRadius: 12, padding: "60px 20px", textAlign: "center" }}>
                <i className="fas fa-filter" style={{ fontSize: 40, color: "#d0d8e4", marginBottom: 14, display: "block" }}></i>
                <p style={{ fontWeight: 700, color: "#253d4e", marginBottom: 8 }}>No products match your filters</p>
                <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 18 }}>Try adjusting or clearing the filters</p>
                <button onClick={clearAllFilters} style={{ background: "#1d5ba0", color: "#fff", border: "none", borderRadius: 8, padding: "10px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="products-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
                {filteredProducts.map((item) => {
                  const inCart   = cart.find((c) => c._uid === item._uid);
                  const qty      = inCart ? inCart.quantity : 0;
                  const isWished = wishlist.some((w) => w._uid === item._uid);
                  const disc     = item._discount;
                  return (
                    <div
                      key={item._uid}
                      className="pcard"
                      style={{ cursor: "pointer" }}
                      onClick={() => onOpenProduct && onOpenProduct(item)}
                    >
                      {/* Badge — show discount % if available, else item.badge */}
                      {disc > 0 ? (
                        <span className="pbadge bo">-{disc}%</span>
                      ) : item.badge ? (
                        <span className="pbadge bo">{item.badge}</span>
                      ) : null}

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
                      {item.stars != null && (
                        <div className="pstars">⭐ {item.stars}{item.reviews && <span> ({item.reviews})</span>}</div>
                      )}
                      <div className="pprice">
                        <span className="pnew">{item.price}</span>
                        {item.oldPrice && <span className="pold">{item.oldPrice}</span>}
                      </div>
                      <button className="padd" onClick={(e) => { e.stopPropagation(); onAddCart && onAddCart(item); }}>
                        {qty > 0
                          ? <><i className="fas fa-check"></i> Added ({qty})</>
                          : <><i className="fas fa-shopping-cart"></i> Add</>
                        }
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </main>

          {/* ── RIGHT COLUMN: Filters ── */}
          <div className="cat-right-col" style={{ position: "sticky", top: 88 }}>
            {!loading && <FilterPanel />}
          </div>

        </div>
      </div>

      {/* ── Mobile Filter Drawer ── */}
      <div className={`filter-drawer${filterOpen ? " open" : ""}`}>
        {/* Overlay */}
        <div onClick={() => setFilterOpen(false)} style={{ flex: 1, background: "rgba(0,0,0,0.4)" }} />
        {/* Panel */}
        <div style={{ width: 300, background: "#f8faff", overflowY: "auto", boxShadow: "-4px 0 20px rgba(0,0,0,.15)", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px 18px", background: "#1d5ba0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>
              <i className="fas fa-sliders-h" style={{ marginRight: 8 }}></i>Filters
            </span>
            <button onClick={() => setFilterOpen(false)} style={{ background: "rgba(255,255,255,.2)", border: "none", color: "#fff", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 14 }}>✕</button>
          </div>
          <div style={{ padding: 14 }}>
            <FilterPanel />
          </div>
          <div style={{ padding: "12px 18px", borderTop: "1px solid #e2e8f0", display: "flex", gap: 10, marginTop: "auto" }}>
            <button onClick={() => { clearAllFilters(); setFilterOpen(false); }} style={{ flex: 1, padding: "10px", background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", color: "#374151" }}>Clear All</button>
            <button onClick={() => setFilterOpen(false)} style={{ flex: 1, padding: "10px", background: "#1d5ba0", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", color: "#fff" }}>Show Results ({filteredProducts.length})</button>
          </div>
        </div>
      </div>
    </div>
  );
}