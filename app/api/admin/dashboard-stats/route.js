// app/api/admin/dashboard-stats/route.js
// Note: middleware.js already blocks non-admin roles from reaching /api/admin/*,
// so no need to call requireRole again here — but it's kept for defense-in-depth.

import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import User from "@/models/User";
import { successResponse, errorResponse } from "@/utils/response";
import { requireRole } from "@/lib/auth";

export async function GET(req) {
  try {
    const requester = requireRole(req, ["ADMIN", "BRANCH_MANAGER"]);
    if (!requester) return errorResponse("Admin access only.", 403);

    await dbConnect();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayOrders, totalCustomers, pendingOrders, revenueAgg] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: today } }),
      User.countDocuments({ role: "CUSTOMER" }),
      Order.countDocuments({ status: { $in: ["PENDING", "ACCEPTED", "PREPARING"] } }),
      Order.aggregate([
        { $match: { createdAt: { $gte: today }, status: { $ne: "CANCELLED" } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
    ]);

    const todayRevenue = revenueAgg[0]?.total || 0;

    // Top 5 best-selling items overall
    const topItems = await Order.aggregate([
      { $match: { status: { $ne: "CANCELLED" } } },
      { $unwind: "$items" },
      { $group: { _id: "$items.name", totalSold: { $sum: "$items.quantity" } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    return successResponse({
      stats: {
        todayOrders,
        todayRevenue,
        totalCustomers,
        pendingOrders,
        topItems,
      },
    });
  } catch (err) {
    console.error("dashboard stats error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}
