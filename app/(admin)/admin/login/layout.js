"use client";
// app/(admin)/admin/layout.js
// Wraps every /admin/* page (except login) with the sidebar/topbar shell,
// and blocks anyone who isn't ADMIN/BRANCH_MANAGER — mirrors the backend's middleware.js.

import { usePathname } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import ProtectedRoute from "@/components/shared/ProtectedRoute";

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return children; // login page has its own centered auth-shell layout, no sidebar
  }

  return (
    <ProtectedRoute allowedRoles={["ADMIN", "BRANCH_MANAGER"]} redirectTo="/admin/login">
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div style={{ flex: 1 }}>
          <Topbar />
          <main style={{ padding: 24 }}>{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
