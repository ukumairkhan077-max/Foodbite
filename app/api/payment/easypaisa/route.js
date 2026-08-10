// app/api/payment/easypaisa/route.js
// Easypaisa's integration differs from JazzCash — it typically uses AES-256 encryption
// of the request payload with a StoreId + HashKey pair, rather than an HMAC secure hash.
// Once you have sandbox credentials from their merchant portal, their docs will specify
// the exact encryption/field format — this stub is structured to slot that in.

import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { successResponse, errorResponse } from "@/utils/response";
import { getAuthUser } from "@/lib/auth";

const EASYPAISA_STORE_ID = process.env.EASYPAISA_STORE_ID;

export async function POST(req) {
  try {
    if (!EASYPAISA_STORE_ID) {
      return errorResponse("Easypaisa credentials not configured yet.", 501);
    }

    const authUser = getAuthUser(req);
    if (!authUser) return errorResponse("Authentication required.", 401);

    const { orderId } = await req.json();
    if (!orderId) return errorResponse("orderId is required.");

    await dbConnect();
    const order = await Order.findOne({ _id: orderId, user: authUser.userId });
    if (!order) return errorResponse("Order not found.", 404);

    // TODO once you have Easypaisa sandbox docs in hand:
    // 1. Build the required fields (storeId, orderId, transactionAmount, transactionType, etc.)
    // 2. Encrypt the payload per their spec (commonly AES-256-CBC with your HashKey)
    // 3. POST to their sandbox endpoint, or return a redirect URL for the frontend — their
    //    docs specify which integration mode (API-based vs hosted checkout) you're using.

    return errorResponse("Easypaisa integration not yet configured — awaiting merchant sandbox credentials.", 501);
  } catch (err) {
    console.error("easypaisa payment error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}
