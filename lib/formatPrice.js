// lib/formatPrice.js
// Formats numbers as Pakistani Rupees, e.g. 1250 -> "Rs. 1,250"

export function formatPrice(amount) {
  const rounded = Math.round(amount || 0);
  return `Rs. ${rounded.toLocaleString("en-PK")}`;
}