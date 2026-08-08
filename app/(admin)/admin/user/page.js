"use client";
// app/(admin)/admin/users/page.js — Customer account management (search, block/unblock)
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import DataTable from "@/components/admin/DataTable";
import Input from "@/components/ui/Input";
import Spinner from "@/components/ui/Spinner";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, [search]);

  function loadUsers() {
    apiClient.get(`/users?search=${encodeURIComponent(search)}`).then((data) => setUsers(data.users)).finally(() => setIsLoading(false));
  }

  async function toggleActive(user) {
    await apiClient.patch(`/users/${user._id}`, { isActive: !user.isActive });
    loadUsers();
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>Customers</h1>
      <div style={{ maxWidth: 320, marginBottom: 20 }}>
        <Input placeholder="Search by name, email, phone" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? <Spinner /> : (
        <DataTable
          columns={[
            { key: "name", label: "Name" },
            { key: "email", label: "Email" },
            { key: "phone", label: "Phone" },
            { key: "status", label: "Status" },
          ]}
          rows={users.map((u) => ({ _id: u._id, name: u.name, email: u.email, phone: u.phone, status: u.isActive ? "Active" : "Blocked" }))}
          renderActions={(row) => {
            const user = users.find((u) => u._id === row._id);
            return (
              <button onClick={() => toggleActive(user)} style={{ background: "none", border: "none", color: user.isActive ? "var(--color-chili)" : "var(--color-success)", cursor: "pointer" }}>
                {user.isActive ? "Block" : "Unblock"}
              </button>
            );
          }}
        />
      )}
    </div>
  );
}
