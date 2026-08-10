// app/api/reviews/route.js
import dbConnect from "@/lib/dbConnect";
import Review from "@/models/Review";
import MenuItem from "@/models/MenuItem";
import Order from "@/models/Order";
import { successResponse, errorResponse } from "@/utils/response";
import { getAuthUser } from "@/lib/auth";

// GET /api/reviews?menuItem=<id> — public, approved reviews for one item
export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const menuItem = searchParams.get("menuItem");
    if (!menuItem) return errorResponse("menuItem query param is required.");

    const reviews = await Review.find({ menuItem, isApproved: true })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    return successResponse({ reviews });
  } catch (err) {
    console.error("get reviews error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}

// POST /api/reviews — customer only, must have actually ordered the item
export async function POST(req) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) return errorResponse("Authentication required.", 401);
    if (authUser.role !== "CUSTOMER") return errorResponse("Only customers can leave reviews.", 403);

    const { menuItem: menuItemId, order: orderId, rating, comment } = await req.json();

    if (!menuItemId || !rating) return errorResponse("menuItem and rating are required.");
    if (rating < 1 || rating > 5) return errorResponse("Rating must be between 1 and 5.");

    await dbConnect();

    // Verify the customer actually ordered this item, if an orderId was provided
    if (orderId) {
      const order = await Order.findOne({ _id: orderId, user: authUser.userId });
      if (!order) return errorResponse("Order not found.", 404);
      const orderedThisItem = order.items.some((i) => i.menuItem.toString() === menuItemId);
      if (!orderedThisItem) return errorResponse("You can only review items you've ordered.", 403);
    }

    const review = await Review.create({
      user: authUser.userId,
      menuItem: menuItemId,
      order: orderId,
      rating,
      comment,
    });

    // Recalculate the item's denormalized avgRating/reviewCount
    const stats = await Review.aggregate([
      { $match: { menuItem: review.menuItem, isApproved: true } },
      { $group: { _id: "$menuItem", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);

    if (stats.length) {
      await MenuItem.findByIdAndUpdate(menuItemId, {
        avgRating: Math.round(stats[0].avgRating * 10) / 10,
        reviewCount: stats[0].count,
      });
    }

    return successResponse({ message: "Review submitted", review }, 201);
  } catch (err) {
    if (err.code === 11000) return errorResponse("You've already reviewed this item for this order.", 409);
    console.error("create review error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}
