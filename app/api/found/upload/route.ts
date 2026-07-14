import { NextResponse } from "next/server";
import { uploadImage, validateImageFile } from "@/lib/cloudinary";
import { enforceRateLimit } from "@/lib/rate-limit";
import { rateLimitResponse } from "@/lib/api-response";
import { reportServerError } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const rateLimit = enforceRateLimit(request, "finder-upload", 10, 60 * 1000);
    if (!rateLimit.allowed) return rateLimitResponse();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, message: "Image file is required." }, { status: 400 });
    }

    const validationError = validateImageFile(file);
    if (validationError) {
      return NextResponse.json({ success: false, message: validationError }, { status: 400 });
    }

    const uploaded = await uploadImage(file, "khoya-paya/finder-photos");

    return NextResponse.json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        finderPhotoUrl: uploaded.secure_url,
        publicId: uploaded.public_id,
      },
    });
  } catch (error) {
    reportServerError("finder-photo-upload", error);
    return NextResponse.json({ success: false, message: "Unable to upload image." }, { status: 500 });
  }
}
