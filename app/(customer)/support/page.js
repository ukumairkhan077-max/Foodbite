// app/(customer)/support/page.js
import Navbar from "@/components/customer/Navbar";
import Footer from "@/components/customer/Footer";

export default function SupportPage() {
  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 600, margin: "0 auto", padding: "40px 24px" }}>
        <h1 style={{ fontSize: 28, marginBottom: 16 }}>Support</h1>
        <p style={{ color: "var(--color-text-muted)", marginBottom: 24 }}>
          Need help with an order or your account? Reach us any of these ways:
        </p>
        <p>📞 0800-11223</p>
        <p>✉️ support@foodbite.com</p>
      </main>
      <Footer />a
    </>
  );
}
