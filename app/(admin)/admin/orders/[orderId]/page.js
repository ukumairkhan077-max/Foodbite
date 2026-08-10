"use client";
// app/(admin)/admin/orders/[orderId]/page.js
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { formatPrice } from "@/lib/formatPrice";
import Spinner from "@/components/ui/Spinner";

export default function AdminOrderDetailPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    apiClient.get(`/orders/${orderId}`).then((data) => setOrder(data.order));
  }, [orderId]);

  if (!order) return <Spinner />;

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Order #{order._id.slice(-6).toUpperCase()}</h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: 24 }}>Status: {order.status} — {order.paymentMethod} {order.isPaid ? "(Paid)" : "(Unpaid)"}</p>

      <h2 style={{ fontSize: 16, marginBottom: 10 }}>Items</h2>
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

      {order.deliveryAddress && (
        <>
          <h2 style={{ fontSize: 16, margin: "20px 0 10px" }}>Delivery Address</h2>
          <p>{order.deliveryAddress.fullAddress}, {order.deliveryAddress.city}</p>
        </>
      )}
    </div>
  );
}
