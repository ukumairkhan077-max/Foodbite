// app/api/orders/[id]/route.js
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { successResponse, errorResponse } from "@/utils/response";
import { getAuthUser } from "@/lib/auth";

// GET /api/orders/:id — the order's owner, or an admin, can view it
export async function GET(req, { params }) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) return errorResponse("Authentication required.", 401);

    await dbConnect();
    const order = await Order.findById(params.id).populate("branch", "name city").populate("rider", "name phone");
    if (!order) return errorResponse("Order not found.", 404);

    const isOwner = order.user.toString() === authUser.userId;
    const isStaff = ["ADMIN", "BRANCH_MANAGER", "RIDER"].includes(authUser.role);
    if (!isOwner && !isStaff) return errorResponse("Not authorized to view this order.", 403);

    return successResponse({ order });
  } catch (err) {
    console.error("get order error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}
