"use client";
// app/(admin)/admin/menu/add/page.js
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function AddMenuItemPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", price: "", category: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    apiClient.get("/categories").then((data) => {
      setCategories(data.categories);
      if (data.categories.length) setForm((p) => ({ ...p, category: data.categories[0]._id }));
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await apiClient.post("/menu", { ...form, price: Number(form.price) });
      router.push("/admin/menu");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>Add Menu Item</h1>
      <form onSubmit={handleSubmit}>
        <Input label="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
        <Input label="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
        <Input label="Price (Rs)" type="number" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} required />

        <div style={{ marginBottom: 16 }}>
          <label className="field-label">Category</label>
          <select className="text-input" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>

        {error && <p className="error-text">{error}</p>}
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : "Add item"}</Button>
      </form>
    </div>
  );
}
