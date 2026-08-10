"use client";
// app/(customer)/auth/complete-profile/page.js
// Step 3 of signup: customer sets name, email, password using the tempToken
// from OTP verification. On success, they're fully logged in.

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";

// useSearchParams() opts the page into client-side rendering, which Next.js
// requires to be wrapped in a Suspense boundary — otherwise `next build` fails
// with "useSearchParams() should be wrapped in a suspense boundary".
export default function CompleteProfilePage() {
  return (
    <Suspense fallback={null}>
      <CompleteProfileForm />
    </Suspense>
  );
}

function CompleteProfileForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const tempToken = searchParams.get("tempToken") || "";

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!tempToken) {
      setError("Your verification session expired. Please start over.");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await apiClient.post("/auth/complete-registration", { tempToken, ...form });
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
        <p className="auth-eyebrow">Almost there</p>
        <h1 className="auth-title">Finish your profile</h1>
        <p className="auth-subtitle">Your phone is verified — just a few more details.</p>

        <form onSubmit={handleSubmit}>
          <label className="field-label" htmlFor="name">
            Full name
          </label>
          <input
            id="name"
            className="text-input"
            style={{ marginBottom: 16 }}
            type="text"
            placeholder="Ali Khan"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            required
            autoFocus
          />

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
          />

          <label className="field-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            className="text-input"
            type="password"
            placeholder="At least 8 characters"
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
            required
          />

          {error && <p className="error-text">{error}</p>}

          <div style={{ marginTop: 20 }}>
            <button className="btn-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating account…" : "Create account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
