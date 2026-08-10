// components/admin/StatCard.js
export default function StatCard({ label, value }) {
  return (
    <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius)", padding: 20 }}>
      <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 26, fontFamily: "var(--font-display)", fontWeight: 800 }}>{value}</p>
    </div>
  );
}
