// app/layout.js
// Minimal root layout — required by Next.js App Router for the build to succeed.

export const metadata = {
  title: "Foodbite API",
  description: "Backend for the Foodbite food delivery platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}