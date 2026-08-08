"use client";
// app/(customer)/favorites/page.js
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import Navbar from "@/components/customer/Navbar";
import Footer from "@/components/customer/Footer";
import ItemCard from "@/components/customer/ItemCard";
import Spinner from "@/components/ui/Spinner";
import ProtectedRoute from "@/components/shared/ProtectedRoute";

function FavoritesContent() {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient.get("/favorites").then((data) => setFavorites(data.favorites)).finally(() => setIsLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        <h1 style={{ fontSize: 28, marginBottom: 24 }}>Favorites</h1>
        {isLoading ? <Spinner /> : favorites.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)" }}>No favorites yet — tap the heart on any item to save it here.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
            {favorites.map((item) => <ItemCard key={item._id} item={item} />)}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

export default function FavoritesPage() {
  return (
    <ProtectedRoute allowedRoles={["CUSTOMER"]}>
      <FavoritesContent />
    </ProtectedRoute>
  );
}
