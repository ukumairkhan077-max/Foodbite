// components/ui/Spinner.js
// Simple loading indicator — used inside buttons and for full-page loading states.

export default function Spinner({ size = 20 }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        border: "2.5px solid rgba(245, 239, 228, 0.25)",
        borderTopColor: "var(--color-accent)",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
      }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </span>
  );
}