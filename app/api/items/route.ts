import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createItemSchema } from "@/lib/validations/item";
import { generateRecoveryCode } from "@/lib/recovery-code";
import { createItemWithCommunityIntegration } from "@/lib/items/community-integration";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.isBlocked) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const items = await prisma.item.findMany({
    where: { userId: user.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { qrCode: true, communityPost: { select: { id: true, status: true, visibility: true } }, _count: { select: { finderMessages: true, scanLogs: true } } },
  });

  return NextResponse.json({ success: true, message: "Items loaded.", data: { items } });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.isBlocked) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const parsed = createItemSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: parsed.error.issues[0]?.message ?? "Invalid item details." }, { status: 400 });
  }
  try {
    const recoveryCode = await generateRecoveryCode();
    const eligibleForCommunity = ["LOST", "FOUND", "MISSING"].includes(parsed.data.status);
    const publishToCommunity = eligibleForCommunity && (parsed.data.publishToCommunity ?? true);
    const result = await createItemWithCommunityIntegration(user.id, {
      userId: user.id,
      itemName: parsed.data.itemName,
      category: parsed.data.category,
      description: parsed.data.description || "",
      imageUrl: parsed.data.imageUrl || null,
      rewardAmount: parsed.data.rewardAmount ?? null,
      contactPreference: parsed.data.contactPreference,
      status: parsed.data.status,
      lostModeEnabled: parsed.data.status === "LOST",
      recoveryCode,
      brand: parsed.data.brand || null,
      modelNumber: parsed.data.modelNumber || null,
      color: parsed.data.color || null,
      identifyingMarks: parsed.data.identifyingMarks || null,
      purchaseDate: parsed.data.purchaseDate ?? null,
      estimatedValue: parsed.data.estimatedValue ?? null,
      recoveryPreference: parsed.data.recoveryPreference || null,
      visibility: publishToCommunity ? "PUBLIC" : parsed.data.visibility,
      emergencyContact: parsed.data.emergencyContact || null,
      lostDate: parsed.data.lostDate ?? null,
      lastSeenLocation: parsed.data.lastSeenLocation || null,
      publicSearchVisible: publishToCommunity || parsed.data.publicSearchVisible,
      qrRecoveryEnabled: parsed.data.qrRecoveryEnabled,
      clientRequestId: parsed.data.clientRequestId,
      images: parsed.data.imageUrls.length ? { create: parsed.data.imageUrls.map((imageUrl, sortOrder) => ({ imageUrl, sortOrder })) } : undefined,
      }, publishToCommunity,
    );

    const message = result.communityPost
      ? parsed.data.status === "FOUND" ? "Your found item is now visible in the Community Feed." : "Your item has been added and published to the Community Feed."
      : "Your item has been registered privately for QR protection.";
    return NextResponse.json({ success: true, message, data: { ...result, publicationStatus: result.communityPost?.status ?? "PRIVATE", privacyStatus: result.communityPost ? "PUBLIC_SAFE" : "PRIVATE", redirectTarget: "/dashboard/items" } }, { status: result.duplicate ? 200 : 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Could not create item." }, { status: 400 });
  }
}
