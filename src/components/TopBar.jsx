// src/components/TopBar.jsx
export default function TopBar() {
  return (
    <div className="top-announcement-bar">
      <div className="bar-container">
        <div className="left-links">
          <a href="#">About Us</a>
          <span className="separator">|</span>
          <a href="#">My Account</a>
          <span className="separator">|</span>
          <a href="#">Wishlist</a>
          <span className="separator">|</span>
          <a href="#">Order Tracking</a>
        </div>

        <div className="center-message">
          <strong>100% Secure delivery without contacting the courier</strong>
        </div>

        <div className="right-section">
          <div className="phone">
            Need help? Call us: <a href="tel:+180088550199">+180088550199</a>
          </div>
          <span className="separator">|</span>
          <div className="selectors">
            <select className="lang-select">
              <option>English</option>
              <option>हिन्दी</option>
            </select>
            <span className="separator">|</span>
            <select className="currency-select">
              <option>INR</option>
              <option>USD</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
