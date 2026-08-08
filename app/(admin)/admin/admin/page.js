"use client";
// app/(admin)/admin/admins/page.js — Only an existing admin can create another admin
import { useState } from "react";
import { apiClient } from "@/lib/apiClient";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function AdminAdminsPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);
    try {
      await apiClient.post("/auth/admin/create-admin", form);
      setMessage(`Admin account created for ${form.email}.`);
      setForm({ name: "", email: "", phone: "", password: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Admin Accounts</h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: 24, fontSize: 14 }}>
        Create a new admin account. There's no public admin signup — this is the only way in.
      </p>

      <form onSubmit={handleSubmit}>
        <Input label="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
        <Input label="Email" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
        <Input label="Phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} required />
        <Input label="Password" type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required />
        {message && <p style={{ color: "var(--color-success)", marginBottom: 12 }}>{message}</p>}
        {error && <p className="error-text">{error}</p>}
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating…" : "Create admin"}</Button>
      </form>
    </div>
  );
}
