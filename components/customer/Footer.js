// components/customer/Footer.js
const FEATURES = [
  { icon: "⚡", title: "Fast Delivery", sub: "30-45 mins at your doorstep" },
  { icon: "😊", title: "100% Satisfaction", sub: "No regrets. Just pure taste." },
  { icon: "🔒", title: "Secure Payment", sub: "Your payment is safe with us." },
  { icon: "🔥", title: "Hot & Fresh", sub: "Cooked to order. Always fresh." },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-features">
        {FEATURES.map((f) => (
          <div className="footer-feature" key={f.title}>
            <span className="footer-feature-icon">{f.icon}</span>
            <div>
              <p className="footer-feature-title">{f.title}</p>
              <p className="footer-feature-sub">{f.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Foodbite. All rights reserved.</p>
        <p>Need help? <a href="/support" className="helper-link">Contact support</a></p>
      </div>
    </footer>
  );
}
