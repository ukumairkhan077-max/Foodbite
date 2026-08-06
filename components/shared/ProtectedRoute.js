"use client";
// components/shared/ProtectedRoute.js
// Wraps a page and redirects away if the visitor isn't logged in, or doesn't have
// one of the allowed roles. Mirrors the role checks already enforced on the backend
// (middleware.js + requireRole) — this is the frontend's UX layer on top of that,
// not a replacement for it.

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles, redirectTo = "/auth/login" }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace(redirectTo);
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace(redirectTo);
    }
  }, [user, isLoading, allowedRoles, redirectTo, router]);

  if (isLoading || !user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--color-text-muted)" }}>Loading…</p>
      </div>
    );
  }

  return children;
}