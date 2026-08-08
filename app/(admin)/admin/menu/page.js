"use client";
// app/(admin)/admin/menu/page.js
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/apiClient";
import { formatPrice } from "@/lib/formatPrice";
import DataTable from "@/components/admin/DataTable";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

export default function AdminMenuPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient.get("/menu").then((data) => setItems(data.items)).finally(() => setIsLoading(false));
  }, []);

  async function toggleAvailability(item) {
    await apiClient.put(`/menu/${item._id}`, { isAvailable: !item.isAvailable });
    setItems((prev) => prev.map((i) => (i._id === item._id ? { ...i, isAvailable: !i.isAvailable } : i)));
  }

  if (isLoading) return <Spinner />;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <h1 style={{ fontSize: 24 }}>Menu Items</h1>
        <Link href="/admin/menu/add"><Button>+ Add item</Button></Link>
      </div>

      <DataTable
        columns={[
          { key: "name", label: "Name" },
          { key: "price", label: "Price" },
          { key: "status", label: "Status" },
        ]}
        rows={items.map((item) => ({
          _id: item._id,
          name: item.name,
          price: formatPrice(item.price),
          status: item.isAvailable ? "Available" : "Unavailable",
        }))}
        renderActions={(row) => {
          const item = items.find((i) => i._id === row._id);
          return (
            <>
              <Link href={`/admin/menu/${row._id}/edit`} style={{ marginRight: 12, color: "var(--color-accent)" }}>Edit</Link>
              <button onClick={() => toggleAvailability(item)} style={{ background: "none", border: "none", color: "var(--color-text-muted)", cursor: "pointer" }}>
                {item.isAvailable ? "Disable" : "Enable"}
              </button>
            </>
          );
        }}
      />
    </div>
  );
}
