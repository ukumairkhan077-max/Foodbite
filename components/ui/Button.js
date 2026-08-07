// components/ui/Button.js
// Shared button — variants match the design tokens in globals.css.
// "primary" = marigold CTA, "ghost" = transparent/outlined, "danger" = chili red.

export default function Button({
  children,
  variant = "primary",
  type = "button",
  disabled = false,
  onClick,
  style,
  ...rest
}) {
  const base = {
    padding: "12px 20px",
    borderRadius: 10,
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: 14,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    border: "1px solid transparent",
    transition: "background 0.15s ease, transform 0.1s ease",
  };

  const variants = {
    primary: { background: "var(--color-accent)", color: "#1a1410" },
    ghost: { background: "transparent", color: "var(--color-text)", borderColor: "var(--color-border)" },
    danger: { background: "var(--color-chili)", color: "#fff" },
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{ ...base, ...variants[variant], ...style }}
      {...rest}
    >
      {children}
    </button>
  );
}