// src/components/Footer.jsx

const UNDER_DEV_LINKS = new Set([
  "About Us","Delivery Information","Privacy Policy","Terms & Conditions",
  "Contact Us","Support Center","Careers",
  "Sign In","View Cart","My Wishlist","Track My Order","Help Ticket",
  "Shipping Details","Compare products",
  "Become a Vendor","Affiliate Program","Farm Business","Farm Careers",
  "Our Suppliers","Accessibility","Promotions",
  "Milk & Flavoured Milk","Butter and Margarine","Eggs Substitutes",
  "Marmalades","Sour Cream and Dips","Tea & Kombucha","Cheese",
]);

function FooterLink({ children, href = "#", className }) {
  // Decode HTML entities for matching (e.g. &amp; → &)
  const label = typeof children === "string" ? children : "";
  const isDevLink = UNDER_DEV_LINKS.has(label);

  const handleClick = (e) => {
    if (isDevLink) {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent("open-under-dev", { detail: { label } }));
    }
  };

  return (
    <a href={isDevLink ? "#" : href} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}

export default function Footer() {
  return (
    <footer className="footer">

      {/* TOP SECTION */}
      <div className="footer-top">

        {/* COL 1: Brand + Contact */}
        <div className="footer-col footer-brand">
          <a href="#" className="brand-logo">
            <div className="logo-icon">
              <img src="assets/logo watermark.png" alt="logo" />
            </div>
            <div className="logo-text">
              <strong>PRIME-BASKET</strong>
            </div>
          </a>

          <p className="brand-desc">Awesome grocery store website template</p>

          <ul className="contact-list">
            <li>
              <span className="ci ci-addr">
                <i className="fa-solid fa-location-dot" style={{ color: "#1d5ba0", fontSize: "18px" }}></i>
              </span>
              <span><strong>Address</strong> KPHB, JNTU Road, Hyderabad - 500085</span>
            </li>
            <li>
              <span className="ci ci-phone">
                <i className="fa-solid fa-phone" style={{ color: "#1d5ba0", fontSize: "15px" }}></i>
              </span>
              <span>Call Us &nbsp;<a href="tel:+918008550199">+918008550199</a></span>
            </li>
            <li>
              <span className="ci ci-email">
                <i className="fa-solid fa-envelope" style={{ color: "#1d5ba0", fontSize: "15px" }}></i>
              </span>
              <span>Email &nbsp;<a href="mailto:support@PrimeBasket.com">support@PrimeBasket.com</a></span>
            </li>
            <li>
              <span className="ci ci-hours">
                <i className="fa-solid fa-clock" style={{ color: "#1d5ba0", fontSize: "15px" }}></i>
              </span>
              <span>Hours 10:00 – 18:00, Mon – Sat</span>
            </li>
          </ul>
        </div>

        {/* COL 2: Company */}
        <div className="footer-col">
          <h4>Company</h4>
          <ul>
            <li><FooterLink>About Us</FooterLink></li>
            <li><FooterLink>Delivery Information</FooterLink></li>
            <li><FooterLink>Privacy Policy</FooterLink></li>
            <li><FooterLink>Terms &amp; Conditions</FooterLink></li>
            <li><FooterLink>Contact Us</FooterLink></li>
            <li><FooterLink>Support Center</FooterLink></li>
            <li><FooterLink>Careers</FooterLink></li>
          </ul>
        </div>

        {/* COL 3: Account */}
        <div className="footer-col">
          <h4>Account</h4>
          <ul>
            <li><FooterLink>Sign In</FooterLink></li>
            <li><FooterLink>View Cart</FooterLink></li>
            <li><FooterLink>My Wishlist</FooterLink></li>
            <li><FooterLink>Track My Order</FooterLink></li>
            <li><FooterLink>Help Ticket</FooterLink></li>
            <li><FooterLink>Shipping Details</FooterLink></li>
            <li><FooterLink>Compare products</FooterLink></li>
          </ul>
        </div>

        {/* COL 4: Corporate */}
        <div className="footer-col">
          <h4>Corporate</h4>
          <ul>
            <li><FooterLink>Become a Vendor</FooterLink></li>
            <li><FooterLink>Affiliate Program</FooterLink></li>
            <li><FooterLink>Farm Business</FooterLink></li>
            <li><FooterLink>Farm Careers</FooterLink></li>
            <li><FooterLink>Our Suppliers</FooterLink></li>
            <li><FooterLink>Accessibility</FooterLink></li>
            <li><FooterLink>Promotions</FooterLink></li>
          </ul>
        </div>

        {/* COL 5: Popular */}
        <div className="footer-col">
          <h4>Popular</h4>
          <ul>
            <li><FooterLink>Milk &amp; Flavoured Milk</FooterLink></li>
            <li><FooterLink>Butter and Margarine</FooterLink></li>
            <li><FooterLink>Eggs Substitutes</FooterLink></li>
            <li><FooterLink>Marmalades</FooterLink></li>
            <li><FooterLink>Sour Cream and Dips</FooterLink></li>
            <li><FooterLink>Tea &amp; Kombucha</FooterLink></li>
            <li><FooterLink>Cheese</FooterLink></li>
          </ul>
        </div>

        {/* COL 6: Install App */}
        <div className="footer-col app-col">
          <h4>Install App</h4>
          <p className="app-sub">From App Store or Google Play</p>

          <div className="app-buttons">
            <a href="#" className="app-btn">
              <i className="fa-brands fa-google-play"></i>
              <div className="btn-text">
                <small>Get it on</small>
                <strong>Google Play</strong>
              </div>
            </a>
            <a href="#" className="app-btn">
              <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              <div className="btn-text">
                <small>Download on the</small>
                <strong>App Store</strong>
              </div>
            </a>
          </div>

          <p className="payment-title">Secured Payment Gateways</p>
          <div className="payment-icons">
            <img src="assets/payment-method.png" alt="payment" />
          </div>
        </div>

      </div>

      <hr className="footer-divider" />

      <div className="footer-bottom">
        <div className="copyright">
          <div>© 2026 – <strong>Prime Basket</strong></div>
          <div>All rights reserved</div>
        </div>

        <div className="phone-group">
          <div className="phone-item">
            <i className="fa-solid fa-phone-volume" style={{ color: "#1d5ba0", fontSize: "20px" }}></i>
            <div className="phone-details">
              <span className="phone-num">1900646666</span>
              <span className="phone-label">Working 8:00 – 22:00</span>
            </div>
          </div>
          <div className="phone-item">
            <i className="fa-solid fa-phone-volume" style={{ color: "#1d5ba0", fontSize: "20px" }}></i>
            <div className="phone-details">
              <span className="phone-num">1900648888</span>
              <span className="phone-label">24/7 Support</span>
            </div>
          </div>
        </div>

        <div className="social-group">
          <div className="social-row">
            <span className="social-label">Follow Us</span>
            <div className="social-icons">
              <a href="#" className="soc-btn" aria-label="Facebook">
                <svg viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="#" className="soc-btn tw" aria-label="Twitter">
                <svg viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                </svg>
              </a>
              <a href="#" className="soc-btn wa" aria-label="WhatsApp">
                <svg viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.113 1.526 5.836L0 24l6.335-1.499A11.952 11.952 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.89 0-3.663-.5-5.201-1.374l-.374-.217-3.76.889.94-3.66-.239-.386A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                </svg>
              </a>
              <a href="#" className="soc-btn ig" aria-label="Instagram">
                <i className="fa-brands fa-instagram" style={{ color: "white", fontSize: "17px" }}></i>
              </a>
            </div>
          </div>
          <div className="social-discount">Up to 15% discount on your first subscribe</div>
        </div>
      </div>

    </footer>
  );
}