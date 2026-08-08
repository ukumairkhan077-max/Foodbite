"use client";
// app/(customer)/menu/[category]/page.js — Menu filtered to one category (via URL, not just a client-side tab)
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import Navbar from "@/components/customer/Navbar";
import Footer from "@/components/customer/Footer";
import ItemCard from "@/components/customer/ItemCard";
import Spinner from "@/components/ui/Spinner";

export default function CategoryMenuPage() {
  const { category } = useParams(); // this is the category's slug or id, depending on how you link to it
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get(`/menu?category=${category}`)
      .then((data) => setItems(data.items))
      .catch(() => setItems([]))
      .finally(() => setIsLoading(false));
  }, [category]);

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        <h1 style={{ fontSize: 28, marginBottom: 20, textTransform: "capitalize" }}>{category}</h1>
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
