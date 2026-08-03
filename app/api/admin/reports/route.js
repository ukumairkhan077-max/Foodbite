// app/api/admin/reports/route.js
// Sales report over a date range, optionally filtered by branch.
// Usage: GET /api/admin/reports?from=2026-07-01&to=2026-07-31&branch=<id>

import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { successResponse, errorResponse } from "@/utils/response";
import { requireRole } from "@/lib/auth";

export async function GET(req) {
  try {
    const requester = requireRole(req, ["ADMIN", "BRANCH_MANAGER"]);
    if (!requester) return errorResponse("Admin access only.", 403);

    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const branch = searchParams.get("branch");

    if (!from || !to) return errorResponse("Both from and to date query params are required.");

    await dbConnect();

    const match = {
      createdAt: { $gte: new Date(from), $lte: new Date(to) },
      status: { $ne: "CANCELLED" },
    };
    if (branch) match.branch = branch;

    const [summary, dailyBreakdown, byBranch] = await Promise.all([
      Order.aggregate([
        { $match: match },
        { $group: { _id: null, totalOrders: { $sum: 1 }, totalRevenue: { $sum: "$total" } } },
      ]),
      Order.aggregate([
        { $match: match },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            orders: { $sum: 1 },
            revenue: { $sum: "$total" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $match: match },
        { $group: { _id: "$branch", orders: { $sum: 1 }, revenue: { $sum: "$total" } } },
      ]),
    ]);

    return successResponse({
      report: {
        totalOrders: summary[0]?.totalOrders || 0,
        totalRevenue: summary[0]?.totalRevenue || 0,
        dailyBreakdown,
        byBranch,
      },
    });
  } catch (err) {
    console.error("reports error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}