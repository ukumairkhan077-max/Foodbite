// app/api/orders/[id]/status/route.js
// Updates an order's status — used by admin/branch manager (accept, prepare, dispatch)
// and by the rider (mark delivered). Also allows a customer to cancel their own PENDING order.

import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { successResponse, errorResponse } from "@/utils/response";
import { getAuthUser } from "@/lib/auth";

const VALID_STATUSES = ["PENDING", "ACCEPTED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

export async function PATCH(req, { params }) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) return errorResponse("Authentication required.", 401);

    const { status, cancelReason } = await req.json();
    if (!status || !VALID_STATUSES.includes(status)) {
      return errorResponse(`Status must be one of: ${VALID_STATUSES.join(", ")}`);
    }

    await dbConnect();
    const order = await Order.findById(params.id);
    if (!order) return errorResponse("Order not found.", 404);

    const isOwner = order.user.toString() === authUser.userId;
    const isStaff = ["ADMIN", "BRANCH_MANAGER", "RIDER"].includes(authUser.role);

    // Customers may only cancel their own order, and only while it's still PENDING
    if (isOwner && !isStaff) {
      if (status !== "CANCELLED") return errorResponse("Customers may only cancel an order.", 403);
      if (order.status !== "PENDING") return errorResponse("This order can no longer be cancelled.", 400);
    } else if (!isStaff) {
      return errorResponse("Not authorized to update this order.", 403);
    }

    order.status = status;
    order.statusHistory.push({ status });
    if (status === "CANCELLED" && cancelReason) order.cancelReason = cancelReason;

    await order.save();

    return successResponse({ message: "Order status updated", order });
  } catch (err) {
    console.error("update order status error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}