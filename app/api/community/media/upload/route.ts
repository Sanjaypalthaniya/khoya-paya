import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { communityFailure, communitySuccess } from "@/lib/community/api";
import { CommunityError } from "@/lib/community/errors";
import {
  validateCommunityMedia,
  uploadCommunityMedia,
} from "@/lib/community/media";
import {
  requireCommunityUser,
  enforceCommunityRateLimit,
} from "@/lib/community/route-auth";
import {
  moderateMediaMetadata,
  recordModerationCase,
} from "@/lib/moderation/service";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  try {
    const user = await requireCommunityUser();
    enforceCommunityRateLimit(request, "media-upload", user.id, 12);
    const form = await request.formData();
    const file = form.get("file");
    const altText = String(form.get("altText") || "").trim();
    const selectedCategory = String(form.get("selectedCategory") || "").trim();
    if (!(file instanceof File))
      throw new CommunityError(
        "VALIDATION_ERROR",
        "Media file is required.",
        400,
      );
    if (!altText || altText.length > 240)
      throw new CommunityError(
        "VALIDATION_ERROR",
        "Alt text between 1 and 240 characters is required.",
        400,
      );
    const mediaType = await validateCommunityMedia(file);
    const contentHash = createHash("sha256")
      .update(Buffer.from(await file.arrayBuffer()))
      .digest("hex");
    const uploaded = await uploadCommunityMedia(file, user.id, mediaType);
    const moderation = await moderateMediaMetadata({
      ownerId: user.id,
      mediaType,
      mediaUrl: uploaded.url,
      altText,
      selectedCategory: selectedCategory || undefined,
      contentHash,
    });
    const media = await prisma.postMedia.create({
      data: {
        ownerId: user.id,
        mediaType,
        url: uploaded.url,
        storageKey: uploaded.storageKey,
        mimeType: file.type,
        fileSize: file.size,
        altText,
        processingStatus: "READY",
        contentHash,
        moderationStatus:
          moderation.decision === "APPROVED"
            ? "APPROVED"
            : moderation.decision === "REJECTED"
              ? "REJECTED"
              : "PENDING",
        moderationReason: moderation.userMessage,
      },
    });
    await recordModerationCase({
      targetType: "MEDIA",
      targetId: media.id,
      ownerId: user.id,
      result: moderation,
      source: moderation.provider.startsWith("local")
        ? "LOCAL_RULES"
        : "SELF_HOSTED",
    });
    if (moderation.decision === "REJECTED")
      throw new CommunityError("CONTENT_REJECTED", moderation.userMessage, 422);
    return communitySuccess(
      moderation.userMessage,
      {
        id: media.id,
        type: media.mediaType,
        url: media.url,
        altText: media.altText,
        processingStatus: media.processingStatus,
        moderationStatus: media.moderationStatus,
        categoryMatch: moderation.categoryMatch ?? null,
        detectedLabels: moderation.detectedLabels ?? [],
      },
      201,
    );
  } catch (error) {
    return communityFailure(error, "community-media-upload");
  }
}
