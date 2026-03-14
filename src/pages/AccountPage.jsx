// src/pages/AccountPage.jsx
import { useState, useEffect } from "react";
import "./Account.css";
import { useAuth } from "../context/AuthContext";

// Shared key used by both AccountPage and CartPage
export const ADDRESSES_KEY = "pb_saved_addresses";

function AccountPage({ onGoHome, onLogout, initialSection = "profile", onSectionChange, orders: propOrders = [] }) {
  const { logout, user } = useAuth();
  const [section, setSection] = useState(initialSection);

  // Sync when parent changes initialSection (e.g. navigating from OrderSuccessPage)
  useEffect(() => { setSection(initialSection); }, [initialSection]);

  const changeSection = (s) => { setSection(s); onSectionChange && onSectionChange(s); };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();   // clears cart, wishlist, auth, and goes home
    } else {
      logout();
      onGoHome();
    }
  };

  return (
    <div className="account-container">

      {/* Sidebar */}
      <div className="account-sidebar">
        <h2>My Account</h2>
        <div className="account-menu">

          <div className="account-item" onClick={() => changeSection("profile")}>
            <i className="fas fa-user"></i>
            <span>Profile</span>
          </div>

          <div className="account-item" onClick={() => changeSection("orders")}>
            <i className="fas fa-box"></i>
            <span>My Orders</span>
          </div>

          <div className="account-item" onClick={() => changeSection("addresses")}>
            <i className="fas fa-map-marker-alt"></i>
            <span>Addresses</span>
          </div>

          <div className="account-item" onClick={() => changeSection("recent")}>
            <i className="fas fa-history"></i>
            <span>Recently Ordered</span>
          </div>

          <div className="account-item" onClick={() => changeSection("notifications")}>
            <i className="fas fa-bell"></i>
            <span>Notifications</span>
          </div>

          <div className="account-item" onClick={() => changeSection("payments")}>
            <i className="fas fa-credit-card"></i>
            <span>Payments</span>
          </div>

          <div className="account-item" onClick={() => changeSection("help")}>
            <i className="fas fa-question-circle"></i>
            <span>Help</span>
          </div>

          <div className="account-item logout" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </div>

        </div>
      </div>

      {/* Content Area */}
      <div className="account-content">
        {section === "profile"       && <Profile user={user} />}
        {section === "orders"        && <OrdersSection orders={propOrders} />}
        {section === "addresses"     && <AddressSection />}
        {section === "recent"        && <RecentOrdersSection />}
        {section === "notifications" && <NotificationsSection />}
        {section === "payments"      && <PaymentsSection />}
        {section === "help"          && <HelpSection />}
      </div>

    </div>
  );
}

export default AccountPage;


/* ─── Profile Component ──────────────────────────────────────────── */

function Profile({ user }) {
  const [photo, setPhoto] = useState(null);
  const [name,  setName]  = useState(user?.name  || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) setPhoto(URL.createObjectURL(file));
  };

  const handleSave = () => {
    try {
      const saved   = JSON.parse(localStorage.getItem("user") || "{}");
      const updated = { ...saved, name, email, phone };
      localStorage.setItem("user", JSON.stringify(updated));
      alert("Profile saved!");
    } catch {
      alert("Profile saved!");
    }
  };

  return (
    <div className="profile-container">

      <div className="profile-photo-section">
        <img
          src={photo || "https://cdn-icons-png.flaticon.com/512/1144/1144760.png"}
          alt="Profile"
          className="profile-photo"
        />
        <input type="file" accept="image/*" onChange={handlePhotoChange} />
      </div>

      <h3>Profile Information</h3>

      <div className="profile-form">
        <label>Name</label>
        <input type="text"  placeholder="Enter your name"    value={name}  onChange={(e) => setName(e.target.value)}  />

        <label>Email</label>
        <input type="email" placeholder="Enter email"        value={email} onChange={(e) => setEmail(e.target.value)} />

        <label>Phone</label>
        <input type="text"  placeholder="Enter phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />

        <button className="save-btn" onClick={handleSave}>Save</button>
      </div>

    </div>
  );
}


/* ─── Orders Component ───────────────────────────────────────────── */

function OrdersSection({ orders = [] }) {
  const [expanded, setExpanded] = useState(null);

  // Merge real orders (from props) with demo orders for display
  const demoOrders = [
    { orderId: "PB1023", date: "10 Mar 2026", items: [], method: "card",  total: 560, status: "Delivered"  },
    { orderId: "PB1024", date: "11 Mar 2026", items: [], method: "upi",   total: 320, status: "Processing" },
  ];
  const allOrders = [...orders, ...demoOrders];

  const methodLabel = { upi:"UPI", card:"Card", netbanking:"Net Banking", wallet:"Wallet", cod:"COD" };

  const statusStyle = (status) => ({
    padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700,
    background: status === "Delivered" ? "#dcfce7" : status === "Processing" || status === "Confirmed" ? "#fef9c3" : "#fee2e2",
    color:      status === "Delivered" ? "#16a34a" : status === "Processing" || status === "Confirmed" ? "#ca8a04" : "#dc2626",
  });

  if (allOrders.length === 0) {
    return (
      <div className="orders-card" style={{ textAlign: "center", padding: "60px 20px" }}>
        <i className="fas fa-box-open" style={{ fontSize: 48, color: "#d0d8e4", marginBottom: 14, display: "block" }}></i>
        <h3 style={{ fontFamily: "'Quicksand',sans-serif", color: "#253d4e" }}>No orders yet</h3>
        <p style={{ color: "#7e7e7e", fontSize: 13 }}>Your placed orders will appear here.</p>
      </div>
    );
  }

  return (
    <div className="orders-card">
      <h2>My Orders</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {allOrders.map((order, i) => (
          <div key={order.orderId || i} style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
            {/* Order header */}
            <div
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", background: "#f9fafb", cursor: "pointer", gap: 12 }}
              onClick={() => setExpanded(expanded === i ? null : i)}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <span style={{ fontWeight: 800, fontSize: 14, color: "#253d4e", fontFamily: "'Quicksand',sans-serif" }}>#{order.orderId}</span>
                <span style={{ fontSize: 12, color: "#7e7e7e" }}>{order.date} · {methodLabel[order.method] || order.method}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontWeight: 800, fontSize: 15, color: "#1d5ba0", fontFamily: "'Quicksand',sans-serif" }}>₹{Number(order.total).toFixed(2)}</span>
                <span style={statusStyle(order.status)}>{order.status}</span>
                <i className={`fas fa-chevron-${expanded === i ? "up" : "down"}`} style={{ fontSize: 11, color: "#7e7e7e" }}></i>
              </div>
            </div>

            {/* Expanded: item list */}
            {expanded === i && (
              <div style={{ padding: "14px 18px", borderTop: "1px solid var(--border)" }}>
                {order.items && order.items.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {order.items.map((item) => {
                      const price = parseFloat(String(item.price || "").replace(/[^0-9.]/g, "")) || 0;
                      return (
                        <div key={item._uid} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 48, height: 48, borderRadius: 8, border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", padding: 4, flexShrink: 0 }}>
                            <img src={item.imageUrl} alt={item.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#253d4e" }}>{item.name}</div>
                            <div style={{ fontSize: 12, color: "#7e7e7e" }}>Qty: {item.quantity} · {item.brand}</div>
                          </div>
                          <div style={{ fontWeight: 800, color: "#1d5ba0", fontFamily: "'Quicksand',sans-serif", fontSize: 14 }}>
                            ₹{(price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                    {order.address && (
                      <div style={{ marginTop: 8, padding: "10px 12px", background: "#f0f5ff", borderRadius: 8, fontSize: 12, color: "#253d4e", display: "flex", gap: 8 }}>
                        <i className="fas fa-map-marker-alt" style={{ color: "#1d5ba0", marginTop: 1 }}></i>
                        <span><strong>{order.address.type}:</strong> {order.address.text}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p style={{ fontSize: 13, color: "#7e7e7e", margin: 0 }}>No item details available for this order.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


/* ─── Addresses Component ────────────────────────────────────────── */

// Load from localStorage
function loadAddresses() {
  try {
    const raw = localStorage.getItem(ADDRESSES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveAddresses(list) {
  localStorage.setItem(ADDRESSES_KEY, JSON.stringify(list));
}

export function AddressSection() {
  const [addresses,   setAddresses]   = useState(loadAddresses);
  const [addressText, setAddressText] = useState("");
  const [type,        setType]        = useState("Home");
  const [editIndex,   setEditIndex]   = useState(null);
  const [showForm,    setShowForm]    = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showMap,     setShowMap]     = useState(false);

  // Persist whenever addresses change
  useEffect(() => { saveAddresses(addresses); }, [addresses]);

  const saveAddress = () => {
    if (!addressText.trim()) return;
    const newAddr = { type, text: addressText };
    if (editIndex !== null) {
      const updated = [...addresses];
      updated[editIndex] = newAddr;
      setAddresses(updated);
      setEditIndex(null);
    } else {
      if (addresses.length >= 5) { alert("Maximum 5 addresses allowed"); return; }
      setAddresses([...addresses, newAddr]);
    }
    setAddressText("");
    setType("Home");
    setShowForm(false);
    setShowOptions(false);
  };

  const deleteAddress = (i) => setAddresses(addresses.filter((_, idx) => idx !== i));

  const editAddress = (i) => {
    setAddressText(addresses[i].text);
    setType(addresses[i].type);
    setEditIndex(i);
    setShowForm(true);
  };

  return (
    <div className="address-card">

      <div className="add-address-bar" onClick={() => { setShowOptions(true); setShowForm(false); setEditIndex(null); setAddressText(""); }}>
        <span className="plus">+</span>
        <span>Add New Address</span>
      </div>

      <h3>Saved Addresses</h3>

      {showOptions && (
        <div className="location-options">
          <button className="manual-btn" onClick={() => { setShowForm(true); setShowOptions(false); }}>
            Enter Manually
          </button>
          <button className="location-btn" onClick={() => setShowMap(true)}>
            Enable Live Location
          </button>

          {showMap && (
            <div className="map-popup">
              <div className="map-container">
                <button className="close-map" onClick={() => setShowMap(false)}>✖</button>
                <iframe
                  title="Google Map"
                  width="100%"
                  height="400"
                  src="https://maps.google.com/maps?q=&output=embed"
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="address-form">
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option>Home</option>
            <option>Work</option>
            <option>Other</option>
          </select>
          <input
            type="text"
            placeholder="Enter full address"
            value={addressText}
            onChange={(e) => setAddressText(e.target.value)}
          />
          <button onClick={saveAddress}>{editIndex !== null ? "Update" : "Add"}</button>
          <button
            onClick={() => { setShowForm(false); setEditIndex(null); setAddressText(""); }}
            style={{ background: "#e5e7eb", color: "#374151" }}
          >
            Cancel
          </button>
        </div>
      )}

      {addresses.length === 0 && !showForm && (
        <p style={{ color: "#7e7e7e", fontSize: 14, padding: "12px 0" }}>No saved addresses yet.</p>
      )}

      {addresses.map((addr, i) => (
        <div key={i} className="address-item-card">
          <div className="address-left">
            <i className={addr.type === "Home" ? "fas fa-home" : addr.type === "Work" ? "fas fa-briefcase" : "fas fa-map-marker-alt"}></i>
            <div>
              <strong>{addr.type}</strong>
              <p>{addr.text}</p>
            </div>
          </div>
          <div className="address-actions">
            <i className="fas fa-pen"   onClick={() => editAddress(i)}></i>
            <i className="fas fa-trash" onClick={() => deleteAddress(i)}></i>
          </div>
        </div>
      ))}

    </div>
  );
}


/* ─── Recently Ordered Component ─────────────────────────────────── */

function RecentOrdersSection() {
  const recentItems = [
    { name: "Milk",  price: "₹40"  },
    { name: "Eggs",  price: "₹120" },
    { name: "Bread", price: "₹35"  },
    { name: "Rice",  price: "₹650" },
  ];

  return (
    <div className="recent-card">
      <h2>Recently Ordered</h2>
      <div className="recent-list">
        {recentItems.map((item, i) => (
          <div key={i} className="recent-item">
            <div>
              <strong>{item.name}</strong>
              <p>{item.price}</p>
            </div>
            <button onClick={() => alert(item.name + " added to basket")}>
              Order Again
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}


/* ─── Notifications Component ────────────────────────────────────── */

function NotificationsSection() {
  const notifications = [
    "Order PB1023 Delivered",
    "Your order is out for delivery",
    "10% discount on Fruits today",
    "New grocery items added to store",
  ];

  return (
    <div className="notifications-card">
      <h2>Notifications</h2>
      <div className="notifications-list">
        {notifications.map((note, i) => (
          <div key={i} className="notification-item">
            <span className="tick">✔</span>
            <span>{note}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


/* ─── Payments Component ─────────────────────────────────────────── */

function PaymentsSection() {
  const [payments, setPayments] = useState([
    { type: "UPI",  value: "jayaprakash@upi"     },
    { type: "Card", value: "**** **** **** 3456" },
  ]);

  return (
    <div className="payments-card">
      <h2>Saved Payments</h2>
      <div className="payments-list">
        {payments.length === 0 && <p>No payment methods saved.</p>}
        {payments.map((payment, i) => (
          <div key={i} className="payment-item">
            <div>
              <strong>{payment.type}</strong>
              <p>{payment.value}</p>
            </div>
            <button
              className="remove-btn"
              onClick={() => setPayments(payments.filter((_, idx) => idx !== i))}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}


/* ─── Help Component ─────────────────────────────────────────────── */

function HelpSection() {
  const [openCategory, setOpenCategory] = useState(null);

  const toggle = (cat) => setOpenCategory(openCategory === cat ? null : cat);

  const faqData = {
    "Coupons & Offers": [
      { q: "Coupon not working / expired coupon",                 a: "Every coupon comes with a validity period. If the validity is over you cannot use the coupon. Check the 'View coupons & offers' section for new offers." },
      { q: "I forgot to apply my coupon code. What do I do now?", a: "An order once placed cannot be edited. You can use the coupon for your next order." },
    ],
    "General Inquiry": [
      { q: "How do I delete my account?",                 a: "You can contact our customer support through 'Chat With Us' or email to delete your account." },
      { q: "Do you charge any taxes over product price?", a: "All product prices are inclusive of taxes. A delivery fee or small-cart fee may apply depending on the order." },
      { q: "What are your timings?",                      a: "Our support team is available from 6am to 3am." },
    ],
    "Payment Related": [
      { q: "What are the modes of payment?",    a: "COD, credit/debit cards (Visa, Mastercard, Rupay), wallets, Pay Later, and online payments are supported." },
      { q: "How do I change the payment mode?", a: "Once an order is out for delivery, the payment method cannot be changed." },
      { q: "Is it safe to use my card?",        a: "Yes. All transactions are processed via secure PCI DSS compliant payment gateways." },
      { q: "Why is my COD blocked?",            a: "If orders are frequently cancelled after packing or delivery, COD may be temporarily disabled." },
      { q: "Do you charge for the bag?",        a: "Prime-Basket does not charge for bags. However, a packaging fee may apply." },
    ],
    "Order / Products Related": [
      { q: "Can I change the delivery address?", a: "Once an order is placed, the delivery address cannot be changed." },
      { q: "Is there a minimum order value?",    a: "There is no minimum or maximum order value." },
    ],
    "Wallet Related": [
      { q: "I am not able to add money to my wallet", a: "Please update the app to the latest version and try again." },
      { q: "Money added to wallet is not visible",    a: "Update the app to the latest version and check again." },
    ],
  };

  return (
    <div className="help-card">
      <h2>Help &amp; Support</h2>

      <div className="help-options">
        <button onClick={() => { window.location.href = "mailto:support@primebasket.com?subject=Prime Basket Support Request"; }}>
          Contact Support
        </button>
        <button onClick={() => alert("Complaint form will open here.")}>
          Raise Complaint
        </button>
        <button onClick={() => alert("Please provide the Order ID and describe the issue.")}>
          Report Order Issue
        </button>
      </div>

      <h3>FAQs</h3>

      {Object.keys(faqData).map((category) => (
        <div key={category} className="faq-category">
          <div className="faq-title" onClick={() => toggle(category)}>
            {category}
          </div>
          {openCategory === category && (
            <div className="faq-questions">
              {faqData[category].map((item, i) => (
                <div key={i} className="faq-item">
                  <p className="faq-question">{item.q}</p>
                  <p className="faq-answer">{item.a}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}