"use client";
// app/(customer)/checkout/page.js
// Branch selection, delivery address, payment method, coupon code, then places the order
// via POST /api/orders. Server recalculates everything — this page just collects input.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/formatPrice";
import Navbar from "@/components/customer/Navbar";
import Footer from "@/components/customer/Footer";
import BranchSelector from "@/components/customer/BranchSelector";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ProtectedRoute from "@/components/shared/ProtectedRoute";

const PAYMENT_METHODS = [
  { value: "COD", label: "Cash on Delivery" },
  { value: "JAZZCASH", label: "JazzCash" },
  { value: "EASYPAISA", label: "Easypaisa" },
  { value: "CARD", label: "Card" },
];

function CheckoutContent() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();

  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [orderType, setOrderType] = useState("DELIVERY");
  const [addressId, setAddressId] = useState(null);
  const [manualAddress, setManualAddress] = useState({ fullAddress: "", city: "" });
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [couponCode, setCouponCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    apiClient.get("/branches").then((data) => {
      setBranches(data.branches);
      if (data.branches.length) setSelectedBranch(data.branches[0]._id);
    });
  }, []);

  async function handlePlaceOrder() {
    setError("");

    if (!selectedBranch) return setError("Please select a branch.");
    if (items.length === 0) return setError("Your cart is empty.");

    let deliveryAddress = null;
    if (orderType === "DELIVERY") {
      const savedAddress = user?.addresses?.find((a) => a._id === addressId);
      if (savedAddress) {
        deliveryAddress = savedAddress;
      } else if (manualAddress.fullAddress && manualAddress.city) {
        deliveryAddress = manualAddress;
      } else {
        return setError("Please provide a delivery address.");
      }
    }

    setIsSubmitting(true);
    try {
      const data = await apiClient.post("/orders", {
        branch: selectedBranch,
        orderType,
        deliveryAddress,
        paymentMethod,
        couponCode: couponCode || undefined,
        items: items.map((i) => ({
          menuItemId: i.menuItemId,
          variant: i.variant,
          addOns: i.addOns,
          quantity: i.quantity,
          notes: i.notes,
        })),
      });

      clearCart();
      router.push(`/order-tracking/${data.order._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 700, margin: "0 auto", padding: "40px 24px" }}>
        <h1 style={{ fontSize: 28, marginBottom: 24 }}>Checkout</h1>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, marginBottom: 12 }}>Choose a branch</h2>
          <BranchSelector branches={branches} selectedId={selectedBranch} onSelect={setSelectedBranch} />
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, marginBottom: 12 }}>Order type</h2>
          <div style={{ display: "flex", gap: 10 }}>
            {["DELIVERY", "PICKUP"].map((type) => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                style={{
                  padding: "8px 16px", borderRadius: 8, cursor: "pointer",
                  background: orderType === type ? "var(--color-accent)" : "var(--color-surface)",
                  color: orderType === type ? "#1a1410" : "var(--color-text)",
                  border: "1px solid var(--color-border)",
                }}
              >
                {type === "DELIVERY" ? "Delivery" : "Pickup"}
              </button>
            ))}
          </div>
        </section>

        {orderType === "DELIVERY" && (
          <section style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 16, marginBottom: 12 }}>Delivery address</h2>
            {user?.addresses?.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                {user.addresses.map((addr) => (
                  <label key={addr._id} style={{ display: "flex", gap: 10, padding: "8px 0", cursor: "pointer" }}>
                    <input type="radio" name="address" checked={addressId === addr._id} onChange={() => setAddressId(addr._id)} />
                    <span>{addr.label}: {addr.fullAddress}, {addr.city}</span>
                  </label>
                ))}
              </div>
            )}
            <Input
              label="Or enter a new address"
              placeholder="House / street / area"
              value={manualAddress.fullAddress}
              onChange={(e) => { setAddressId(null); setManualAddress((p) => ({ ...p, fullAddress: e.target.value })); }}
            />
            <Input
              label="City"
              placeholder="Lahore"
              value={manualAddress.city}
              onChange={(e) => { setAddressId(null); setManualAddress((p) => ({ ...p, city: e.target.value })); }}
            />
          </section>
        )}

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, marginBottom: 12 }}>Payment method</h2>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {PAYMENT_METHODS.map((pm) => (
              <button
                key={pm.value}
                onClick={() => setPaymentMethod(pm.value)}
                style={{
                  padding: "8px 16px", borderRadius: 8, cursor: "pointer",
                  background: paymentMethod === pm.value ? "var(--color-accent)" : "var(--color-surface)",
                  color: paymentMethod === pm.value ? "#1a1410" : "var(--color-text)",
                  border: "1px solid var(--color-border)",
                }}
              >
                {pm.label}
              </button>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 28 }}>
          <Input label="Coupon code (optional)" placeholder="SAVE20" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
        </section>

        <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0", borderTop: "1px solid var(--color-border)", fontWeight: 700, marginBottom: 20 }}>
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        {error && <p className="error-text" style={{ marginBottom: 16 }}>{error}</p>}

        <Button onClick={handlePlaceOrder} disabled={isSubmitting} style={{ width: "100%" }}>
          {isSubmitting ? "Placing order…" : "Place order"}
        </Button>
      </main>
      <Footer />
    </>
  );
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute allowedRoles={["CUSTOMER"]}>
      <CheckoutContent />
    </ProtectedRoute>
  );
}
