// src/components/Header.jsx
import { useState, useEffect, useRef } from "react";
import SearchBox from "./SearchBox";

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

export default function Header({
  onAccountClick, isLoggedIn, user,
  onCategorySelect, onLogoClick,
  cartCount = 0, wishlistCount = 0,
  onCartClick, onWishlistClick,
  onOpenProduct,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [drawerOpen, setDrawerOpen]     = useState(false);
  const [scrolled, setScrolled]         = useState(false);
  const browseRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (browseRef.current && !browseRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const toggleDrawer = () => {
    setDrawerOpen((prev) => !prev);
    document.body.style.overflow = drawerOpen ? "" : "hidden";
  };

  const handleCategoryClick = (e, value) => {
    e.preventDefault();
    setDropdownOpen(false);
    setDrawerOpen(false);
    document.body.style.overflow = "";
    if (onCategorySelect) onCategorySelect(value);
  };

  const Badge = ({ count }) => (
    <span className="badge" style={count > 0 ? { background: "#e53e3e", color: "#fff" } : {}}>
      {count > 99 ? "99+" : count}
    </span>
  );

  const AccountButton = () => (
    <a href="#" className="nav-icon-btn"
      onClick={(e) => { e.preventDefault(); if (onAccountClick) onAccountClick(); }}
      title={isLoggedIn ? (user?.name || "My Account") : "Sign In"}
    >
      {isLoggedIn ? (
        <span className="icon-wrap" style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <i className="fas fa-user-circle" style={{ fontSize: "24px", color: "#1d5ba0", lineHeight: 1 }}></i>
          <span style={{ position: "absolute", bottom: 0, right: "-2px", width: 8, height: 8, background: "#22c55e", borderRadius: "50%", border: "1.5px solid #fff" }} />
        </span>
      ) : (
        <span className="icon-wrap"><i className="fas fa-user"></i></span>
      )}
      <span className="label" style={isLoggedIn ? { color: "#1d5ba0", fontWeight: 700 } : {}}>
        {isLoggedIn ? "Account" : "Login"}
      </span>
    </a>
  );

  const CategoryLinks = () => (
    <>
      {CATEGORIES.map((cat) => (
        <a key={cat.value} href="#" onClick={(e) => handleCategoryClick(e, cat.value)}>
          <i className={`fas ${cat.icon}`}></i> {cat.label}
        </a>
      ))}
    </>
  );

  return (
    <header id="navbar" className={scrolled ? "scrolled" : ""}>
      <div className="nav-inner">

        {/* LEFT: Logo */}
        <div className="nav-left">
          <a href="#" className="logo" onClick={(e) => { e.preventDefault(); if (onLogoClick) onLogoClick(); }}>
            <div className="logo-icon">
              <img src="assets/logo watermark.png" alt="logo" />
            </div>
            <span className="logo-text">PRIME-BASKET</span>
          </a>
        </div>

        {/* CENTER: Browse + Search */}
        <div className="nav-center">
          <div className="browse-wrapper" ref={browseRef}>
            <button
              className={`browse-btn${dropdownOpen ? " open" : ""}`}
              aria-expanded={dropdownOpen}
              onClick={(e) => { e.stopPropagation(); setDropdownOpen((prev) => !prev); }}
            >
              <span className="bar-icon"><span></span><span></span><span></span></span>
              Browse All Categories
              <i className="fa fa-chevron-down chevron"></i>
            </button>
            <nav className={`dropdown-menu${dropdownOpen ? " open" : ""}`} role="menu">
              <CategoryLinks />
            </nav>
          </div>
          <br />
          <div className="search-wrapper">
            <SearchBox onCategorySelect={onCategorySelect} onOpenProduct={onOpenProduct} />
          </div>
        </div>

        {/* RIGHT: Nav Icons */}
        <div className="nav-right">
          <div className="nav-icons">
            <a href="#" className="nav-icon-btn">
              <span className="icon-wrap"><i className="far fa-bell"></i><span className="badge">0</span></span>
              <span className="label">Notifications</span>
            </a>

            {/* Wishlist — clickable */}
            <a href="#" className="nav-icon-btn"
              onClick={(e) => { e.preventDefault(); if (onWishlistClick) onWishlistClick(); }}
            >
              <span className="icon-wrap"><i className="fas fa-heart"></i><Badge count={wishlistCount} /></span>
              <span className="label">Wishlist</span>
            </a>

            {/* Cart — clickable */}
            <a href="#" className="nav-icon-btn"
              onClick={(e) => { e.preventDefault(); if (onCartClick) onCartClick(); }}
            >
              <span className="icon-wrap"><i className="fas fa-shopping-cart"></i><Badge count={cartCount} /></span>
              <span className="label">Basket</span>
            </a>

            <AccountButton />
          </div>
        </div>

        {/* Hamburger */}
        <button className={`hamburger${drawerOpen ? " open" : ""}`} aria-label="Toggle menu" aria-expanded={drawerOpen} onClick={toggleDrawer}>
          <span></span><span></span><span></span>
        </button>
      </div>

      {/* Mobile Drawer */}
      <div className={`mobile-drawer${drawerOpen ? " open" : ""}`}>
        <div className="mobile-search">
          <SearchBox onCategorySelect={(cat) => { setDrawerOpen(false); document.body.style.overflow = ""; onCategorySelect && onCategorySelect(cat); }} onOpenProduct={(prod) => { setDrawerOpen(false); document.body.style.overflow = ""; onOpenProduct && onOpenProduct(prod); }} mobile />
        </div>
        <div className="mobile-nav-icons">
          <a href="#" className="nav-icon-btn">
            <span className="icon-wrap"><i className="far fa-bell"></i><span className="badge">0</span></span>
            <span className="label">Notifications</span>
          </a>
          <a href="#" className="nav-icon-btn"
            onClick={(e) => { e.preventDefault(); setDrawerOpen(false); document.body.style.overflow = ""; if (onWishlistClick) onWishlistClick(); }}
          >
            <span className="icon-wrap"><i className="fas fa-heart"></i><Badge count={wishlistCount} /></span>
            <span className="label">Wishlist</span>
          </a>
          <a href="#" className="nav-icon-btn"
            onClick={(e) => { e.preventDefault(); setDrawerOpen(false); document.body.style.overflow = ""; if (onCartClick) onCartClick(); }}
          >
            <span className="icon-wrap"><i className="fas fa-shopping-cart"></i><Badge count={cartCount} /></span>
            <span className="label">Cart</span>
          </a>
          <AccountButton />
        </div>
        <div className="mobile-categories">
          <p>Browse Categories</p>
          <CategoryLinks />
        </div>
      </div>
    </header>
  );
}