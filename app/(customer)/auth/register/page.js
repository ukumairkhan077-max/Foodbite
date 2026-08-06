"use client";
// app/(customer)/auth/register/page.js
// Step 1 of signup: customer enters their phone number, backend sends an OTP.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";

export default function RegisterPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await apiClient.post("/auth/register", { phone });
      router.push(`/auth/verify-otp?phone=${encodeURIComponent(phone)}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <p className="auth-eyebrow">Create account</p>
        <h1 className="auth-title">What's your number?</h1>
        <p className="auth-subtitle">We'll text you a 6-digit code to verify it's really you.</p>

        <form onSubmit={handleSubmit}>
          <label className="field-label" htmlFor="phone">
            Phone number
          </label>
          <input
            id="phone"
            className="text-input"
            type="tel"
            inputMode="numeric"
            placeholder="03001234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            autoFocus
          />

          {error && <p className="error-text">{error}</p>}

          <div style={{ marginTop: 20 }}>
            <button className="btn-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending code…" : "Send verification code"}
            </button>
          </div>
        </form>

        <p style={{ marginTop: 20, fontSize: 14, color: "var(--color-text-muted)" }}>
          Already have an account?{" "}
          <a className="helper-link" href="/auth/login">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}