"use client";
// components/admin/Sidebar.js
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/menu", label: "Menu" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/branches", label: "Branches" },
  { href: "/admin/riders", label: "Riders" },
  { href: "/admin/users", label: "Customers" },
  { href: "/admin/admins", label: "Admins" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/reports", label: "Reports" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={{ width: 220, borderRight: "1px solid var(--color-border)", padding: "24px 16px", height: "100dvh", position: "sticky", top: 0 }}>
      <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, marginBottom: 24, padding: "0 8px" }}>
        Food<span style={{ color: "var(--color-accent)" }}>bite</span> Admin
      </p>
      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {LINKS.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                padding: "10px 12px", borderRadius: 8, fontSize: 14, textDecoration: "none",
                color: isActive ? "#1a1410" : "var(--color-text)",
                background: isActive ? "var(--color-accent)" : "transparent",
                fontWeight: isActive ? 700 : 500,
              }}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
