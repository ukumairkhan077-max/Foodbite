// app/api/riders/[id]/route.js
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { successResponse, errorResponse } from "@/utils/response";
import { getAuthUser } from "@/lib/auth";

// GET /api/riders/:id — admin, or the rider viewing their own profile
export async function GET(req, { params }) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) return errorResponse("Authentication required.", 401);

    const isSelf = authUser.userId === params.id;
    const isAdmin = ["ADMIN", "BRANCH_MANAGER"].includes(authUser.role);
    if (!isSelf && !isAdmin) return errorResponse("Not authorized.", 403);

    await dbConnect();
    const rider = await User.findOne({ _id: params.id, role: "RIDER" }).select("name phone riderDetails");
    if (!rider) return errorResponse("Rider not found.", 404);

    return successResponse({ rider });
  } catch (err) {
    console.error("get rider error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}

// PATCH /api/riders/:id — the rider updates their own availability/location
export async function PATCH(req, { params }) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) return errorResponse("Authentication required.", 401);
    if (authUser.userId !== params.id) return errorResponse("You can only update your own rider profile.", 403);

    const { isAvailable, currentLat, currentLng, vehicleNo } = await req.json();

    await dbConnect();
    const rider = await User.findOne({ _id: params.id, role: "RIDER" });
    if (!rider) return errorResponse("Rider not found.", 404);

    if (isAvailable !== undefined) rider.riderDetails.isAvailable = isAvailable;
    if (currentLat !== undefined) rider.riderDetails.currentLat = currentLat;
    if (currentLng !== undefined) rider.riderDetails.currentLng = currentLng;
    if (vehicleNo !== undefined) rider.riderDetails.vehicleNo = vehicleNo;

    await rider.save();

    return successResponse({ message: "Rider profile updated", rider: { name: rider.name, riderDetails: rider.riderDetails } });
  } catch (err) {
    console.error("update rider error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}
