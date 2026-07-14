import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { uploadImage, validateImageFile } from "@/lib/cloudinary";
import { reportServerError } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.isBlocked) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, message: "Image file is required." }, { status: 400 });
    }

    const validationError = validateImageFile(file);
    if (validationError) {
      return NextResponse.json({ success: false, message: validationError }, { status: 400 });
    }

    const uploaded = await uploadImage(file, "khoya-paya/items");

    return NextResponse.json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        imageUrl: uploaded.secure_url,
        publicId: uploaded.public_id,
      },
    });
  } catch (error) {
    reportServerError("dashboard-image-upload", error);
    return NextResponse.json({ success: false, message: "Unable to upload image." }, { status: 500 });
  }
}
