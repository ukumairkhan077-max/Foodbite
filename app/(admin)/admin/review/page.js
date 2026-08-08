"use client";
// app/(admin)/admin/reviews/page.js — moderate reviews (approve/hide)
// Note: since GET /api/reviews requires a menuItem query param on the backend,
// a real "all reviews" admin view would need a small backend addition (e.g. optional
// menuItem filter). For now this page assumes that's been added; swap the endpoint
// once you extend the backend route.

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import Spinner from "@/components/ui/Spinner";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient.get("/reviews").then((data) => setReviews(data.reviews)).catch(() => setReviews([])).finally(() => setIsLoading(false));
  }, []);

  async function toggleApproved(review) {
    await apiClient.put(`/reviews/${review._id}`, { isApproved: !review.isApproved });
    setReviews((prev) => prev.map((r) => (r._id === review._id ? { ...r, isApproved: !r.isApproved } : r)));
  }

  if (isLoading) return <Spinner />;

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>Reviews</h1>
      {reviews.map((r) => (
        <div key={r._id} style={{ display: "flex", justifyContent: "space-between", padding: 14, marginBottom: 10, borderRadius: 10, background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <div>
            <p>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
            {r.comment && <p style={{ fontSize: 14, marginTop: 4 }}>{r.comment}</p>}
            <p style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{r.user?.name}</p>
          </div>
          <button onClick={() => toggleApproved(r)} style={{ background: "none", border: "none", color: r.isApproved ? "var(--color-chili)" : "var(--color-success)", cursor: "pointer" }}>
            {r.isApproved ? "Hide" : "Approve"}
          </button>
        </div>
      ))}
    </div>
  );
}
