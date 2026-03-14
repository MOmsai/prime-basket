// src/pages/PaymentPage.jsx
import { useState } from "react";

const PAYMENT_METHODS = [
  { id: "upi",        icon: "fa-mobile-alt",    label: "UPI"                  },
  { id: "card",       icon: "fa-credit-card",   label: "Credit / Debit Card"  },
  { id: "netbanking", icon: "fa-university",    label: "Net Banking"          },
  { id: "wallet",     icon: "fa-wallet",        label: "Wallets"              },
  { id: "cod",        icon: "fa-money-bill-wave",label: "Cash on Delivery"    },
];

const UPI_APPS = [
  { id: "gpay",   label: "Google Pay",  color: "#4285f4", letter: "G" },
  { id: "phonepe",label: "PhonePe",     color: "#5f259f", letter: "P" },
  { id: "paytm",  label: "Paytm",       color: "#00baf2", letter: "T" },
  { id: "bhim",   label: "BHIM UPI",    color: "#138808", letter: "B" },
];

const BANKS = [
  "State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank",
  "Kotak Mahindra Bank", "Punjab National Bank", "Bank of Baroda", "Canara Bank",
];

export default function PaymentPage({ cart, total, delivery, address, onBack, onSuccess }) {
  const [method, setMethod]         = useState("upi");
  const [upiApp, setUpiApp]         = useState("gpay");
  const [upiId, setUpiId]           = useState("");
  const [useUpiId, setUseUpiId]     = useState(false);
  const [bank, setBank]             = useState(BANKS[0]);
  const [wallet, setWallet]         = useState("gpay");
  const [cardNum, setCardNum]       = useState("");
  const [cardName, setCardName]     = useState("");
  const [cardExp, setCardExp]       = useState("");
  const [cardCvv, setCardCvv]       = useState("");
  const [saveCard, setSaveCard]     = useState(false);
  const [placing, setPlacing]       = useState(false);
  const [errors, setErrors]         = useState({});

  const itemCount = cart.reduce((a, i) => a + i.quantity, 0);

  const formatCard = (v) =>
    v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

  const formatExp = (v) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d;
  };

  const validate = () => {
    const e = {};
    if (method === "upi") {
      if (useUpiId && !/^[\w.\-]+@[\w]+$/.test(upiId.trim())) e.upiId = "Enter a valid UPI ID (e.g. name@upi)";
    }
    if (method === "card") {
      if (cardNum.replace(/\s/g, "").length < 16) e.cardNum = "Enter a valid 16-digit card number";
      if (!cardName.trim()) e.cardName = "Enter cardholder name";
      if (cardExp.length < 5) e.cardExp = "Enter valid expiry MM/YY";
      if (cardCvv.length < 3) e.cardCvv = "Enter valid CVV";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = () => {
    if (!validate()) return;
    setPlacing(true);
    setTimeout(() => {
      setPlacing(false);
      onSuccess && onSuccess({
        orderId: "PB" + Date.now().toString().slice(-8),
        method,
        total,
        address,
        items: cart,
      });
    }, 1800);
  };

  return (
    <>
      <style>{`
        .pay-page { background:var(--bg); min-height:100vh; padding-bottom:60px; font-family:'Nunito',sans-serif; }

        /* breadcrumb */
        .pay-crumb { background:#fff; border-bottom:1px solid var(--border); padding:11px 0; }
        .pay-crumb-inner { display:flex; align-items:center; gap:8px; font-size:13px; color:var(--body); }
        .pay-crumb-back { display:flex; align-items:center; gap:5px; color:#1d5ba0; font-weight:700; cursor:pointer; }
        .pay-crumb-back:hover { text-decoration:underline; }

        /* steps bar */
        .pay-steps { background:#fff; border-bottom:1px solid var(--border); padding:12px 0; }
        .pay-steps-inner { display:flex; align-items:center; gap:0; justify-content:center; }
        .pay-step { display:flex; align-items:center; gap:7px; font-size:13px; font-weight:700; color:var(--body); }
        .pay-step.done { color:#16a34a; }
        .pay-step.active { color:#1d5ba0; }
        .pay-step-num { width:26px; height:26px; border-radius:50%; border:2px solid currentColor; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800; background:#fff; }
        .pay-step.done .pay-step-num { background:#16a34a; color:#fff; border-color:#16a34a; }
        .pay-step.active .pay-step-num { background:#1d5ba0; color:#fff; border-color:#1d5ba0; }
        .pay-step-line { width:60px; height:2px; background:var(--border); margin:0 6px; }
        .pay-step-line.done { background:#16a34a; }

        /* layout */
        .pay-wrap { display:grid; grid-template-columns:1fr 360px; gap:24px; margin-top:28px; align-items:start; }
        @media(max-width:900px){ .pay-wrap { grid-template-columns:1fr; } }

        /* left: method selector */
        .pay-left { background:#fff; border-radius:14px; border:1px solid var(--border); overflow:hidden; box-shadow:var(--shadow); }
        .pay-left-header { padding:18px 24px; border-bottom:1px solid var(--border); }
        .pay-left-header h2 { font-family:'Quicksand',sans-serif; font-size:18px; font-weight:800; color:var(--dark); margin:0; }

        /* method tabs */
        .pay-method-row { display:flex; align-items:stretch; border-bottom:1px solid var(--border); cursor:pointer; transition:.15s; padding:16px 24px; gap:14px; }
        .pay-method-row:hover { background:#fafbff; }
        .pay-method-row.active { background:#f0f5ff; border-left:3px solid #1d5ba0; padding-left:21px; }
        .pay-method-radio { width:18px; height:18px; accent-color:#1d5ba0; flex-shrink:0; margin-top:2px; cursor:pointer; }
        .pay-method-info { flex:1; }
        .pay-method-label { font-size:14px; font-weight:700; color:var(--dark); display:flex; align-items:center; gap:8px; }
        .pay-method-label i { color:#1d5ba0; width:18px; text-align:center; }
        .pay-method-sub { font-size:12px; color:var(--body); margin-top:2px; }

        /* method panels */
        .pay-panel { padding:20px 24px 24px; border-bottom:1px solid var(--border); }

        /* UPI */
        .pay-upi-apps { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:16px; }
        .pay-upi-app { display:flex; flex-direction:column; align-items:center; gap:6px; cursor:pointer; padding:10px 14px; border-radius:10px; border:2px solid var(--border); background:#fff; transition:.2s; min-width:80px; }
        .pay-upi-app:hover { border-color:#1d5ba0; }
        .pay-upi-app.active { border-color:#1d5ba0; background:#f0f5ff; }
        .pay-upi-app-icon { width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:18px; color:#fff; }
        .pay-upi-app-name { font-size:11px; font-weight:700; color:var(--dark); }
        .pay-upi-divider { display:flex; align-items:center; gap:10px; margin:14px 0; color:var(--body); font-size:12px; }
        .pay-upi-divider::before, .pay-upi-divider::after { content:''; flex:1; height:1px; background:var(--border); }
        .pay-upi-id-row { display:flex; gap:8px; }
        .pay-input { flex:1; padding:10px 14px; border:1.5px solid var(--border); border-radius:8px; font-family:inherit; font-size:13px; outline:none; transition:.2s; }
        .pay-input:focus { border-color:#1d5ba0; box-shadow:0 0 0 3px rgba(29,91,160,.08); }
        .pay-input.err { border-color:#e63946; }
        .pay-input-err { font-size:11px; color:#e63946; margin-top:4px; }
        .pay-verify-btn { background:#f0f5ff; color:#1d5ba0; border:1.5px solid #1d5ba0; border-radius:8px; padding:10px 16px; font-size:13px; font-weight:700; cursor:pointer; font-family:inherit; transition:.2s; white-space:nowrap; }
        .pay-verify-btn:hover { background:#1d5ba0; color:#fff; }

        /* Card */
        .pay-card-form { display:flex; flex-direction:column; gap:14px; }
        .pay-card-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .pay-label { font-size:12px; font-weight:700; color:var(--body); margin-bottom:5px; display:block; }
        .pay-card-icons { display:flex; gap:6px; margin-bottom:14px; }
        .pay-card-icon { width:44px; height:28px; border-radius:5px; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:800; color:#fff; }
        .pay-save-row { display:flex; align-items:center; gap:8px; font-size:13px; color:var(--dark); cursor:pointer; margin-top:4px; }
        .pay-save-row input { accent-color:#1d5ba0; width:15px; height:15px; cursor:pointer; }

        /* Net banking */
        .pay-bank-select { width:100%; padding:11px 14px; border:1.5px solid var(--border); border-radius:8px; font-family:inherit; font-size:13px; outline:none; background:#fff; transition:.2s; }
        .pay-bank-select:focus { border-color:#1d5ba0; }
        .pay-bank-note { font-size:12px; color:var(--body); margin-top:10px; line-height:1.6; }

        /* Wallet */
        .pay-wallets { display:flex; gap:10px; flex-wrap:wrap; }
        .pay-wallet-btn { display:flex; flex-direction:column; align-items:center; gap:5px; padding:10px 14px; border-radius:10px; border:2px solid var(--border); background:#fff; cursor:pointer; transition:.2s; min-width:80px; }
        .pay-wallet-btn:hover { border-color:#1d5ba0; }
        .pay-wallet-btn.active { border-color:#1d5ba0; background:#f0f5ff; }
        .pay-wallet-icon { width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:800; color:#fff; }
        .pay-wallet-name { font-size:11px; font-weight:700; color:var(--dark); }

        /* COD */
        .pay-cod-box { background:#f9fafb; border-radius:10px; padding:16px 18px; border:1px solid var(--border); }
        .pay-cod-title { font-size:14px; font-weight:700; color:var(--dark); margin-bottom:6px; }
        .pay-cod-note { font-size:13px; color:var(--body); line-height:1.6; }
        .pay-cod-fee { display:inline-block; background:#fff8e1; color:#b45309; font-size:12px; font-weight:700; padding:3px 10px; border-radius:20px; margin-top:8px; }

        /* right: order summary */
        .pay-summary { background:#fff; border-radius:14px; border:1px solid var(--border); box-shadow:var(--shadow); position:sticky; top:88px; overflow:hidden; }
        .pay-summary-title { padding:18px 22px; border-bottom:1px solid var(--border); font-family:'Quicksand',sans-serif; font-size:16px; font-weight:800; color:var(--dark); }
        .pay-summary-items { max-height:220px; overflow-y:auto; padding:8px 0; }
        .pay-summary-item { display:flex; align-items:center; gap:10px; padding:8px 22px; }
        .pay-summary-img { width:44px; height:44px; border-radius:8px; border:1px solid var(--border); display:flex; align-items:center; justify-content:center; padding:4px; flex-shrink:0; }
        .pay-summary-img img { max-width:100%; max-height:100%; object-fit:contain; }
        .pay-summary-name { font-size:12px; font-weight:700; color:var(--dark); flex:1; line-height:1.4; }
        .pay-summary-qty { font-size:11px; color:var(--body); }
        .pay-summary-price { font-size:13px; font-weight:800; color:#1d5ba0; font-family:'Quicksand',sans-serif; flex-shrink:0; }
        .pay-summary-rows { padding:12px 22px 0; border-top:1px solid var(--border); }
        .pay-summary-row { display:flex; justify-content:space-between; align-items:center; padding:8px 0; font-size:13px; border-bottom:1px solid var(--bg); }
        .pay-summary-row:last-child { border-bottom:none; }
        .pay-summary-row.total { font-size:16px; font-weight:800; color:var(--dark); font-family:'Quicksand',sans-serif; padding-top:12px; }
        .pay-free-tag { background:#dcfce7; color:#16a34a; font-size:11px; font-weight:700; padding:2px 8px; border-radius:20px; }
        .pay-addr-box { margin:0 22px 16px; background:#f0f5ff; border-radius:10px; padding:12px 14px; font-size:12px; color:var(--dark); display:flex; gap:8px; align-items:flex-start; }
        .pay-addr-box i { color:#1d5ba0; margin-top:2px; flex-shrink:0; }
        .pay-now-btn { display:flex; align-items:center; justify-content:center; gap:8px; width:calc(100% - 44px); margin:0 22px 16px; background:#1d5ba0; color:#fff; border:none; border-radius:10px; padding:14px 0; font-size:15px; font-weight:800; cursor:pointer; font-family:inherit; transition:.2s; }
        .pay-now-btn:hover:not(:disabled) { background:#174d8a; }
        .pay-now-btn:disabled { opacity:.65; cursor:not-allowed; }
        .pay-now-btn.loading { background:#174d8a; }
        .pay-safe { display:flex; align-items:center; justify-content:center; gap:6px; font-size:11px; color:var(--body); margin-bottom:16px; }

        /* spinner */
        @keyframes spin { to { transform:rotate(360deg); } }
        .pay-spinner { width:16px; height:16px; border:2.5px solid rgba(255,255,255,.4); border-top-color:#fff; border-radius:50%; animation:spin .7s linear infinite; }
      `}</style>

      <div className="pay-page">

        {/* Breadcrumb */}
        <div className="pay-crumb">
          <div className="container pay-crumb-inner">
            <span className="pay-crumb-back" onClick={onBack}>
              <i className="fas fa-arrow-left" style={{ fontSize: 10 }}></i> Back to Cart
            </span>
            <i className="fas fa-chevron-right" style={{ fontSize: 10 }}></i>
            <span style={{ color: "var(--dark)", fontWeight: 700 }}>Payment</span>
          </div>
        </div>

        {/* Steps */}
        <div className="pay-steps">
          <div className="container pay-steps-inner">
            <div className="pay-step done">
              <div className="pay-step-num"><i className="fas fa-check" style={{ fontSize: 9 }}></i></div>
              <span>Cart</span>
            </div>
            <div className="pay-step-line done"></div>
            <div className="pay-step done">
              <div className="pay-step-num"><i className="fas fa-check" style={{ fontSize: 9 }}></i></div>
              <span>Address</span>
            </div>
            <div className="pay-step-line done"></div>
            <div className="pay-step active">
              <div className="pay-step-num">3</div>
              <span>Payment</span>
            </div>
            <div className="pay-step-line"></div>
            <div className="pay-step">
              <div className="pay-step-num">4</div>
              <span>Confirmation</span>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="pay-wrap">

            {/* ── LEFT: Payment Methods ── */}
            <div className="pay-left">
              <div className="pay-left-header">
                <h2><i className="fas fa-lock" style={{ color: "#16a34a", fontSize: 15, marginRight: 8 }}></i>Choose Payment Method</h2>
              </div>

              {PAYMENT_METHODS.map((m) => (
                <div key={m.id}>
                  <div
                    className={`pay-method-row${method === m.id ? " active" : ""}`}
                    onClick={() => setMethod(m.id)}
                  >
                    <input type="radio" className="pay-method-radio" checked={method === m.id} onChange={() => setMethod(m.id)} />
                    <div className="pay-method-info">
                      <div className="pay-method-label">
                        <i className={`fas ${m.icon}`}></i> {m.label}
                      </div>
                      <div className="pay-method-sub">
                        {m.id === "upi"        && "Google Pay, PhonePe, Paytm & more"}
                        {m.id === "card"       && "Visa, Mastercard, Rupay, Amex"}
                        {m.id === "netbanking" && "All major Indian banks supported"}
                        {m.id === "wallet"     && "Paytm, Amazon Pay, Freecharge"}
                        {m.id === "cod"        && "Pay at your doorstep"}
                      </div>
                    </div>
                  </div>

                  {/* Panel shown only for selected method */}
                  {method === m.id && (
                    <div className="pay-panel">

                      {/* ── UPI ── */}
                      {m.id === "upi" && (
                        <>
                          {!useUpiId && (
                            <>
                              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--dark)", marginBottom: 12 }}>Select UPI App</p>
                              <div className="pay-upi-apps">
                                {UPI_APPS.map((app) => (
                                  <div
                                    key={app.id}
                                    className={`pay-upi-app${upiApp === app.id ? " active" : ""}`}
                                    onClick={() => setUpiApp(app.id)}
                                  >
                                    <div className="pay-upi-app-icon" style={{ background: app.color }}>{app.letter}</div>
                                    <span className="pay-upi-app-name">{app.label}</span>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                          <div className="pay-upi-divider">or pay using UPI ID</div>
                          <div className="pay-upi-id-row">
                            <div style={{ flex: 1 }}>
                              <input
                                className={`pay-input${errors.upiId ? " err" : ""}`}
                                placeholder="e.g. yourname@upi"
                                value={upiId}
                                onChange={(e) => { setUpiId(e.target.value); setUseUpiId(!!e.target.value); setErrors({}); }}
                              />
                              {errors.upiId && <div className="pay-input-err">{errors.upiId}</div>}
                            </div>
                            <button className="pay-verify-btn">Verify</button>
                          </div>
                        </>
                      )}

                      {/* ── Card ── */}
                      {m.id === "card" && (
                        <div className="pay-card-form">
                          <div className="pay-card-icons">
                            {[["#1a1f71","VISA"],["#eb001b","MC"],["#003087","PP"],["#ff6600","RuPay"]].map(([bg, label]) => (
                              <div key={label} className="pay-card-icon" style={{ background: bg }}>{label}</div>
                            ))}
                          </div>
                          <div>
                            <label className="pay-label">Card Number</label>
                            <input
                              className={`pay-input${errors.cardNum ? " err" : ""}`}
                              placeholder="1234 5678 9012 3456"
                              value={cardNum}
                              maxLength={19}
                              onChange={(e) => { setCardNum(formatCard(e.target.value)); setErrors({}); }}
                            />
                            {errors.cardNum && <div className="pay-input-err">{errors.cardNum}</div>}
                          </div>
                          <div>
                            <label className="pay-label">Cardholder Name</label>
                            <input
                              className={`pay-input${errors.cardName ? " err" : ""}`}
                              placeholder="Name as on card"
                              value={cardName}
                              onChange={(e) => { setCardName(e.target.value); setErrors({}); }}
                            />
                            {errors.cardName && <div className="pay-input-err">{errors.cardName}</div>}
                          </div>
                          <div className="pay-card-row">
                            <div>
                              <label className="pay-label">Expiry Date</label>
                              <input
                                className={`pay-input${errors.cardExp ? " err" : ""}`}
                                placeholder="MM/YY"
                                value={cardExp}
                                maxLength={5}
                                onChange={(e) => { setCardExp(formatExp(e.target.value)); setErrors({}); }}
                              />
                              {errors.cardExp && <div className="pay-input-err">{errors.cardExp}</div>}
                            </div>
                            <div>
                              <label className="pay-label">CVV</label>
                              <input
                                className={`pay-input${errors.cardCvv ? " err" : ""}`}
                                placeholder="•••"
                                type="password"
                                maxLength={4}
                                value={cardCvv}
                                onChange={(e) => { setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4)); setErrors({}); }}
                              />
                              {errors.cardCvv && <div className="pay-input-err">{errors.cardCvv}</div>}
                            </div>
                          </div>
                          <label className="pay-save-row">
                            <input type="checkbox" checked={saveCard} onChange={(e) => setSaveCard(e.target.checked)} />
                            Save this card for future payments
                          </label>
                        </div>
                      )}

                      {/* ── Net Banking ── */}
                      {m.id === "netbanking" && (
                        <>
                          <label className="pay-label">Select Your Bank</label>
                          <select className="pay-bank-select" value={bank} onChange={(e) => setBank(e.target.value)}>
                            {BANKS.map((b) => <option key={b}>{b}</option>)}
                          </select>
                          <p className="pay-bank-note">
                            You will be redirected to your bank's secure portal to complete the payment.
                            Please do not close the browser or press the back button during the transaction.
                          </p>
                        </>
                      )}

                      {/* ── Wallets ── */}
                      {m.id === "wallet" && (
                        <div className="pay-wallets">
                          {[
                            { id: "paytm",  label: "Paytm",       bg: "#00baf2", letter: "P"  },
                            { id: "amazon", label: "Amazon Pay",  bg: "#ff9900", letter: "A"  },
                            { id: "free",   label: "Freecharge",  bg: "#ff5722", letter: "FC" },
                            { id: "jiop",   label: "JioPay",      bg: "#0085ca", letter: "J"  },
                          ].map((w) => (
                            <div
                              key={w.id}
                              className={`pay-wallet-btn${wallet === w.id ? " active" : ""}`}
                              onClick={() => setWallet(w.id)}
                            >
                              <div className="pay-wallet-icon" style={{ background: w.bg }}>{w.letter}</div>
                              <span className="pay-wallet-name">{w.label}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* ── COD ── */}
                      {m.id === "cod" && (
                        <div className="pay-cod-box">
                          <div className="pay-cod-title">
                            <i className="fas fa-info-circle" style={{ color: "#1d5ba0", marginRight: 6 }}></i>
                            Cash on Delivery
                          </div>
                          <p className="pay-cod-note">
                            Pay in cash when your order arrives. Our delivery partner will carry a receipt.
                            Please keep the exact amount ready at the time of delivery.
                          </p>
                          <span className="pay-cod-fee">₹20 COD handling fee applicable</span>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* ── RIGHT: Order Summary ── */}
            <div className="pay-summary">
              <div className="pay-summary-title">
                <i className="fas fa-receipt" style={{ color: "#1d5ba0", marginRight: 8 }}></i>
                Order Summary
              </div>

              {/* Items */}
              <div className="pay-summary-items">
                {cart.map((item) => {
                  const price = parseFloat(String(item.price || "").replace(/[^0-9.]/g, "")) || 0;
                  return (
                    <div key={item._uid} className="pay-summary-item">
                      <div className="pay-summary-img">
                        <img src={item.imageUrl} alt={item.name} />
                      </div>
                      <div className="pay-summary-name">
                        {item.name}
                        <div className="pay-summary-qty">Qty: {item.quantity}</div>
                      </div>
                      <div className="pay-summary-price">₹{(price * item.quantity).toFixed(2)}</div>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className="pay-summary-rows">
                <div className="pay-summary-row">
                  <span>Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})</span>
                  <span style={{ fontWeight: 700 }}>₹{(total - delivery).toFixed(2)}</span>
                </div>
                <div className="pay-summary-row">
                  <span>Delivery</span>
                  <span>
                    {delivery === 0
                      ? <span className="pay-free-tag">FREE</span>
                      : `₹${delivery}`}
                  </span>
                </div>
                {method === "cod" && (
                  <div className="pay-summary-row">
                    <span>COD Fee</span>
                    <span style={{ fontWeight: 700 }}>₹20.00</span>
                  </div>
                )}
                <div className="pay-summary-row total">
                  <span>Total</span>
                  <span style={{ color: "#1d5ba0" }}>₹{(total + (method === "cod" ? 20 : 0)).toFixed(2)}</span>
                </div>
              </div>

              {/* Delivery address */}
              {address && (
                <div className="pay-addr-box">
                  <i className="fas fa-map-marker-alt"></i>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 2 }}>Delivering to: {address.type}</div>
                    <div style={{ color: "var(--body)", fontSize: 12 }}>{address.text}</div>
                  </div>
                </div>
              )}

              {/* Pay button */}
              <button
                className={`pay-now-btn${placing ? " loading" : ""}`}
                onClick={handlePay}
                disabled={placing}
              >
                {placing
                  ? <><div className="pay-spinner"></div> Processing...</>
                  : <><i className="fas fa-lock"></i> Pay ₹{(total + (method === "cod" ? 20 : 0)).toFixed(2)}</>
                }
              </button>

              <div className="pay-safe">
                <i className="fas fa-shield-alt" style={{ color: "#16a34a" }}></i>
                100% Secure &amp; Encrypted Payment
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}