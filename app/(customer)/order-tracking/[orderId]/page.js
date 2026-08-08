"use client";
// app/(customer)/order-tracking/[orderId]/page.js
// Polls the order every 10s so the status updates without a manual refresh.

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { formatPrice } from "@/lib/formatPrice";
import Navbar from "@/components/customer/Navbar";
import Footer from "@/components/customer/Footer";
import OrderStatusTracker from "@/components/customer/OrderStatusTracker";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import ProtectedRoute from "@/components/shared/ProtectedRoute";

function OrderTrackingContent() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let interval;
    function fetchOrder() {
      apiClient.get(`/orders/${orderId}`).then((data) => setOrder(data.order)).finally(() => setIsLoading(false));
    }
    fetchOrder();
    interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [orderId]);

  async function handleCancel() {
    try {
      const data = await apiClient.patch(`/orders/${orderId}/status`, { status: "CANCELLED" });
      setOrder(data.order);
    } catch (err) {
      alert(err.message);
    }
  }

  if (isLoading) return <Spinner />;
  if (!order) return <p style={{ padding: 40 }}>Order not found.</p>;

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 600, margin: "0 auto", padding: "40px 24px" }}>
        <h1 style={{ fontSize: 24, marginBottom: 8 }}>Order #{order._id.slice(-6).toUpperCase()}</h1>
        <p style={{ color: "var(--color-text-muted)", marginBottom: 32 }}>{order.branch?.name}</p>

        <div style={{ marginBottom: 40 }}>
          <OrderStatusTracker status={order.status} />
        </div>

        <h2 style={{ fontSize: 16, marginBottom: 12 }}>Items</h2>
        {order.items.map((item, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--color-border)" }}>
            <span>{item.quantity}× {item.name}{item.variant ? ` (${item.variant})` : ""}</span>
            <span>{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}

        <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0", fontWeight: 700 }}>
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>

        {order.status === "PENDING" && (
          <Button variant="danger" onClick={handleCancel} style={{ marginTop: 16 }}>
            Cancel order
          </Button>
        )}
      </main>
      <Footer />
    </>
  );
}

export default function OrderTrackingPage() {
  return (
    <ProtectedRoute allowedRoles={["CUSTOMER"]}>
      <OrderTrackingContent />
    </ProtectedRoute>
  );
}
