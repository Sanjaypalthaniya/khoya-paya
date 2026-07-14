import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import crypto from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);

function hasCloudinaryConfig() {
  return [
    process.env.CLOUDINARY_CLOUD_NAME,
    process.env.CLOUDINARY_API_KEY,
    process.env.CLOUDINARY_API_SECRET,
  ].every((value) => value && !value.startsWith("your_"));
}

function localExtension(contentType: string) {
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  return "jpg";
}

async function uploadImageLocally(file: File, folder: string) {
  const safeFolder = folder.replace(/^khoya-paya\//, "").replace(/[^a-z0-9/-]/gi, "");
  const fileName = `${crypto.randomUUID()}.${localExtension(file.type)}`;
  const relativePath = `/uploads/${safeFolder}/${fileName}`;
  const uploadDirectory = path.join(process.cwd(), "public", "uploads", safeFolder);

  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(path.join(uploadDirectory, fileName), Buffer.from(await file.arrayBuffer()), { flag: "wx" });

  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
  return {
    secure_url: `${baseUrl}${relativePath}`,
    public_id: `local:${relativePath}`,
  };
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export function validateImageFile(file: File) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return "Only JPG, PNG, and WEBP images are allowed.";
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || !ALLOWED_IMAGE_EXTENSIONS.has(extension)) {
    return "Only .jpg, .jpeg, .png, and .webp files are allowed.";
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return "Image must be 5MB or smaller.";
  }

  return null;
}

export async function uploadImage(file: File, folder: string): Promise<Pick<UploadApiResponse, "secure_url" | "public_id">> {
  if (!hasCloudinaryConfig()) {
    if (process.env.NODE_ENV !== "production") {
      return uploadImageLocally(file, folder);
    }
    throw new Error("Cloudinary is not configured.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  return new Promise<UploadApiResponse>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "image",
          allowed_formats: ["jpg", "jpeg", "png", "webp"],
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error("Image upload failed."));
            return;
          }

          resolve(result);
        },
      )
      .end(buffer);
  });
}

export async function deleteImage(publicId: string) {
  if (!publicId) return null;
  return cloudinary.uploader.destroy(publicId);
}
