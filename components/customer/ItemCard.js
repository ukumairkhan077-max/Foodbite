"use client";
// components/customer/ItemCard.js
// A single menu item tile used on the menu/home/search pages.

import Link from "next/link";
import { formatPrice } from "@/lib/formatPrice";
import { useCart } from "@/context/CartContext";

function resolveBadge(item) {
  if (item.badge) return item.badge;
  if (item.isDeal) return "Deal";
  if (item.isFeatured) return "Best Seller";
  return null;
}

export default function ItemCard({ item }) {
  const { addItem } = useCart();
  const badge = resolveBadge(item);

  function handleQuickAdd(e) {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      menuItemId: item._id,
      name: item.name,
      price: item.price,
      variant: null,
      addOns: [],
      quantity: 1,
    });
  }

  return (
    <Link href={`/item/${item._id}`} className="item-card">
      <div className="item-card-media">
        {badge && <span className="item-badge">{badge}</span>}
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} loading="lazy" />
        ) : (
          <span style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)", fontSize: 13 }}>
            No image
          </span>
        )}
      </div>

      <div className="item-card-body">
        <h3 className="item-card-name">{item.name}</h3>
        {item.description && <p className="item-card-desc">{item.description}</p>}
        {item.avgRating > 0 && (
          <p className="item-card-rating">★ {item.avgRating.toFixed(1)} ({item.reviewCount})</p>
        )}
        <div className="item-card-footer">
          <span className="item-card-price">{formatPrice(item.price)}</span>
          <button className="btn-add" onClick={handleQuickAdd} aria-label={`Add ${item.name} to cart`}>
            +
          </button>
        </div>
      </div>
    </Link>
  );
}
