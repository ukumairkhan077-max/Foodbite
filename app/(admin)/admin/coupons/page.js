"use client";
// app/(admin)/admin/coupons/page.js
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import DataTable from "@/components/admin/DataTable";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({ code: "", discountType: "PERCENTAGE", value: "", expiresAt: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCoupons();
  }, []);

  function loadCoupons() {
    apiClient.get("/coupons").then((data) => setCoupons(data.coupons)).finally(() => setIsLoading(false));
  }

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    try {
      await apiClient.post("/coupons", { ...form, value: Number(form.value) });
      setForm({ code: "", discountType: "PERCENTAGE", value: "", expiresAt: "" });
      loadCoupons();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    await apiClient.delete(`/coupons/${id}`);
    loadCoupons();
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>Coupons</h1>

      {isLoading ? <Spinner /> : (
        <DataTable
          columns={[
            { key: "code", label: "Code" },
            { key: "discount", label: "Discount" },
            { key: "used", label: "Used" },
          ]}
          rows={coupons.map((c) => ({
            _id: c._id,
            code: c.code,
            discount: c.discountType === "PERCENTAGE" ? `${c.value}%` : `Rs ${c.value}`,
            used: c.usedCount,
          }))}
          renderActions={(row) => <button onClick={() => handleDelete(row._id)} style={{ background: "none", border: "none", color: "var(--color-chili)", cursor: "pointer" }}>Delete</button>}
        />
      )}

      <h2 style={{ fontSize: 16, margin: "24px 0 12px" }}>Add coupon</h2>
      <form onSubmit={handleAdd}>
        <Input label="Code" value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))} required />
        <div style={{ marginBottom: 16 }}>
          <label className="field-label">Discount type</label>
          <select className="text-input" value={form.discountType} onChange={(e) => setForm((p) => ({ ...p, discountType: e.target.value }))}>
            <option value="PERCENTAGE">Percentage</option>
            <option value="FLAT">Flat amount</option>
          </select>
        </div>
        <Input label="Value" type="number" value={form.value} onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))} required />
        <Input label="Expires at" type="date" value={form.expiresAt} onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))} required />
        {error && <p className="error-text">{error}</p>}
        <Button type="submit">Add coupon</Button>
      </form>
    </div>
  );
}
