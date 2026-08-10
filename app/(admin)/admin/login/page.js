"use client";
// app/(admin)/admin/login/page.js
// Same email+password endpoint as the customer login — the backend embeds role
// in the token, so this page just checks the returned role is actually an admin.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const data = await apiClient.post("/auth/login", form);

      if (!["ADMIN", "BRANCH_MANAGER"].includes(data.user.role)) {
        setError("This account doesn't have admin access.");
        return;
      }

      login(data.token, data.user);
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <p className="auth-eyebrow">Foodbite Admin</p>
        <h1 className="auth-title">Admin sign in</h1>
        <p className="auth-subtitle">Manage orders, menu, and branches.</p>

        <form onSubmit={handleSubmit}>
          <label className="field-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="text-input"
            style={{ marginBottom: 16 }}
            type="email"
            placeholder="admin@foodbite.com"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            required
            autoFocus
          />

          <label className="field-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            className="text-input"
            type="password"
            placeholder="Your password"
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
            required
          />

          {error && <p className="error-text">{error}</p>}

          <div style={{ marginTop: 20 }}>
            <button className="btn-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing in…" : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
