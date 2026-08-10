"use client";
// app/(admin)/admin/riders/page.js
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import DataTable from "@/components/admin/DataTable";
import Spinner from "@/components/ui/Spinner";

export default function AdminRidersPage() {
  const [riders, setRiders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient.get("/riders").then((data) => setRiders(data.riders)).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <Spinner />;

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>Riders</h1>
      <DataTable
        columns={[
          { key: "name", label: "Name" },
          { key: "phone", label: "Phone" },
          { key: "status", label: "Status" },
        ]}
        rows={riders.map((r) => ({ _id: r._id, name: r.name, phone: r.phone, status: r.riderDetails?.isAvailable ? "Available" : "Busy" }))}
      />
    </div>
  );
}
