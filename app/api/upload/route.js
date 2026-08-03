// app/api/upload/route.js
// Stub for image uploads (menu item photos, category images, etc.).
// Replace the TODO with your chosen provider — Cloudinary, UploadThing, or S3 are common choices.

import { successResponse, errorResponse } from "@/utils/response";
import { requireRole } from "@/lib/auth";

export async function POST(req) {
  try {
    const requester = requireRole(req, ["ADMIN", "BRANCH_MANAGER"]);
    if (!requester) return errorResponse("Admin access only.", 403);

    const formData = await req.formData();
    const file = formData.get("file");
    if (!file) return errorResponse("No file provided.");

    // TODO: upload `file` to Cloudinary/S3/UploadThing here and get back a public URL.

    return errorResponse("Image upload provider not yet configured.", 501);
  } catch (err) {
    console.error("upload error:", err);
    return errorResponse("Something went wrong.", 500);
  }
}