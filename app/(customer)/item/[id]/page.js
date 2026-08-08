"use client";
// app/(customer)/item/[id]/page.js — Item detail with variant/add-on selection and add-to-cart

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/formatPrice";
import Navbar from "@/components/customer/Navbar";
import Footer from "@/components/customer/Footer";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";

export default function ItemDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addItem } = useCart();

  const [item, setItem] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get(`/menu/${id}`)
      .then((data) => {
        setItem(data.item);
        if (data.item.variants?.length) setSelectedVariant(data.item.variants[0].name);
      })
      .finally(() => setIsLoading(false));

    apiClient.get(`/reviews?menuItem=${id}`).then((data) => setReviews(data.reviews)).catch(() => {});
  }, [id]);

  function toggleAddOn(name) {
    setSelectedAddOns((prev) => (prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]));
  }

  function calculateUnitPrice() {
    if (!item) return 0;
    let price = item.price;
    const variant = item.variants?.find((v) => v.name === selectedVariant);
    if (variant) price += variant.priceDiff;
    selectedAddOns.forEach((name) => {
      const addOn = item.addOns?.find((a) => a.name === name);
      if (addOn) price += addOn.price;
    });
    return price;
  }

  function handleAddToCart() {
    addItem({
      menuItemId: item._id,
      name: item.name,
      variant: selectedVariant,
      addOns: selectedAddOns,
      price: calculateUnitPrice(),
      quantity,
    });
    router.push("/cart");
  }

  if (isLoading) return <Spinner />;
  if (!item) return <p style={{ padding: 40 }}>Item not found.</p>;

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 700, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ aspectRatio: "16/9", background: "#2a231b", borderRadius: "var(--radius)", marginBottom: 24, overflow: "hidden" }}>
          {item.imageUrl && <img src={item.imageUrl} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
        </div>

        <h1 style={{ fontSize: 28, marginBottom: 8 }}>{item.name}</h1>
        <p style={{ color: "var(--color-text-muted)", marginBottom: 16 }}>{item.description}</p>

        {item.variants?.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <p className="field-label">Size</p>
            <div style={{ display: "flex", gap: 10 }}>
              {item.variants.map((v) => (
                <button
                  key={v.name}
                  onClick={() => setSelectedVariant(v.name)}
                  style={{
                    padding: "8px 16px", borderRadius: 8, cursor: "pointer",
                    background: selectedVariant === v.name ? "var(--color-accent)" : "var(--color-surface)",
                    color: selectedVariant === v.name ? "#1a1410" : "var(--color-text)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  {v.name} {v.priceDiff > 0 && `+${formatPrice(v.priceDiff)}`}
                </button>
              ))}
            </div>
          </div>
        )}

        {item.addOns?.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <p className="field-label">Add-ons</p>
            {item.addOns.map((a) => (
              <label key={a.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", cursor: "pointer" }}>
                <input type="checkbox" checked={selectedAddOns.includes(a.name)} onChange={() => toggleAddOn(a.name)} />
                <span>{a.name} — {formatPrice(a.price)}</span>
              </label>
            ))}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
          <p className="field-label" style={{ marginBottom: 0 }}>Qty</p>
          <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} style={{ width: 30, height: 30, borderRadius: 6, background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)", cursor: "pointer" }}>−</button>
          <span>{quantity}</span>
          <button onClick={() => setQuantity((q) => q + 1)} style={{ width: 30, height: 30, borderRadius: 6, background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)", cursor: "pointer" }}>+</button>
        </div>

        <Button onClick={handleAddToCart} style={{ width: "100%", marginBottom: 40 }}>
          Add to cart — {formatPrice(calculateUnitPrice() * quantity)}
        </Button>

        <h2 style={{ fontSize: 20, marginBottom: 16 }}>Reviews</h2>
        {reviews.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)" }}>No reviews yet.</p>
        ) : (
          reviews.map((r) => (
            <div key={r._id} style={{ borderBottom: "1px solid var(--color-border)", padding: "12px 0" }}>
              <p style={{ color: "var(--color-accent)" }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
              {r.comment && <p style={{ fontSize: 14, marginTop: 4 }}>{r.comment}</p>}
              <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 4 }}>{r.user?.name}</p>
            </div>
          ))
        )}
      </main>
      <Footer />
    </>
  );
}
