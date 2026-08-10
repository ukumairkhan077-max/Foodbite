"use client";
// app/(customer)/auth/verify-otp/page.js
// Step 2: customer enters the code Firebase texted them. We confirm it directly
// with Firebase (not our backend), then send the resulting ID token to our
// backend's verify-otp route so it can find/create the User and issue a tempToken.

import { Suspense, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/apiClient";

const OTP_LENGTH = 6;

// useSearchParams() opts the page into client-side rendering, which Next.js
// requires to be wrapped in a Suspense boundary — otherwise `next build` fails
// with "useSearchParams() should be wrapped in a suspense boundary".
export default function VerifyOtpPage() {
  return (
    <Suspense fallback={null}>
      <VerifyOtpForm />
    </Suspense>
  );
}

function VerifyOtpForm() {
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
    if (cleaned && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
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

    if (!window.__confirmationResult) {
      setError("Your verification session expired. Please request a new code.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Firebase itself checks the code is correct here — not our backend
      const userCredential = await window.__confirmationResult.confirm(otp);
      const idToken = await userCredential.user.getIdToken();

      // Now our backend verifies that token and finds/creates the matching User
      const data = await apiClient.post("/auth/verify-otp", { idToken });
      router.push(`/auth/complete-profile?tempToken=${encodeURIComponent(data.tempToken)}`);
    } catch (err) {
      setError(err.message || "Incorrect code. Please try again.");
    } finally {
      setIsSubmitting(false);
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
          Didn't get a code? <a className="helper-link" href="/auth/register">Start over</a>
        </p>
      </div>
    </div>
  );
}
