"use client";
// app/(customer)/deals/page.js
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import Navbar from "@/components/customer/Navbar";
import Footer from "@/components/customer/Footer";
import DealCard from "@/components/customer/DealCard";
import Spinner from "@/components/ui/Spinner";

export default function DealsPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient.get("/menu").then((data) => setItems(data.items.filter((i) => i.isDeal))).finally(() => setIsLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 700, margin: "0 auto", padding: "40px 24px" }}>
        <h1 style={{ fontSize: 28, marginBottom: 24 }}>Deals & Combos</h1>
        {isLoading ? <Spinner /> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {items.map((item) => <DealCard key={item._id} item={item} />)}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
