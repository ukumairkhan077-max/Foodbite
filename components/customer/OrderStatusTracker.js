// components/customer/OrderStatusTracker.js
// Visual step tracker for order-tracking page — highlights the current status.

const STEPS = ["PENDING", "ACCEPTED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"];
const LABELS = { PENDING: "Order Placed", ACCEPTED: "Accepted", PREPARING: "Preparing", OUT_FOR_DELIVERY: "On the Way", DELIVERED: "Delivered" };

export default function OrderStatusTracker({ status }) {
  if (status === "CANCELLED") {
    return <p style={{ color: "var(--color-chili)", fontWeight: 700 }}>This order was cancelled.</p>;
  }

  const currentIndex = STEPS.indexOf(status);

  return (
    <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
      {STEPS.map((step, index) => {
        const isDone = index <= currentIndex;
        return (
          <div key={step} style={{ flex: 1, textAlign: "center", position: "relative" }}>
            <div
              style={{
                width: 14, height: 14, borderRadius: "50%", margin: "0 auto 8px",
                background: isDone ? "var(--color-accent)" : "var(--color-border)",
              }}
            />
            <p style={{ fontSize: 11, color: isDone ? "var(--color-text)" : "var(--color-text-muted)" }}>
              {LABELS[step]}
            </p>
          </div>
        );
      })}
    </div>
  );
}
