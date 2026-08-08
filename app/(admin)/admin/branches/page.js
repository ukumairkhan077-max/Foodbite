"use client";
// app/(admin)/admin/branches/page.js
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/apiClient";
import DataTable from "@/components/admin/DataTable";
import Spinner from "@/components/ui/Spinner";

export default function AdminBranchesPage() {
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient.get("/branches").then((data) => setBranches(data.branches)).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <Spinner />;

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>Branches</h1>
      <DataTable
        columns={[
          { key: "name", label: "Name" },
          { key: "city", label: "City" },
          { key: "status", label: "Status" },
        ]}
        rows={branches.map((b) => ({ _id: b._id, name: b.name, city: b.city, status: b.isActive ? "Active" : "Inactive" }))}
        renderActions={(row) => <Link href={`/admin/branches/${row._id}/edit`} style={{ color: "var(--color-accent)" }}>Edit</Link>}
      />
    </div>
  );
}
