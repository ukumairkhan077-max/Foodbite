"use client";
// app/(customer)/deals/page.js
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { getDummyMenuItemsWithCategory } from "@/data/dummyMenuData";
import Navbar from "@/components/customer/Navbar";
import Footer from "@/components/customer/Footer";
import DealCard from "@/components/customer/DealCard";
import Spinner from "@/components/ui/Spinner";

export default function DealsPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/menu")
      .then((data) => {
        const deals = (data.items || []).filter((i) => i.isDeal);
        setItems(deals.length > 0 ? deals : getDummyMenuItemsWithCategory().filter((i) => i.isDeal));
      })
      .catch(() => {
        // Bug fix: the original version had no .catch(), so a failed request
        // (e.g. DB down) left the page stuck with an empty list and an
        // unhandled promise rejection in the console.
        setItems(getDummyMenuItemsWithCategory().filter((i) => i.isDeal));
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main className="page-container" style={{ maxWidth: 720 }}>
        <p className="section-eyebrow">Feeling Extra?</p>
        <h1 className="section-title">Deals & Combos 🔥</h1>
        {isLoading ? (
          <Spinner />
        ) : items.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)" }}>No deals right now — check back soon.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {items.map((item) => (
              <DealCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
