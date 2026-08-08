"use client";
// app/(admin)/admin/orders/page.js — live order queue with status advancement
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import OrderQueueCard from "@/components/admin/OrderQueueCard";
import Spinner from "@/components/ui/Spinner";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  function loadOrders() {
    apiClient.get("/orders").then((data) => setOrders(data.orders)).finally(() => setIsLoading(false));
  }

  async function handleAdvance(orderId, status) {
    await apiClient.patch(`/orders/${orderId}/status`, { status });
    loadOrders();
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>Orders</h1>
      {isLoading ? <Spinner /> : orders.map((order) => (
        <OrderQueueCard key={order._id} order={order} onAdvance={handleAdvance} />
      ))}
    </div>
  );
}
