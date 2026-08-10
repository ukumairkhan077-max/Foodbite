"use client";
// components/admin/OrderQueueCard.js
import Link from "next/link";
import { formatPrice } from "@/lib/formatPrice";

const NEXT_STATUS = { PENDING: "ACCEPTED", ACCEPTED: "PREPARING", PREPARING: "OUT_FOR_DELIVERY", OUT_FOR_DELIVERY: "DELIVERED" };

export default function OrderQueueCard({ order, onAdvance }) {
  const nextStatus = NEXT_STATUS[order.status];

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, marginBottom: 10, borderRadius: 10, background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
      <div>
        <Link href={`/admin/orders/${order._id}`} style={{ fontWeight: 600, color: "var(--color-text)", textDecoration: "none" }}>
          #{order._id.slice(-6).toUpperCase()}
        </Link>
        <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>{order.status} — {formatPrice(order.total)}</p>
      </div>
      {nextStatus && (
        <button onClick={() => onAdvance(order._id, nextStatus)} style={{ background: "var(--color-accent)", border: "none", color: "#1a1410", padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
          Mark {nextStatus.replace(/_/g, " ").toLowerCase()}
        </button>
      )}
    </div>
  );
}
