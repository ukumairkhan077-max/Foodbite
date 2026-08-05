"use client";
// context/CartContext.js
// In-memory cart state (per browser session). Each cart line stores the menuItemId,
// chosen variant/add-ons, quantity, and a price snapshot — mirrors how the backend's
// Order.items are structured, so checkout can send this shape directly.

import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]); // [{ lineId, menuItemId, name, price, variant, addOns, quantity }]

  function addItem(newItem) {
    const lineId = `${newItem.menuItemId}-${newItem.variant || "base"}-${(newItem.addOns || []).join(",")}`;

    setItems((prev) => {
      const existing = prev.find((i) => i.lineId === lineId);
      if (existing) {
        return prev.map((i) => (i.lineId === lineId ? { ...i, quantity: i.quantity + newItem.quantity } : i));
      }
      return [...prev, { ...newItem, lineId }];
    });
  }

  function updateQuantity(lineId, quantity) {
    if (quantity <= 0) {
      removeItem(lineId);
      return;
    }
    setItems((prev) => prev.map((i) => (i.lineId === lineId ? { ...i, quantity } : i)));
  }

  function removeItem(lineId) {
    setItems((prev) => prev.filter((i) => i.lineId !== lineId));
  }

  function clearCart() {
    setItems([]);
  }

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);
  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, clearCart, subtotal, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside a CartProvider");
  return ctx;
}