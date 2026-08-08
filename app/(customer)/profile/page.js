"use client";
// app/(customer)/profile/page.js
import { useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/customer/Navbar";
import Footer from "@/components/customer/Footer";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ProtectedRoute from "@/components/shared/ProtectedRoute";

function ProfileContent() {
  const { user, refresh } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);
    try {
      await apiClient.put("/profile", form);
      await refresh();
      setMessage("Profile updated.");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "40px 24px" }}>
        <h1 style={{ fontSize: 28, marginBottom: 24 }}>Profile</h1>
        <form onSubmit={handleSubmit}>
          <Input label="Full name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
          <Input label="Phone (verified, cannot change)" value={user?.phone || ""} disabled />
          {message && <p style={{ color: "var(--color-success)", marginBottom: 12 }}>{message}</p>}
          {error && <p className="error-text">{error}</p>}
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : "Save changes"}</Button>
        </form>
      </main>
      <Footer />
    </>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
