// src/components/ChatbotWidget.jsx
import React, { useState } from "react";
import ChatbotPage from "./ChatbotPage";

export default function ChatbotWidget({
  onGoCart,
  onGoWishlist,
  cart = [],
  wishlist = [],
  onAddToCart,
  toggleWishlist,
  onRemoveFromCart,
  onUpdateCartQty,
  onClearCart,
}) {
  const [open, setOpen] = useState(false);

  // Header height: TopBar (~40px) + Header (70px) = 110px
  const HEADER_HEIGHT = 110;

  return (
    <>
      {/* Floating toggle button — bottom right */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          title="PrimeBot Assistant"
          style={{
            position: "fixed",
            bottom: "28px",
            right: "28px",
            width: "58px",
            height: "58px",
            borderRadius: "50%",
            background: "#1d5ba0",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "26px",
            boxShadow: "0 4px 20px rgba(3,105,161,0.5)",
            zIndex: 99999,
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          💬
        </button>
      )}

      {/* Chat panel — anchored to top of viewport below header, extends down */}
      {open && (
        <div
          style={{
            position: "fixed",
            top: `${HEADER_HEIGHT}px`,
            bottom: "28px",
            right: "28px",
            width: "400px",
            zIndex: 99998,
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            animation: "chatSlideDown 0.3s ease-out",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <style>{`
            @keyframes chatSlideDown {
              from { opacity: 0; transform: translateY(-16px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          <ChatbotPage
            onGoCart={onGoCart}
            onGoWishlist={onGoWishlist}
            onClose={() => setOpen(false)}
            cart={cart}
            wishlist={wishlist}
            onAddToCart={onAddToCart}
            toggleWishlist={toggleWishlist}
            onRemoveFromCart={onRemoveFromCart}
            onUpdateCartQty={onUpdateCartQty}
            onClearCart={onClearCart}
          />
        </div>
      )}
    </>
  );
}