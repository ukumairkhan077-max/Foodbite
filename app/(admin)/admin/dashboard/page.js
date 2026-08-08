"use client";
// app/(admin)/admin/dashboard/page.js
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { formatPrice } from "@/lib/formatPrice";
import StatCard from "@/components/admin/StatCard";
import Spinner from "@/components/ui/Spinner";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    apiClient.get("/admin/dashboard-stats").then((data) => setStats(data.stats));
  }, []);

  if (!stats) return <Spinner />;

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Dashboard</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
        <StatCard label="Today's Orders" value={stats.todayOrders} />
        <StatCard label="Today's Revenue" value={formatPrice(stats.todayRevenue)} />
        <StatCard label="Total Customers" value={stats.totalCustomers} />
        <StatCard label="Pending Orders" value={stats.pendingOrders} />
      </div>

      <h2 style={{ fontSize: 18, marginBottom: 12 }}>Top Selling Items</h2>
      {stats.topItems.map((item) => (
        <div key={item._id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--color-border)" }}>
          <span>{item._id}</span>
          <span style={{ color: "var(--color-text-muted)" }}>{item.totalSold} sold</span>
        </div>
      ))}
    </div>
  );
}
