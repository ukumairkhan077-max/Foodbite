"use client";
// app/(customer)/menu/page.js — Full menu with category filter pills
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { dummyCategories, getDummyMenuItemsWithCategory } from "@/data/dummyMenuData";
import Navbar from "@/components/customer/Navbar";
import Footer from "@/components/customer/Footer";
import ItemCard from "@/components/customer/ItemCard";
import Spinner from "@/components/ui/Spinner";

export default function MenuPage() {
  const [categories, setCategories] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [usingDemoData, setUsingDemoData] = useState(false);

  // Load categories — fall back to demo categories if the API/DB is empty or unreachable.
  useEffect(() => {
    apiClient
      .get("/categories")
      .then((data) => {
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
        } else {
          setCategories(dummyCategories);
          setUsingDemoData(true);
        }
      })
      .catch(() => {
        setCategories(dummyCategories);
        setUsingDemoData(true);
      });
  }, []);

  // Load all menu items once — filtering by category happens client-side so the
  // demo-data fallback works the same way the real API's ?category= filter does.
  useEffect(() => {
    setIsLoading(true);
    apiClient
      .get("/menu")
      .then((data) => {
        if (data.items && data.items.length > 0) {
          setAllItems(data.items);
        } else {
          setAllItems(getDummyMenuItemsWithCategory());
          setUsingDemoData(true);
        }
      })
      .catch(() => {
        setAllItems(getDummyMenuItemsWithCategory());
        setUsingDemoData(true);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const items = activeCategory
    ? allItems.filter((item) => (item.category?._id || item.category) === activeCategory)
    : allItems;

  return (
    <>
      <Navbar />
      <main className="page-container">
        <p className="section-eyebrow">Bold Flavors. Zero Mercy.</p>
        <h1 className="section-title" style={{ fontSize: 34, marginBottom: 24 }}>Full Menu</h1>

        {usingDemoData && (
          <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginTop: -12, marginBottom: 24 }}>
            Showing demo menu data — connect your database and run <code>npm run seed:data</code> to load real
            items.
          </p>
        )}

        <div className="category-pills">
          <button
            className={`category-pill ${!activeCategory ? "active" : ""}`}
            onClick={() => setActiveCategory(null)}
          >
            🔥 All
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              className={`category-pill ${activeCategory === cat._id ? "active" : ""}`}
              onClick={() => setActiveCategory(cat._id)}
            >
              {cat.icon ? `${cat.icon} ` : ""}
              {cat.name}
            </button>
          ))}
        </div>

        {isLoading ? (
          <Spinner />
        ) : items.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)" }}>No items found.</p>
        ) : (
          <div className="item-grid">
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
