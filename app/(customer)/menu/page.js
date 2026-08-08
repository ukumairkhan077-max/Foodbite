"use client";
// app/(customer)/menu/page.js — Full menu with category filter tabs
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import Navbar from "@/components/customer/Navbar";
import Footer from "@/components/customer/Footer";
import ItemCard from "@/components/customer/ItemCard";
import Spinner from "@/components/ui/Spinner";

export default function MenuPage() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient.get("/categories").then((data) => setCategories(data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const query = activeCategory ? `?category=${activeCategory}` : "";
    apiClient
      .get(`/menu${query}`)
      .then((data) => setItems(data.items))
      .catch(() => setItems([]))
      .finally(() => setIsLoading(false));
  }, [activeCategory]);

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        <h1 style={{ fontSize: 28, marginBottom: 20 }}>Menu</h1>

        <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
          <button
            onClick={() => setActiveCategory(null)}
            style={{
              padding: "8px 16px", borderRadius: 999, cursor: "pointer",
              background: !activeCategory ? "var(--color-accent)" : "var(--color-surface)",
              color: !activeCategory ? "#1a1410" : "var(--color-text)",
              border: "1px solid var(--color-border)", fontWeight: 600, fontSize: 13,
            }}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setActiveCategory(cat._id)}
              style={{
                padding: "8px 16px", borderRadius: 999, cursor: "pointer",
                background: activeCategory === cat._id ? "var(--color-accent)" : "var(--color-surface)",
                color: activeCategory === cat._id ? "#1a1410" : "var(--color-text)",
                border: "1px solid var(--color-border)", fontWeight: 600, fontSize: 13,
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {isLoading ? (
          <Spinner />
        ) : items.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)" }}>No items found.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
            {items.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
