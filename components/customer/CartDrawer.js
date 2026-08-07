"use client";
// components/customer/CartDrawer.js
// Compact cart summary — reused on the /cart page. Lets the customer adjust
// quantities or remove items, and shows the running subtotal.

import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/formatPrice";
import Button from "@/components/ui/Button";

export default function CartDrawer() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();

  if (items.length === 0) {
    return <p style={{ color: "var(--color-text-muted)" }}>Your cart is empty.</p>;
  }

  return (
    <div>
      {items.map((item) => (
        <div
          key={item.lineId}
          style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "14px 0", borderBottom: "1px solid var(--color-border)",
          }}
        >
          <div>
            <p style={{ fontWeight: 600 }}>{item.name}</p>
            {item.variant && <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>{item.variant}</p>}
            {item.addOns?.length > 0 && (
              <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                + {item.addOns.join(", ")}
              </p>
            )}
            <p style={{ fontSize: 13, color: "var(--color-accent)" }}>{formatPrice(item.price)}</p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => updateQuantity(item.lineId, item.quantity - 1)} style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", borderRadius: 6, width: 26, height: 26, cursor: "pointer" }}>−</button>
            <span>{item.quantity}</span>
            <button onClick={() => updateQuantity(item.lineId, item.quantity + 1)} style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", borderRadius: 6, width: 26, height: 26, cursor: "pointer" }}>+</button>
            <button onClick={() => removeItem(item.lineId)} style={{ background: "none", border: "none", color: "var(--color-chili)", cursor: "pointer", marginLeft: 6 }}>Remove</button>
          </div>
        </div>
      ))}

      <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0", fontWeight: 700 }}>
        <span>Subtotal</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
    </div>
  );
}
