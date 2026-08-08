"use client";
// app/(admin)/admin/branches/[id]/edit/page.js
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

export default function EditBranchPage() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiClient.get(`/branches/${id}`).then((data) => setForm(data.branch));
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await apiClient.put(`/branches/${id}`, form);
      router.push("/admin/branches");
    } catch (err) {
      setError(err.message);
    }
  }

  if (!form) return <Spinner />;

  return (
    <div style={{ maxWidth: 480 }}>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>Edit Branch</h1>
      <form onSubmit={handleSubmit}>
        <Input label="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
        <Input label="City" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} />
        <Input label="Address" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
        <Input label="Delivery Fee (Rs)" type="number" value={form.deliveryFee} onChange={(e) => setForm((p) => ({ ...p, deliveryFee: Number(e.target.value) }))} />
        <label style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} />
          Active
        </label>
        {error && <p className="error-text">{error}</p>}
        <Button type="submit">Save changes</Button>
      </form>
    </div>
  );
}
