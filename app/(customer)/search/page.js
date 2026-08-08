"use client";
// app/(customer)/search/page.js
import { useState } from "react";
import { apiClient } from "@/lib/apiClient";
import Navbar from "@/components/customer/Navbar";
import Footer from "@/components/customer/Footer";
import ItemCard from "@/components/customer/ItemCard";
import Input from "@/components/ui/Input";
import Spinner from "@/components/ui/Spinner";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setIsLoading(true);
    setHasSearched(true);
    try {
      const data = await apiClient.get(`/menu?search=${encodeURIComponent(query)}`);
      setResults(data.items);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 700, margin: "0 auto", padding: "40px 24px" }}>
        <h1 style={{ fontSize: 28, marginBottom: 20 }}>Search</h1>
        <form onSubmit={handleSearch} style={{ marginBottom: 24 }}>
          <Input placeholder="Search for burgers, pizza, deals…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </form>

        {isLoading ? (
          <Spinner />
        ) : hasSearched && results.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)" }}>No items matched "{query}".</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
            {results.map((item) => <ItemCard key={item._id} item={item} />)}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
