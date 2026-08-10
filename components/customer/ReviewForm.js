"use client";
// components/customer/ReviewForm.js
import { useState } from "react";
import { apiClient } from "@/lib/apiClient";
import Button from "@/components/ui/Button";

export default function ReviewForm({ menuItemId, orderId, onSubmitted }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await apiClient.post("/reviews", { menuItem: menuItemId, order: orderId, rating, comment });
      onSubmitted?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 24, color: n <= rating ? "var(--color-accent)" : "var(--color-border)" }}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        className="text-input"
        style={{ minHeight: 80, marginBottom: 12, resize: "vertical" }}
        placeholder="Tell others what you thought (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      {error && <p className="error-text">{error}</p>}
      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting…" : "Submit review"}</Button>
    </form>
  );
}
