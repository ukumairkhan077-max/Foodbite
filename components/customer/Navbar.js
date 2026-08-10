"use client";
// components/customer/Navbar.js
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand-logo">
          Food<span>bite</span>
        </Link>

        <nav className="nav-links">
          <Link href="/menu" className="nav-link">Menu</Link>
          <Link href="/deals" className="nav-link">Deals</Link>
          <Link href="/branches" className="nav-link">Branches</Link>
          <Link href="/orders" className="nav-link">My Orders</Link>
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/search" className="nav-icon-btn" aria-label="Search">
            🔍
          </Link>

          <Link href="/cart" className="nav-icon-btn" aria-label="Cart">
            🛒
            {itemCount > 0 && <span className="nav-cart-count">{itemCount}</span>}
          </Link>

          {user ? (
            <>
              <Link href="/profile" className="nav-icon-btn" aria-label="Profile" style={{ fontSize: 13, fontWeight: 700 }}>
                {(user.name?.[0] || "U").toUpperCase()}
              </Link>
              <button onClick={logout} className="nav-link" style={{ background: "none", border: "none", cursor: "pointer", font: "inherit" }}>
                Log out
              </button>
            </>
          ) : (
            <Link href="/auth/login" className="btn-cta" style={{ padding: "9px 18px", fontSize: 13.5 }}>
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
