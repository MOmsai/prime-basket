// src/App.jsx
import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import HeroSlider from "./components/HeroSlider";
import PhoneAuthModal from "./components/PhoneAuthModal";
import HomePage from "./pages/HomePage";
import AccountPage from "./pages/AccountPage";
import CategoryPage from "./pages/CategoryPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import WishlistPage from "./pages/WishlistPage";
import PaymentPage from "./pages/PaymentPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import UnderDevelopmentPage from "./pages/UnderDevelopmentPage";

export default function App() {
  const { isAuthenticated, user, login } = useAuth();

  // ── Navigation state ──
  const [page, setPage]                         = useState("home");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct]   = useState(null);

  // ── Payment & Order state ──
  const [checkoutData, setCheckoutData] = useState(null);
  const [orderData, setOrderData]       = useState(null);
  const [orders, setOrders]             = useState(() => {
    try { return JSON.parse(localStorage.getItem("pb_orders") || "[]"); } catch { return []; }
  });
  const [accountSection, setAccountSection] = useState("profile");

  // ── Cart & Wishlist ──
  const [cart, setCart]         = useState([]);
  const [wishlist, setWishlist] = useState([]);

  // ── Modal ──
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // ── Under-development page ──
  const [underDevLabel, setUnderDevLabel] = useState("");

  // Scroll to top on every page change
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [page, selectedProduct]);

  // Listen for product-open events fired from ProductDetailPage similar cards
  useEffect(() => {
    const handler = (e) => openProduct(e.detail);
    window.addEventListener("open-product", handler);
    return () => window.removeEventListener("open-product", handler);
  }, []);

  // Listen for footer under-development link clicks
  useEffect(() => {
    const handler = (e) => {
      setUnderDevLabel(e.detail?.label || "");
      setPage("under-dev");
    };
    window.addEventListener("open-under-dev", handler);
    return () => window.removeEventListener("open-under-dev", handler);
  }, []);

  // ── Navigation helpers ──
  const goHome     = () => { setPage("home"); setSelectedCategory(null); setSelectedProduct(null); };
  const goCategory = (cat) => { setSelectedCategory(cat); setSelectedProduct(null); setPage("category"); };
  const openProduct = (product) => { setSelectedProduct(product); setPage("product"); };
  const goCart     = () => setPage("cart");
  const goWishlist = () => setPage("wishlist");

  const goCheckout = (data) => {
    setCheckoutData(data);
    setPage("payment");
  };

  const handlePaymentSuccess = (order) => {
    const newOrder = {
      ...order,
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      status: order.method === "cod" ? "Confirmed" : "Processing",
    };
    const updated = [newOrder, ...orders];
    setOrders(updated);
    localStorage.setItem("pb_orders", JSON.stringify(updated));
    setOrderData(newOrder);
    setCart([]);
    localStorage.removeItem("pb_cart");
    setPage("order-success");
  };

  // ── Cart helpers ──
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item._uid === product._uid);
      if (existing) return prev.map((item) => item._uid === product._uid ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    showToast("Item added to cart!");
  };

  const removeFromCart = (uid) => setCart((prev) => prev.filter((i) => i._uid !== uid));

  const updateCartQty = (uid, qty) => {
    if (qty <= 0) removeFromCart(uid);
    else setCart((prev) => prev.map((i) => i._uid === uid ? { ...i, quantity: qty } : i));
  };

  const clearCart = () => { setCart([]); localStorage.removeItem("pb_cart"); };

  // ── Wishlist helpers ──
  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.find((item) => item._uid === product._uid);
      if (exists) { showToast("Removed from wishlist!"); return prev.filter((item) => item._uid !== product._uid); }
      showToast("Added to wishlist!"); return [...prev, product];
    });
  };

  // ── Toast ──
  const showToast = (message) => {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
    setTimeout(() => { toast.style.opacity = "0"; toast.style.transform = "translateY(100px)"; }, 2200);
  };

  // ── Auth ──
  const handleLoginSuccess = (data) => {
    const userData = data?.user ?? { id: data?.id, name: data?.name || "User", phone: data?.phone || "", email: data?.email || "", role: data?.role || "CUSTOMER" };
    login(userData, { accessToken: data?.accessToken, refreshToken: data?.refreshToken });
    setIsLoginModalOpen(false);
  };

  const cartCount     = cart.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlist.length;

  // ── Render current page ──
  const renderPage = () => {

    if (page === "under-dev") {
      return <UnderDevelopmentPage label={underDevLabel} onGoHome={goHome} />;
    }

    if (page === "account" && isAuthenticated) {
      return <AccountPage user={user} onGoHome={goHome} orders={orders} initialSection={accountSection} onSectionChange={setAccountSection} />;
    }
    if (page === "cart") {
      return (
        <CartPage
          cart={cart}
          onUpdateQty={updateCartQty}
          onRemove={removeFromCart}
          onOpenProduct={openProduct}
          onContinueShopping={goHome}
          onGoAccount={() => { if (isAuthenticated) setPage("account"); else setIsLoginModalOpen(true); }}
          onCheckout={goCheckout}
        />
      );
    }
    if (page === "wishlist") {
      return (
        <WishlistPage
          wishlist={wishlist}
          cart={cart}
          toggleWishlist={toggleWishlist}
          onAddCart={addToCart}
          onOpenProduct={openProduct}
          onContinueShopping={goHome}
        />
      );
    }
    if (page === "payment" && checkoutData) {
      return (
        <PaymentPage
          cart={cart}
          total={checkoutData.total}
          delivery={checkoutData.delivery}
          address={checkoutData.address}
          onBack={goCart}
          onSuccess={handlePaymentSuccess}
        />
      );
    }
    if (page === "order-success" && orderData) {
      return (
        <OrderSuccessPage
          order={orderData}
          onGoHome={goHome}
          onGoOrders={() => {
            setAccountSection("orders");
            if (isAuthenticated) setPage("account");
            else setIsLoginModalOpen(true);
          }}
        />
      );
    }
    if (page === "category" && selectedCategory) {
      return (
        <CategoryPage
          category={selectedCategory}
          onCategoryChange={goCategory}
          onBack={goHome}
          onAddCart={addToCart}
          onOpenProduct={openProduct}
          cart={cart}
          wishlist={wishlist}
          toggleWishlist={toggleWishlist}
        />
      );
    }
    if (page === "product" && selectedProduct) {
      return (
        <ProductDetailPage
          product={selectedProduct}
          onBack={() => {
            if (selectedCategory) setPage("category");
            else goHome();
          }}
          onAddCart={addToCart}
          cart={cart}
          wishlist={wishlist}
          toggleWishlist={toggleWishlist}
        />
      );
    }
    // Default: home
    return (
      <>
        <HeroSlider />
        <HomePage
          onAddCart={addToCart}
          onCategorySelect={goCategory}
          onOpenProduct={openProduct}
          cart={cart}
          wishlist={wishlist}
          toggleWishlist={toggleWishlist}
        />
      </>
    );
  };

  return (
    <>
      <Layout
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        onAccountClick={() => { if (isAuthenticated) setPage("account"); else setIsLoginModalOpen(true); }}
        onCartClick={goCart}
        onWishlistClick={goWishlist}
        isLoggedIn={isAuthenticated}
        user={user}
        onCategorySelect={goCategory}
        onLogoClick={goHome}

        // Chatbot props
        cart={cart}
        wishlist={wishlist}
        onAddToCart={addToCart}
        toggleWishlist={toggleWishlist}
        onRemoveFromCart={removeFromCart}
        onUpdateCartQty={updateCartQty}
        onClearCart={clearCart}
        onOpenProduct={openProduct}
      >
        {renderPage()}
      </Layout>

      {/* TOAST */}
      <div id="toast" style={{
        opacity: 0, transform: "translateY(100px)", transition: "all 0.3s",
        position: "fixed", bottom: "24px", right: "24px",
        background: "#1d5ba0", color: "#fff", padding: "13px 22px",
        borderRadius: "10px", fontWeight: 700, fontSize: "13px",
        boxShadow: "0 8px 24px rgba(0,0,0,.2)", zIndex: 9999,
        display: "flex", alignItems: "center", gap: "8px",
      }}>
        <i className="fas fa-check-circle"></i> Item added to cart!
      </div>

      <PhoneAuthModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}