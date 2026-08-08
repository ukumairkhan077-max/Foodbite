"use client";
// app/(customer)/branches/page.js
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import Navbar from "@/components/customer/Navbar";
import Footer from "@/components/customer/Footer";
import Spinner from "@/components/ui/Spinner";

export default function BranchesPage() {
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient.get("/branches").then((data) => setBranches(data.branches)).finally(() => setIsLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 700, margin: "0 auto", padding: "40px 24px" }}>
        <h1 style={{ fontSize: 28, marginBottom: 24 }}>Our Branches</h1>
        {isLoading ? <Spinner /> : branches.map((b) => (
          <div key={b._id} style={{ padding: 16, marginBottom: 10, borderRadius: 10, background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <p style={{ fontWeight: 600 }}>{b.name}</p>
            <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>{b.address}</p>
            <p style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{b.openTime} – {b.closeTime}</p>
          </div>
        ))}
      </main>
      <Footer />
    </>
  );
}
