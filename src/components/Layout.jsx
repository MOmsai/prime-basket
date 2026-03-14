// src/components/Layout.jsx
import TopBar from "./TopBar";
import Header from "./Header";
import Footer from "./Footer";
import ChatbotWidget from "./ChatbotWidget";

export default function Layout({
  children,
  onAccountClick, isLoggedIn, user,
  onCategorySelect, onLogoClick,
  cartCount = 0, wishlistCount = 0,
  onCartClick, onWishlistClick,
  onOpenProduct,
  onFooterNavigate,
  // Cart/wishlist state for chatbot
  cart = [],
  wishlist = [],
  onAddToCart,
  toggleWishlist,
  onRemoveFromCart,
  onUpdateCartQty,
  onClearCart,
}) {
  return (
    <>
      <TopBar />
      <Header
        onAccountClick={onAccountClick}
        isLoggedIn={isLoggedIn}
        user={user}
        onCategorySelect={onCategorySelect}
        onLogoClick={onLogoClick}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        onCartClick={onCartClick}
        onWishlistClick={onWishlistClick}
        onOpenProduct={onOpenProduct}
      />
      <main>{children}</main>
      <Footer onNavigate={onFooterNavigate} />

      <ChatbotWidget
        onGoCart={onCartClick}
        onGoWishlist={onWishlistClick}
        cart={cart}
        wishlist={wishlist}
        onAddToCart={onAddToCart}
        toggleWishlist={toggleWishlist}
        onRemoveFromCart={onRemoveFromCart}
        onUpdateCartQty={onUpdateCartQty}
        onClearCart={onClearCart}
      />
    </>
  );
}