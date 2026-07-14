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
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { qrCode: true, _count: { select: { finderMessages: true, scanLogs: true } } },
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
      visibility: parsed.data.visibility,
      emergencyContact: parsed.data.emergencyContact || null,
      lostDate: parsed.data.lostDate ?? null,
      lastSeenLocation: parsed.data.lastSeenLocation || null,
      publicSearchVisible: parsed.data.publicSearchVisible,
      qrRecoveryEnabled: parsed.data.qrRecoveryEnabled,
      images: parsed.data.imageUrls.length ? { create: parsed.data.imageUrls.map((imageUrl, sortOrder) => ({ imageUrl, sortOrder })) } : undefined,
      },
    );

    return NextResponse.json({ success: true, message: result.communityPost ? "Item added and published to the Community Feed." : "Your item has been registered privately for QR protection.", data: result }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, message: "Could not create item." }, { status: 500 });
  }
}
