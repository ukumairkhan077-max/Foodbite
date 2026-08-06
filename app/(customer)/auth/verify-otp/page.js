"use client";
// app/(customer)/auth/verify-otp/page.js
// Step 2 of signup: customer enters the 6-digit OTP as individual boxes
// (the signature interaction of the auth flow). On success, moves to profile completion.

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/apiClient";

const OTP_LENGTH = 6;

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "";

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef([]);

  function handleChange(index, value) {
    const cleaned = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);

    if (cleaned && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    setDigits(pasted.split("").concat(Array(OTP_LENGTH).fill("")).slice(0, OTP_LENGTH));
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const otp = digits.join("");
    if (otp.length !== OTP_LENGTH) {
      setError(`Please enter all ${OTP_LENGTH} digits.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await apiClient.post("/auth/verify-otp", { phone, otp });
      router.push(`/auth/complete-profile?tempToken=${encodeURIComponent(data.tempToken)}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    setError("");
    try {
      await apiClient.post("/auth/register", { phone });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <p className="auth-eyebrow">Verify your number</p>
        <h1 className="auth-title">Enter the code</h1>
        <p className="auth-subtitle">
          We sent a {OTP_LENGTH}-digit code to <strong>{phone}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="otp-row" onPaste={handlePaste}>
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                className="otp-digit"
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                autoFocus={index === 0}
              />
            ))}
          </div>

          {error && <p className="error-text">{error}</p>}

          <button className="btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Verifying…" : "Verify code"}
          </button>
        </form>

        <p style={{ marginTop: 20, fontSize: 14, color: "var(--color-text-muted)" }}>
          Didn't get a code?{" "}
          <button
            onClick={handleResend}
            className="helper-link"
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer", font: "inherit" }}
          >
            Resend
          </button>
        </p>
      </div>
    </div>
  );
}