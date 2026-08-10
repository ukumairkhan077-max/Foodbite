"use client";
// app/(customer)/menu/[category]/page.js — Menu filtered to one category (via URL, not just a client-side tab)
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { dummyCategories, getDummyMenuItemsWithCategory } from "@/data/dummyMenuData";
import Navbar from "@/components/customer/Navbar";
import Footer from "@/components/customer/Footer";
import ItemCard from "@/components/customer/ItemCard";
import Spinner from "@/components/ui/Spinner";

export default function CategoryMenuPage() {
  const { category } = useParams(); // this is the category's slug or id, depending on how you link to it
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    apiClient
      .get(`/menu?category=${category}`)
      .then((data) => {
        if (data.items && data.items.length > 0) {
          setItems(data.items);
        } else {
          setItems(
            getDummyMenuItemsWithCategory().filter(
              (item) => item.category?._id === category || item.category?.slug === category
            )
          );
        }
      })
      .catch(() => {
        setItems(
          getDummyMenuItemsWithCategory().filter(
            (item) => item.category?._id === category || item.category?.slug === category
          )
        );
      })
      .finally(() => setIsLoading(false));
  }, [category]);

  const categoryName = dummyCategories.find((c) => c.slug === category)?.name || category;

  return (
    <>
      <Navbar />
      <main className="page-container">
        <p className="section-eyebrow">Menu</p>
        <h1 className="section-title" style={{ fontSize: 30, textTransform: "capitalize" }}>{categoryName}</h1>
        {isLoading ? (
          <Spinner />
        ) : items.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)" }}>No items found in this category.</p>
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
