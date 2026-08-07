"use client";
// components/shared/ErrorBoundary.js
// Catches rendering errors in its children so one broken component (e.g. a bad
// API response shape) doesn't crash the entire page — shows a fallback instead.

import { Component } from "react";
import Button from "@/components/ui/Button";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ textAlign: "center", padding: 40 }}>
          <h2 style={{ marginBottom: 8 }}>Something went wrong</h2>
          <p style={{ color: "var(--color-text-muted)", marginBottom: 20 }}>
            Please try refreshing the page.
          </p>
          <Button onClick={() => window.location.reload()}>Refresh</Button>
        </div>
      );
    }

    return this.props.children;
  }
}
