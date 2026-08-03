// app/api/reviews/[id]/route.js
import dbConnect from "@/lib/dbConnect";
import Review from "@/models/Review";
import { successResponse, errorResponse } from "@/utils/response";
import { getAuthUser, requireRole } from "@/lib/auth";

// PUT /api/reviews/:id — admin only, moderate (approve/hide) a review
export async function PUT(req, { params }) {
  try {
    const requester = requireRole(req, ["ADMIN"]);
    if (!requester) return errorResponse("Admin access only.", 403);

    const { isApproved } = await req.json();
    await dbConnect();

    const review = await Review.findByIdAndUpdate(params.id, { isApproved }, { new: true });
    if (!review) return errorResponse("Review not found.", 404);

    return successResponse({ message: "Review updated", review });
  } catch (err) {
    console.error("update review error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}

// DELETE /api/reviews/:id — admin, or the review's own author
export async function DELETE(req, { params }) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) return errorResponse("Authentication required.", 401);

    await dbConnect();
    const review = await Review.findById(params.id);
    if (!review) return errorResponse("Review not found.", 404);

    const isOwner = review.user.toString() === authUser.userId;
    if (!isOwner && authUser.role !== "ADMIN") return errorResponse("Not authorized.", 403);

    await review.deleteOne();
    return successResponse({ message: "Review deleted" });
  } catch (err) {
    console.error("delete review error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}