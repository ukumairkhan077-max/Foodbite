"use client";
// app/(customer)/orders/page.js — order history, links each row to its tracking page
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/apiClient";
import { formatPrice } from "@/lib/formatPrice";
import Navbar from "@/components/customer/Navbar";
import Footer from "@/components/customer/Footer";
import Spinner from "@/components/ui/Spinner";
import ProtectedRoute from "@/components/shared/ProtectedRoute";

function OrdersContent() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient.get("/orders").then((data) => setOrders(data.orders)).finally(() => setIsLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 700, margin: "0 auto", padding: "40px 24px" }}>
        <h1 style={{ fontSize: 28, marginBottom: 24 }}>My Orders</h1>
        {isLoading ? (
          <Spinner />
        ) : orders.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)" }}>You haven't placed any orders yet.</p>
        ) : (
          orders.map((order) => (
            <Link
              key={order._id}
              href={`/order-tracking/${order._id}`}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: 16, marginBottom: 10, borderRadius: 10,
                background: "var(--color-surface)", border: "1px solid var(--color-border)",
                textDecoration: "none", color: "inherit",
              }}
            >
              <div>
                <p style={{ fontWeight: 600 }}>Order #{order._id.slice(-6).toUpperCase()}</p>
                <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>{order.branch?.name} — {order.status}</p>
              </div>
              <p style={{ fontWeight: 700, color: "var(--color-accent)" }}>{formatPrice(order.total)}</p>
            </Link>
          ))
        )}
      </main>
      <Footer />
    </>
  );
}

export default function OrdersPage() {
  return (
    <ProtectedRoute allowedRoles={["CUSTOMER"]}>
      <OrdersContent />
    </ProtectedRoute>
  );
}
