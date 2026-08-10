// app/api/upload/route.js
import { v2 as cloudinary } from "cloudinary";
import { successResponse, errorResponse } from "@/utils/response";
import { requireRole } from "@/lib/auth";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const requester = requireRole(req, ["ADMIN", "BRANCH_MANAGER"]);
    if (!requester) return errorResponse("Admin access only.", 403);

    const formData = await req.formData();
    const file = formData.get("file");
    if (!file) return errorResponse("No file provided.");

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "foodbite/menu-items" }, // keeps uploads organized in Cloudinary's dashboard
        (error, result) => (error ? reject(error) : resolve(result))
      );
      uploadStream.end(buffer);
    });

    return successResponse({ url: result.secure_url }, 201);
  } catch (err) {
    console.error("upload error:", err);
    return errorResponse("Something went wrong uploading the image.", 500);
  }
}
