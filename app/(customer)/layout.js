// app/(customer)/layout.js
// Customer route-group shell. Kept minimal for now — nav/footer chrome comes
// once we build past the auth flow, since auth pages use their own centered "auth-shell" layout.

export default function CustomerLayout({ children }) {
  return <>{children}</>;
}