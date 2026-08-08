"use client";
// app/(customer)/cart/page.js
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/customer/Navbar";
import Footer from "@/components/customer/Footer";
import CartDrawer from "@/components/customer/CartDrawer";
import Button from "@/components/ui/Button";

export default function CartPage() {
  const { items } = useCart();

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 600, margin: "0 auto", padding: "40px 24px" }}>
        <h1 style={{ fontSize: 28, marginBottom: 24 }}>Your Cart</h1>
        <CartDrawer />
        {items.length > 0 && (
          <Link href="/checkout" style={{ display: "block", marginTop: 20 }}>
            <Button style={{ width: "100%" }}>Proceed to checkout</Button>
          </Link>
        )}
      </main>
      <Footer />
    </>
  );
}
