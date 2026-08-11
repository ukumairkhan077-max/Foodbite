"use client";
// app/(customer)/page.js — Home page: hero banner, popular items, deals
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/apiClient";
import { getDummyMenuItemsWithCategory } from "@/data/dummyMenuData";
import Navbar from "@/components/customer/Navbar";
import Footer from "@/components/customer/Footer";
import ItemCard from "@/components/customer/ItemCard";
import Spinner from "@/components/ui/Spinner";

export default function HomePage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usingDemoData, setUsingDemoData] = useState(false);

  useEffect(() => {
    apiClient
      .get("/menu")
      .then((data) => {
        if (data.items && data.items.length > 0) {
          setItems(data.items);
        } else {
          // API reachable but no menu items seeded yet — show demo data instead
          // of a blank page.
          setItems(getDummyMenuItemsWithCategory());
          setUsingDemoData(true);
        }
      })
      .catch(() => {
        // API/DB unreachable — fall back to local demo data so the UI is always
        // browsable.
        setItems(getDummyMenuItemsWithCategory());
        setUsingDemoData(true);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const featured = items.filter((i) => i.isFeatured).slice(0, 4);
  const popular = items.slice(0, 8);

  return (
    <>
      <Navbar />
      <main className="page-container">
        <section
          style={{
            position: "relative",
            borderRadius: 22,
            overflow: "hidden",
            padding: "48px 40px",
            marginBottom: 48,
            minHeight: "calc(100vh - 140px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 40,
            flexWrap: "wrap",
            background: "linear-gradient(135deg, #f0a13a 0%, #d97318 45%, #7a3b12 100%)",
          }}
        >
          <div
            style={{
              flex: "1 1 380px",
              maxWidth: 480,
              aspectRatio: "1 / 1",
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: "0 30px 60px rgba(0,0,0,0.45)",
              flexShrink: 0,
            }}
          >
            <img
              src="/images/first.png"
              alt="Signature smash burger with fries"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>

          <div style={{ maxWidth: 480, position: "relative", zIndex: 1 }}>
            <p
              style={{
                display: "inline-block",
                background: "rgba(0,0,0,0.22)",
                color: "#fff",
                fontSize: 12.5,
                fontWeight: 700,
                letterSpacing: "0.02em",
                padding: "7px 14px",
                borderRadius: 999,
                margin: "0 0 18px",
              }}
            >
              🔥 Buy 2 Combo Meals and Get 1 Free
            </p>
            <h1
              style={{
                fontSize: "clamp(30px, 4.2vw, 44px)",
                lineHeight: 1.12,
                color: "#fff",
                margin: "0 0 16px",
                fontWeight: 800,
              }}
            >
              Order The Best Meals In Town Today.
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.85)",
                fontSize: 15.5,
                lineHeight: 1.6,
                margin: "0 0 28px",
                maxWidth: 420,
              }}
            >
              Enjoy golden crispy fast food made fresh to order — bold flavor, hot and crunchy every time, and
              delivered straight to your door.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Link
                href="/menu"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#f6c21a",
                  color: "#1a1410",
                  fontWeight: 800,
                  fontSize: 15,
                  padding: "13px 26px",
                  borderRadius: 999,
                  textDecoration: "none",
                }}
              >
                Order Now 📞
              </Link>
              <Link
                href="/menu"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "transparent",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 15,
                  padding: "13px 26px",
                  borderRadius: 999,
                  textDecoration: "none",
                  border: "1.5px solid rgba(255,255,255,0.6)",
                }}
              >
                See Our Menu ☰
              </Link>
            </div>
          </div>
        </section>

        {usingDemoData && (
          <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginTop: -32, marginBottom: 32 }}>
            Showing demo menu data — connect your database and run <code>npm run seed:data</code> to load real
            items.
          </p>
        )}

        {isLoading ? (
          <Spinner />
        ) : (
          <>
            {featured.length > 0 && (
              <>
                <h2 className="section-title">Feeling Extra? 🔥</h2>
                <div className="item-grid" style={{ marginBottom: 48 }}>
                  {featured.map((item) => (
                    <ItemCard key={item._id} item={item} />
                  ))}
                </div>
              </>
            )}

            <h2 className="section-title">Popular Right Now</h2>
            <div className="item-grid">
              {popular.map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}