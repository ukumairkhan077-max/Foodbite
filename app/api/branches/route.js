// app/api/branches/route.js
import dbConnect from "@/lib/dbConnect";
import Branch from "@/models/Branch";
import { successResponse, errorResponse } from "@/utils/response";
import { requireRole } from "@/lib/auth";

// GET /api/branches — public, list active branches (for branch locator)
export async function GET() {
  try {
    await dbConnect();
    const branches = await Branch.find({ isActive: true });
    return successResponse({ branches });
  } catch (err) {
    console.error("get branches error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}

// POST /api/branches — admin only, create a new branch
export async function POST(req) {
  try {
    const requester = requireRole(req, ["ADMIN"]);
    if (!requester) return errorResponse("Admin access only.", 403);

    const body = await req.json();
    const { name, city, address, latitude, longitude, contactPhone } = body;

    if (!name || !city || !address || latitude == null || longitude == null || !contactPhone) {
      return errorResponse("Name, city, address, latitude, longitude, and contactPhone are required.");
    }

    await dbConnect();
    const branch = await Branch.create(body);
    return successResponse({ message: "Branch created", branch }, 201);
  } catch (err) {
    console.error("create branch error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}
