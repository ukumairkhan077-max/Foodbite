// app/api/webhook/jazzcash/route.js
// JazzCash redirects the customer's browser back here (or POSTs server-to-server,
// depending on integration mode) with pp_ResponseCode and its own pp_SecureHash.
// We recompute the hash the same way we generated it and compare — if they don't
// match, the payload was tampered with and must be rejected.

import crypto from "crypto";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { successResponse, errorResponse } from "@/utils/response";

const JAZZCASH_INTEGRITY_SALT = process.env.JAZZCASH_INTEGRITY_SALT;

function verifySecureHash(fields) {
  const { pp_SecureHash, ...rest } = fields;
  const sortedKeys = Object.keys(rest).sort();
  const concatenated = sortedKeys.map((key) => rest[key]).join("&");
  const hmac = crypto.createHmac("sha256", JAZZCASH_INTEGRITY_SALT);
  hmac.update(`${JAZZCASH_INTEGRITY_SALT}&${concatenated}`);
  const expectedHash = hmac.digest("hex");
  return expectedHash === pp_SecureHash;
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const fields = Object.fromEntries(formData.entries());

    if (!verifySecureHash(fields)) {
      console.error("JazzCash webhook: secure hash mismatch — possible tampering.");
      return errorResponse("Invalid signature.", 400);
    }

    const { pp_TxnRefNo, pp_ResponseCode, pp_BillReference } = fields;

    await dbConnect();
    const order = await Order.findById(pp_BillReference);
    if (!order) return errorResponse("Order not found.", 404);

    // JazzCash uses "000" as the success code
    if (pp_ResponseCode === "000") {
      order.isPaid = true;
      order.paymentReference = pp_TxnRefNo;
      await order.save();
    }

    return successResponse({ received: true });
  } catch (err) {
    console.error("jazzcash webhook error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}
