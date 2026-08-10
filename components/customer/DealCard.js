"use client";
// components/customer/DealCard.js — same shape as ItemCard, but styled for isDeal items
import Link from "next/link";
import { formatPrice } from "@/lib/formatPrice";

export default function DealCard({ item }) {
  return (
    <Link
      href={`/item/${item._id}`}
      style={{
        display: "flex", gap: 14, textDecoration: "none", color: "inherit",
        background: "var(--color-surface)", border: "1px solid var(--color-accent)",
        borderRadius: "var(--radius)", padding: 14,
      }}
    >
      <div style={{ width: 80, height: 80, flexShrink: 0, background: "#2a231b", borderRadius: 10, overflow: "hidden" }}>
        {item.imageUrl && <img src={item.imageUrl} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
      </div>
      <div>
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-accent)", textTransform: "uppercase" }}>Deal</span>
        <h3 style={{ fontSize: 15, margin: "4px 0" }}>{item.name}</h3>
        <p style={{ color: "var(--color-accent)", fontWeight: 700 }}>{formatPrice(item.price)}</p>
      </div>
    </Link>
  );
}
