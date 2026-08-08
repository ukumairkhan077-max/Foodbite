"use client";
// app/(admin)/admin/reports/page.js — sales report over a date range
import { useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { formatPrice } from "@/lib/formatPrice";
import SalesChart from "@/components/admin/SalesChart";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

export default function AdminReportsPage() {
  const [range, setRange] = useState({ from: "", to: "" });
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleFetch(e) {
    e.preventDefault();
    if (!range.from || !range.to) return;
    setIsLoading(true);
    try {
      const data = await apiClient.get(`/admin/reports?from=${range.from}&to=${range.to}`);
      setReport(data.report);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>Reports</h1>

      <form onSubmit={handleFetch} style={{ display: "flex", gap: 12, alignItems: "flex-end", marginBottom: 28 }}>
        <Input label="From" type="date" value={range.from} onChange={(e) => setRange((p) => ({ ...p, from: e.target.value }))} required />
        <Input label="To" type="date" value={range.to} onChange={(e) => setRange((p) => ({ ...p, to: e.target.value }))} required />
        <Button type="submit" style={{ marginBottom: 16 }}>Run report</Button>
      </form>

      {isLoading ? <Spinner /> : report && (
        <>
          <div style={{ display: "flex", gap: 24, marginBottom: 28 }}>
            <p><strong>{report.totalOrders}</strong> orders</p>
            <p><strong>{formatPrice(report.totalRevenue)}</strong> revenue</p>
          </div>

          <h2 style={{ fontSize: 16, marginBottom: 12 }}>Daily breakdown</h2>
          <SalesChart data={report.dailyBreakdown} />
        </>
      )}
    </div>
  );
}
