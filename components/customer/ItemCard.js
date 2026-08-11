"use client";
// components/customer/ItemCard.js
// A single menu item tile — clean white card: plain product photo, heart
// favorite toggle, name, description, price + "Starting Price" pill, and a
// full-width Add to Cart button.

import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/lib/formatPrice";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/apiClient";

export default function ItemCard({ item }) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  function handleAddToCart(e) {
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

  async function handleToggleFavorite(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!user || isTogglingFavorite) return; // heart is decorative until logged in

    setIsTogglingFavorite(true);
    const nextState = !isFavorited;
    setIsFavorited(nextState); // optimistic

    try {
      if (nextState) {
        await apiClient.post("/favorites", { menuItemId: item._id });
      } else {
        await apiClient.delete(`/favorites/${item._id}`);
      }
    } catch {
      setIsFavorited(!nextState); // revert on failure
    } finally {
      setIsTogglingFavorite(false);
    }
  }

  return (
    <Link href={`/item/${item._id}`} className="pcard">
      <div className="pcard-media">
        <button
          className={`pcard-heart ${isFavorited ? "pcard-heart-active" : ""}`}
          onClick={handleToggleFavorite}
          aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={isFavorited ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
          </svg>
        </button>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} loading="lazy" />
        ) : (
          <span className="pcard-noimg">No image</span>
        )}
      </div>

      <div className="pcard-body">
        <h3 className="pcard-name">{item.name}</h3>
        {item.description && <p className="pcard-desc">{item.description}</p>}

        <div className="pcard-price-row">
          <span className="pcard-price">{formatPrice(item.price)}</span>
          {item.variants?.length > 0 && <span className="pcard-pill">Starting Price</span>}
        </div>

        <button className="pcard-add-btn" onClick={handleAddToCart}>
          + Add to Cart
        </button>
      </div>
    </Link>
  );
}