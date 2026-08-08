"use client";
// app/(customer)/profile/addresses/page.js
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import Navbar from "@/components/customer/Navbar";
import Footer from "@/components/customer/Footer";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ProtectedRoute from "@/components/shared/ProtectedRoute";

function AddressesContent() {
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState({ label: "Home", fullAddress: "", city: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    apiClient.get("/addresses").then((data) => setAddresses(data.addresses));
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    try {
      const data = await apiClient.post("/addresses", form);
      setAddresses(data.addresses);
      setForm({ label: "Home", fullAddress: "", city: "" });
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    const data = await apiClient.delete(`/addresses/${id}`);
    setAddresses(data.addresses);
  }

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "40px 24px" }}>
        <h1 style={{ fontSize: 28, marginBottom: 24 }}>Saved Addresses</h1>

        {addresses.map((addr) => (
          <div key={addr._id} style={{ display: "flex", justifyContent: "space-between", padding: 14, marginBottom: 10, borderRadius: 10, background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <div>
              <p style={{ fontWeight: 600 }}>{addr.label}</p>
              <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>{addr.fullAddress}, {addr.city}</p>
            </div>
            <button onClick={() => handleDelete(addr._id)} style={{ background: "none", border: "none", color: "var(--color-chili)", cursor: "pointer" }}>Delete</button>
          </div>
        ))}

        <h2 style={{ fontSize: 16, margin: "24px 0 12px" }}>Add new address</h2>
        <form onSubmit={handleAdd}>
          <Input label="Label" placeholder="Home / Office" value={form.label} onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))} />
          <Input label="Full address" value={form.fullAddress} onChange={(e) => setForm((p) => ({ ...p, fullAddress: e.target.value }))} required />
          <Input label="City" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} required />
          {error && <p className="error-text">{error}</p>}
          <Button type="submit">Add address</Button>
        </form>
      </main>
      <Footer />
    </>
  );
}

export default function AddressesPage() {
  return (
    <ProtectedRoute allowedRoles={["CUSTOMER"]}>
      <AddressesContent />
    </ProtectedRoute>
  );
}
