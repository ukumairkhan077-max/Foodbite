// components/admin/SalesChart.js
// Lightweight CSS bar chart — no external charting library needed for a simple daily view.
import { formatPrice } from "@/lib/formatPrice";

export default function SalesChart({ data }) {
  const max = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 160 }}>
      {data.map((d) => (
        <div key={d._id} style={{ flex: 1, textAlign: "center" }}>
          <div
            title={formatPrice(d.revenue)}
            style={{ height: `${(d.revenue / max) * 120}px`, background: "var(--color-accent)", borderRadius: "4px 4px 0 0" }}
          />
          <p style={{ fontSize: 10, color: "var(--color-text-muted)", marginTop: 6 }}>{d._id.slice(5)}</p>
        </div>
      ))}
    </div>
  );
}
