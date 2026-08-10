// app/api/payment/jazzcash/route.js
// JazzCash doesn't work like Stripe — instead of returning a client secret, it wants
// a form of specific fields POSTed (with an HMAC secure hash) to their hosted checkout
// page. This route builds that payload; your frontend then auto-submits a form to
// JAZZCASH_CHECKOUT_URL with these exact fields.
//
// Docs: https://developer.jazzcash.com.pk (sandbox credentials come from their merchant portal)

import crypto from "crypto";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { successResponse, errorResponse } from "@/utils/response";
import { getAuthUser } from "@/lib/auth";

const JAZZCASH_MERCHANT_ID = process.env.JAZZCASH_MERCHANT_ID;
const JAZZCASH_PASSWORD = process.env.JAZZCASH_PASSWORD;
const JAZZCASH_INTEGRITY_SALT = process.env.JAZZCASH_INTEGRITY_SALT;
const JAZZCASH_RETURN_URL = process.env.JAZZCASH_RETURN_URL; // where JazzCash redirects the customer back to

// JazzCash requires fields to be alphabetically sorted by key, concatenated with "&",
// prefixed with the integrity salt, then HMAC-SHA256 hashed — this exact ordering is required.
function generateSecureHash(fields) {
  const sortedKeys = Object.keys(fields).sort();
  const concatenated = sortedKeys.map((key) => fields[key]).join("&");
  const hmac = crypto.createHmac("sha256", JAZZCASH_INTEGRITY_SALT);
  hmac.update(`${JAZZCASH_INTEGRITY_SALT}&${concatenated}`);
  return hmac.digest("hex");
}

export async function POST(req) {
  try {
    if (!JAZZCASH_MERCHANT_ID) {
      return errorResponse("JazzCash credentials not configured yet.", 501);
    }

    const authUser = getAuthUser(req);
    if (!authUser) return errorResponse("Authentication required.", 401);

    const { orderId } = await req.json();
    if (!orderId) return errorResponse("orderId is required.");

    await dbConnect();
    const order = await Order.findOne({ _id: orderId, user: authUser.userId });
    if (!order) return errorResponse("Order not found.", 404);

    const now = new Date();
    const txnDateTime = now.toISOString().replace(/[-:T.Z]/g, "").slice(0, 14); // YYYYMMDDHHmmss
    const txnRefNo = `T${Date.now()}`;
    const expiryDateTime = new Date(now.getTime() + 60 * 60 * 1000)
      .toISOString()
      .replace(/[-:T.Z]/g, "")
      .slice(0, 14);

    const fields = {
      pp_Version: "1.1",
      pp_TxnType: "MWALLET",
      pp_Language: "EN",
      pp_MerchantID: JAZZCASH_MERCHANT_ID,
      pp_Password: JAZZCASH_PASSWORD,
      pp_TxnRefNo: txnRefNo,
      pp_Amount: String(Math.round(order.total * 100)), // JazzCash also wants amount in the smallest unit
      pp_TxnCurrency: "PKR",
      pp_TxnDateTime: txnDateTime,
      pp_TxnExpiryDateTime: expiryDateTime,
      pp_BillReference: order._id.toString(),
      pp_Description: `Foodbite order ${order._id}`,
      pp_ReturnURL: JAZZCASH_RETURN_URL,
    };

    fields.pp_SecureHash = generateSecureHash(fields);

    order.paymentReference = txnRefNo;
    await order.save();

    // Frontend auto-submits these fields as a POST form to JazzCash's checkout URL
    return successResponse({
      checkoutUrl: "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/",
      fields,
    });
  } catch (err) {
    console.error("jazzcash payment error:", err);
    return errorResponse("Something went wrong initiating payment.", 500);
  }
}
