"use client";
// app/(admin)/admin/categories/page.js
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", slug: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  function loadCategories() {
    apiClient.get("/categories").then((data) => setCategories(data.categories)).finally(() => setIsLoading(false));
  }

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    try {
      await apiClient.post("/categories", form);
      setForm({ name: "", slug: "" });
      loadCategories();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    await apiClient.delete(`/categories/${id}`);
    loadCategories();
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>Categories</h1>

      {isLoading ? <Spinner /> : categories.map((cat) => (
        <div key={cat._id} style={{ display: "flex", justifyContent: "space-between", padding: 12, marginBottom: 8, borderRadius: 8, background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <span>{cat.name}</span>
          <button onClick={() => handleDelete(cat._id)} style={{ background: "none", border: "none", color: "var(--color-chili)", cursor: "pointer" }}>Delete</button>
        </div>
      ))}

      <h2 style={{ fontSize: 16, margin: "24px 0 12px" }}>Add category</h2>
      <form onSubmit={handleAdd}>
        <Input label="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }))} required />
        <Input label="Slug" value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} required />
        {error && <p className="error-text">{error}</p>}
        <Button type="submit">Add category</Button>
      </form>
    </div>
  );
}
