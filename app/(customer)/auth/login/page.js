"use client";
// app/(customer)/auth/login/page.js
// Email + password login. Works for customers here; the admin panel has its own
// login page at /admin/login that hits the same backend endpoint.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
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
      login(data.token, data.user);
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <p className="auth-eyebrow">Welcome back</p>
        <h1 className="auth-title">Log in</h1>
        <p className="auth-subtitle">Order your favorites again in a few taps.</p>

        <form onSubmit={handleSubmit}>
          <label className="field-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="text-input"
            style={{ marginBottom: 16 }}
            type="email"
            placeholder="ali@example.com"
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
              {isSubmitting ? "Logging in…" : "Log in"}
            </button>
          </div>
        </form>

        <p style={{ marginTop: 20, fontSize: 14, color: "var(--color-text-muted)" }}>
          New here?{" "}
          <a className="helper-link" href="/auth/register">
            Create an account
          </a>
        </p>
      </div>
    </div>
  );
}
