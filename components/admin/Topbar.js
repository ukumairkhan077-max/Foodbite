"use client";
// components/admin/Topbar.js
import { useAuth } from "@/context/AuthContext";

export default function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 16, padding: "16px 24px", borderBottom: "1px solid var(--color-border)" }}>
      <span style={{ fontSize: 14, color: "var(--color-text-muted)" }}>{user?.name} ({user?.role})</span>
      <button onClick={logout} style={{ background: "none", border: "1px solid var(--color-border)", color: "var(--color-text)", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>
        Log out
      </button>
    </header>
  );
}
