"use client";
// app/(customer)/page.js — Home page: banners, featured/deal items
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import Navbar from "@/components/customer/Navbar";
import Footer from "@/components/customer/Footer";
import ItemCard from "@/components/customer/ItemCard";
import Spinner from "@/components/ui/Spinner";

export default function HomePage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/menu")
      .then((data) => setItems(data.items))
      .catch(() => setItems([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        <section style={{ marginBottom: 40 }}>
          <p className="auth-eyebrow">Hungry?</p>
          <h1 style={{ fontSize: 36, marginBottom: 8 }}>Order your favorites, delivered fast.</h1>
          <p style={{ color: "var(--color-text-muted)" }}>Fresh food from the branch nearest you.</p>
        </section>

        <h2 style={{ fontSize: 22, marginBottom: 16 }}>Popular right now</h2>

        {isLoading ? (
          <Spinner />
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
