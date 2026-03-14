// src/pages/CartPage.jsx
import { useState, useEffect } from "react";
import { ADDRESSES_KEY } from "./AccountPage";

function loadAddresses() {
  try {
    const raw = localStorage.getItem(ADDRESSES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export default function CartPage({ cart, onUpdateQty, onRemove, onOpenProduct, onContinueShopping, onGoAccount, onCheckout }) {
  const subtotal = cart.reduce((sum, item) => {
    const price = parseFloat(String(item.price || "").replace(/[^0-9.]/g, "")) || 0;
    return sum + price * item.quantity;
  }, 0);
  const delivery = subtotal > 99 ? 0 : subtotal === 0 ? 0 : 49;
  const total = subtotal + delivery;

  const [addresses, setAddresses]         = useState(loadAddresses);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showAddForm, setShowAddForm]     = useState(false);
  const [newAddrText, setNewAddrText]     = useState("");
  const [newAddrType, setNewAddrType]     = useState("Home");

  // Re-sync from localStorage whenever cart page mounts or window regains focus
  useEffect(() => {
    const sync = () => setAddresses(loadAddresses());
    window.addEventListener("focus", sync);
    sync();
    return () => window.removeEventListener("focus", sync);
  }, []);

  const persistAddresses = (list) => {
    localStorage.setItem(ADDRESSES_KEY, JSON.stringify(list));
    setAddresses(list);
  };

  const handleAddAddress = () => {
    if (!newAddrText.trim()) return;
    if (addresses.length >= 5) { alert("Maximum 5 addresses allowed"); return; }
    const updated = [...addresses, { type: newAddrType, text: newAddrText }];
    persistAddresses(updated);
    setSelectedIndex(updated.length - 1);
    setNewAddrText("");
    setNewAddrType("Home");
    setShowAddForm(false);
  };

  const handleRemoveAddress = (i) => {
    const updated = addresses.filter((_, idx) => idx !== i);
    persistAddresses(updated);
    if (selectedIndex >= updated.length) setSelectedIndex(Math.max(0, updated.length - 1));
  };

  const selectedAddress = addresses[selectedIndex] || null;

  return (
    <>
      <style>{`
        .cart-page { background: var(--bg); min-height: 100vh; padding-bottom: 60px; }
        .cart-crumb { background:#fff; border-bottom:1px solid var(--border); padding:12px 0; }
        .cart-crumb-inner { display:flex; align-items:center; gap:8px; font-size:13px; color:var(--body); }
        .cart-crumb-back { color:#1d5ba0; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:6px; }
        .cart-crumb-back:hover { text-decoration:underline; }

        .cart-wrap { display:grid; grid-template-columns:1fr 340px; gap:24px; margin-top:28px; align-items:start; }
        @media(max-width:900px){ .cart-wrap { grid-template-columns:1fr; } }

        .cart-main { background:#fff; border-radius:14px; border:1px solid var(--border); overflow:hidden; box-shadow:var(--shadow); }
        .cart-main-header { padding:18px 24px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; }
        .cart-main-header h2 { font-family:'Quicksand',sans-serif; font-size:18px; font-weight:800; color:var(--dark); margin:0; }
        .cart-count-pill { background:#e8f0fb; color:#1d5ba0; font-size:12px; font-weight:700; padding:3px 10px; border-radius:20px; }

        .cart-item { display:grid; grid-template-columns:80px 1fr auto; gap:16px; padding:18px 24px; border-bottom:1px solid var(--border); align-items:center; transition:.2s; }
        .cart-item:last-child { border-bottom:none; }
        .cart-item:hover { background:#fafbff; }
        .cart-item-img { width:80px; height:80px; border-radius:10px; border:1px solid var(--border); padding:6px; background:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer; overflow:hidden; flex-shrink:0; }
        .cart-item-img img { max-width:100%; max-height:100%; object-fit:contain; }
        .cart-item-info { min-width:0; }
        .cart-item-brand { font-size:11px; font-weight:700; color:#1d5ba0; text-transform:uppercase; letter-spacing:.5px; margin-bottom:3px; }
        .cart-item-name { font-size:14px; font-weight:700; color:var(--dark); margin-bottom:6px; cursor:pointer; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .cart-item-name:hover { color:#1d5ba0; }
        .cart-item-price { font-size:15px; font-weight:800; color:#1d5ba0; font-family:'Quicksand',sans-serif; }
        .cart-item-oldprice { font-size:12px; color:var(--body); text-decoration:line-through; margin-left:6px; }
        .cart-item-right { display:flex; flex-direction:column; align-items:flex-end; gap:10px; flex-shrink:0; }
        .cart-qty-ctrl { display:flex; align-items:center; border:1.5px solid var(--border); border-radius:8px; overflow:hidden; }
        .cart-qty-btn { width:32px; height:32px; border:none; background:#f7f8fb; color:var(--dark); font-size:16px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:.15s; }
        .cart-qty-btn:hover { background:#e8f0fb; color:#1d5ba0; }
        .cart-qty-num { width:36px; height:32px; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; color:var(--dark); border-left:1px solid var(--border); border-right:1px solid var(--border); }
        .cart-remove-btn { background:none; border:none; font-size:12px; color:var(--body); cursor:pointer; display:flex; align-items:center; gap:5px; padding:0; font-family:inherit; transition:.15s; }
        .cart-remove-btn:hover { color:#e63946; }
        .cart-item-total { font-size:14px; font-weight:800; color:var(--dark); font-family:'Quicksand',sans-serif; }

        /* Address panel */
        .cart-addr-panel { background:#fff; border-radius:14px; border:1px solid var(--border); box-shadow:var(--shadow); margin-top:20px; overflow:hidden; }
        .cart-addr-header { padding:16px 24px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; }
        .cart-addr-header h3 { font-family:'Quicksand',sans-serif; font-size:16px; font-weight:800; color:var(--dark); margin:0; display:flex; align-items:center; gap:8px; }
        .cart-addr-header h3 i { color:#1d5ba0; }
        .cart-addr-manage { font-size:12px; font-weight:700; color:#1d5ba0; cursor:pointer; background:none; border:none; font-family:inherit; }
        .cart-addr-manage:hover { text-decoration:underline; }
        .cart-addr-list { padding:4px 24px 0; }
        .cart-addr-item { display:flex; align-items:flex-start; gap:12px; padding:14px 0; border-bottom:1px solid var(--border); cursor:pointer; }
        .cart-addr-item:last-child { border-bottom:none; }
        .cart-addr-radio { width:18px; height:18px; accent-color:#1d5ba0; margin-top:2px; flex-shrink:0; cursor:pointer; }
        .cart-addr-info { flex:1; min-width:0; }
        .cart-addr-type { font-size:12px; font-weight:800; color:#1d5ba0; text-transform:uppercase; letter-spacing:.5px; margin-bottom:3px; display:flex; align-items:center; gap:6px; }
        .cart-addr-text { font-size:13px; color:var(--dark); line-height:1.5; }
        .cart-addr-del { background:none; border:none; color:#e63946; cursor:pointer; font-size:13px; padding:2px 6px; transition:.15s; flex-shrink:0; border-radius:4px; }
        .cart-addr-del:hover { background:#fee2e2; }
        .cart-addr-empty { padding:20px 24px; text-align:center; }
        .cart-addr-empty p { color:var(--body); font-size:13px; margin-bottom:4px; }
        .cart-addr-add-btn { display:flex; align-items:center; gap:8px; padding:14px 24px; color:#1d5ba0; font-size:13px; font-weight:700; cursor:pointer; border-top:1px solid var(--border); background:none; border-left:none; border-right:none; border-bottom:none; width:100%; font-family:inherit; transition:.15s; }
        .cart-addr-add-btn:hover { background:#f0f5ff; }
        .cart-addr-form { padding:16px 24px; border-top:1px solid var(--border); background:#fafbff; display:flex; flex-direction:column; gap:10px; }
        .cart-addr-form select,
        .cart-addr-form input { padding:9px 12px; border:1.5px solid var(--border); border-radius:8px; font-family:inherit; font-size:13px; outline:none; background:#fff; transition:.2s; }
        .cart-addr-form select:focus,
        .cart-addr-form input:focus { border-color:#1d5ba0; }
        .cart-addr-form-btns { display:flex; gap:8px; }
        .cart-addr-save-btn { flex:1; background:#1d5ba0; color:#fff; border:none; border-radius:8px; padding:9px; font-size:13px; font-weight:700; cursor:pointer; font-family:inherit; }
        .cart-addr-save-btn:hover { background:#174d8a; }
        .cart-addr-cancel-btn { background:#e5e7eb; color:#374151; border:none; border-radius:8px; padding:9px 14px; font-size:13px; font-weight:700; cursor:pointer; font-family:inherit; }
        .cart-addr-cancel-btn:hover { background:#d1d5db; }

        .cart-empty { padding:80px 20px; text-align:center; }
        .cart-empty-icon { font-size:52px; color:#d0d8e4; margin-bottom:16px; }
        .cart-empty h3 { font-family:'Quicksand',sans-serif; font-size:20px; font-weight:800; color:var(--dark); margin-bottom:8px; }
        .cart-empty p { color:var(--body); font-size:14px; margin-bottom:24px; }
        .cart-empty-btn { background:#1d5ba0; color:#fff; border:none; border-radius:8px; padding:12px 28px; font-size:14px; font-weight:700; cursor:pointer; font-family:inherit; }
        .cart-empty-btn:hover { background:#174d8a; }

        .cart-summary { background:#fff; border-radius:14px; border:1px solid var(--border); box-shadow:var(--shadow); position:sticky; top:88px; overflow:hidden; }
        .cart-summary-header { padding:18px 24px; border-bottom:1px solid var(--border); }
        .cart-summary-header h3 { font-family:'Quicksand',sans-serif; font-size:16px; font-weight:800; color:var(--dark); margin:0; }
        .cart-summary-body { padding:20px 24px; }
        .cart-summary-row { display:flex; justify-content:space-between; align-items:center; padding:8px 0; font-size:14px; color:var(--body); border-bottom:1px solid var(--border); }
        .cart-summary-row:last-of-type { border-bottom:none; }
        .cart-summary-row.total { font-size:16px; font-weight:800; color:var(--dark); margin-top:4px; }
        .cart-summary-row .val { font-weight:700; color:var(--dark); }
        .cart-summary-row.total .val { color:#1d5ba0; font-size:18px; }
        .cart-free-tag { color:#16a34a; font-size:12px; font-weight:700; }
        .cart-deliver-to { font-size:12px; color:var(--body); padding:8px 0; border-bottom:1px solid var(--border); display:flex; align-items:flex-start; gap:6px; line-height:1.5; }
        .cart-deliver-to i { color:#1d5ba0; margin-top:2px; flex-shrink:0; }
        .cart-promo { display:flex; gap:8px; margin:16px 0; }
        .cart-promo input { flex:1; border:1.5px solid var(--border); border-radius:8px; padding:9px 12px; font-family:inherit; font-size:13px; outline:none; }
        .cart-promo input:focus { border-color:#1d5ba0; }
        .cart-promo-btn { background:#1d5ba0; color:#fff; border:none; border-radius:8px; padding:9px 14px; font-size:13px; font-weight:700; cursor:pointer; font-family:inherit; }
        .cart-promo-btn:hover { background:#174d8a; }
        .cart-checkout-btn { width:100%; background:#1d5ba0; color:#fff; border:none; border-radius:10px; padding:14px; font-size:15px; font-weight:800; cursor:pointer; font-family:'Quicksand',sans-serif; display:flex; align-items:center; justify-content:center; gap:8px; margin-top:4px; transition:.2s; }
        .cart-checkout-btn:hover:not(:disabled) { background:#174d8a; transform:translateY(-1px); box-shadow:0 6px 20px rgba(29,91,160,.25); }
        .cart-checkout-btn:disabled { background:#aab4cc; cursor:not-allowed; }
        .cart-safe { display:flex; align-items:center; justify-content:center; gap:6px; font-size:11px; color:var(--body); margin-top:12px; }
        .cart-continue { background:none; border:1.5px solid var(--border); border-radius:8px; padding:10px 18px; font-size:13px; font-weight:700; color:var(--dark); cursor:pointer; font-family:inherit; display:flex; align-items:center; gap:7px; margin:16px 24px; transition:.2s; }
        .cart-continue:hover { border-color:#1d5ba0; color:#1d5ba0; background:#f0f5ff; }
      `}</style>

      <div className="cart-page">
        <div className="cart-crumb">
          <div className="container cart-crumb-inner">
            <span className="cart-crumb-back" onClick={onContinueShopping}>
              <i className="fas fa-arrow-left" style={{ fontSize: 10 }}></i> Home
            </span>
            <i className="fas fa-chevron-right" style={{ fontSize: 10 }}></i>
            <span style={{ color: "var(--dark)", fontWeight: 700 }}>My Basket</span>
          </div>
        </div>

        <div className="container" style={{ paddingTop: 28 }}>
          <div className="cart-wrap">

            {/* LEFT COLUMN */}
            <div>

              {/* Items */}
              <div className="cart-main">
                <div className="cart-main-header">
                  <h2>My Basket</h2>
                  <span className="cart-count-pill">{cart.length} item{cart.length !== 1 ? "s" : ""}</span>
                </div>

                {cart.length === 0 ? (
                  <div className="cart-empty">
                    <div className="cart-empty-icon"><i className="fas fa-shopping-basket"></i></div>
                    <h3>Your basket is empty</h3>
                    <p>Looks like you haven't added anything yet.</p>
                    <button className="cart-empty-btn" onClick={onContinueShopping}>
                      <i className="fas fa-store" style={{ marginRight: 8 }}></i>Start Shopping
                    </button>
                  </div>
                ) : (
                  <>
                    {cart.map((item) => {
                      const price = parseFloat(String(item.price || "").replace(/[^0-9.]/g, "")) || 0;
                      const currency = (String(item.price || "").match(/[₹$€£]/) || ["₹"])[0];
                      return (
                        <div key={item._uid} className="cart-item">
                          <div className="cart-item-img" onClick={() => onOpenProduct && onOpenProduct(item)}>
                            <img src={item.imageUrl} alt={item.name} loading="lazy" />
                          </div>
                          <div className="cart-item-info">
                            {item.brand && <div className="cart-item-brand">{item.brand}</div>}
                            <div className="cart-item-name" onClick={() => onOpenProduct && onOpenProduct(item)}>{item.name}</div>
                            <div>
                              <span className="cart-item-price">{item.price}</span>
                              {item.oldPrice && <span className="cart-item-oldprice">{item.oldPrice}</span>}
                            </div>
                          </div>
                          <div className="cart-item-right">
                            <div className="cart-qty-ctrl">
                              <button className="cart-qty-btn" onClick={() => onUpdateQty(item._uid, item.quantity - 1)}>−</button>
                              <div className="cart-qty-num">{item.quantity}</div>
                              <button className="cart-qty-btn" onClick={() => onUpdateQty(item._uid, item.quantity + 1)}>+</button>
                            </div>
                            <div className="cart-item-total">{currency}{(price * item.quantity).toFixed(2)}</div>
                            <button className="cart-remove-btn" onClick={() => onRemove(item._uid)}>
                              <i className="fas fa-trash-alt"></i> Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    <button className="cart-continue" onClick={onContinueShopping}>
                      <i className="fas fa-arrow-left"></i> Continue Shopping
                    </button>
                  </>
                )}
              </div>

              {/* Delivery Address */}
              <div className="cart-addr-panel">
                <div className="cart-addr-header">
                  <h3><i className="fas fa-map-marker-alt"></i> Delivery Address</h3>
                  {onGoAccount && (
                    <button className="cart-addr-manage" onClick={onGoAccount}>
                      Manage in Profile →
                    </button>
                  )}
                </div>

                {addresses.length === 0 && !showAddForm && (
                  <div className="cart-addr-empty">
                    <p>No saved addresses yet.</p>
                  </div>
                )}

                {addresses.length > 0 && (
                  <div className="cart-addr-list">
                    {addresses.map((addr, i) => (
                      <div key={i} className="cart-addr-item" onClick={() => setSelectedIndex(i)}>
                        <input
                          type="radio"
                          className="cart-addr-radio"
                          checked={selectedIndex === i}
                          onChange={() => setSelectedIndex(i)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="cart-addr-info">
                          <div className="cart-addr-type">
                            <i className={addr.type === "Home" ? "fas fa-home" : addr.type === "Work" ? "fas fa-briefcase" : "fas fa-map-marker-alt"}></i>
                            {addr.type}
                          </div>
                          <div className="cart-addr-text">{addr.text}</div>
                        </div>
                        <button className="cart-addr-del" title="Remove" onClick={(e) => { e.stopPropagation(); handleRemoveAddress(i); }}>
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {showAddForm ? (
                  <div className="cart-addr-form">
                    <select value={newAddrType} onChange={(e) => setNewAddrType(e.target.value)}>
                      <option>Home</option>
                      <option>Work</option>
                      <option>Other</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Enter full address"
                      value={newAddrText}
                      onChange={(e) => setNewAddrText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddAddress()}
                      autoFocus
                    />
                    <div className="cart-addr-form-btns">
                      <button className="cart-addr-save-btn" onClick={handleAddAddress}>Save Address</button>
                      <button className="cart-addr-cancel-btn" onClick={() => { setShowAddForm(false); setNewAddrText(""); }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  addresses.length < 5 && (
                    <button className="cart-addr-add-btn" onClick={() => setShowAddForm(true)}>
                      <i className="fas fa-plus-circle"></i> Add New Address
                    </button>
                  )
                )}
              </div>

            </div>

            {/* RIGHT: Order Summary */}
            <div className="cart-summary">
              <div className="cart-summary-header">
                <h3>Order Summary</h3>
              </div>
              <div className="cart-summary-body">
                <div className="cart-summary-row">
                  <span>Subtotal ({cart.reduce((a, i) => a + i.quantity, 0)} items)</span>
                  <span className="val">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="cart-summary-row">
                  <span>Delivery</span>
                  <span className="val">
                    {delivery === 0
                      ? <span className="cart-free-tag">FREE</span>
                      : `₹${delivery}`}
                  </span>
                </div>
                {subtotal > 0 && subtotal <= 99 && (
                  <div style={{ fontSize: 12, color: "#16a34a", padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
                    <i className="fas fa-info-circle"></i> Add ₹{(99 - subtotal + 0.01).toFixed(0)} more for FREE delivery
                  </div>
                )}

                {selectedAddress && (
                  <div className="cart-deliver-to">
                    <i className="fas fa-map-marker-alt"></i>
                    <span><strong>{selectedAddress.type}:</strong> {selectedAddress.text}</span>
                  </div>
                )}

                <div className="cart-summary-row total">
                  <span>Total</span>
                  <span className="val">₹{total.toFixed(2)}</span>
                </div>

                <div className="cart-promo">
                  <input type="text" placeholder="Promo code" />
                  <button className="cart-promo-btn">Apply</button>
                </div>

                <button
                  className="cart-checkout-btn"
                  disabled={cart.length === 0 || !selectedAddress}
                  title={!selectedAddress ? "Please select a delivery address" : ""}
                  onClick={() => onCheckout && onCheckout({ address: selectedAddress, total, delivery })}
                >
                  <i className="fas fa-lock"></i>
                  {selectedAddress ? "Proceed to Checkout" : "Select an Address First"}
                </button>

                <div className="cart-safe">
                  <i className="fas fa-shield-alt" style={{ color: "#16a34a" }}></i>
                  Safe &amp; Secure Payments
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}