import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateItemSchema } from "@/lib/validations/item";
import { softDeleteItemWithCommunityIntegration, updateItemWithCommunityIntegration } from "@/lib/items/community-integration";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.isBlocked) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const item = await prisma.item.findFirst({
    where: { id, userId: user.id, deletedAt: null },
    include: {
      qrCode: true,
      communityPost: true,
      _count: { select: { finderMessages: true, scanLogs: true } },
    },
  });

  if (!item) return NextResponse.json({ success: false, message: "Item not found." }, { status: 404 });
  return NextResponse.json({ success: true, message: "Item loaded.", data: { item } });
}

export async function PUT(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.isBlocked) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const existing = await prisma.item.findFirst({ where: { id, userId: user.id, deletedAt: null }, select: { id: true } });
  if (!existing) return NextResponse.json({ success: false, message: "Item not found." }, { status: 404 });

  const parsed = updateItemSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: parsed.error.issues[0]?.message ?? "Invalid item details." }, { status: 400 });
  }
  const status = parsed.data.status;
  const { imageUrls, publishToCommunity, clientRequestId: _clientRequestId, ...updates } = parsed.data;
  void _clientRequestId;
  try {
    const result = await updateItemWithCommunityIntegration(user.id, id, {
      ...updates,
      description: parsed.data.description ?? undefined,
      imageUrl: parsed.data.imageUrl === "" ? null : parsed.data.imageUrl,
      rewardAmount: parsed.data.rewardAmount === undefined ? undefined : parsed.data.rewardAmount,
      lostModeEnabled: status ? status === "LOST" : undefined,
      images: imageUrls ? { deleteMany: {}, create: imageUrls.map((imageUrl, sortOrder) => ({ imageUrl, sortOrder })) } : undefined,
    }, publishToCommunity);
    return NextResponse.json({ success: true, message: result.communityPost ? "Item and Community Feed post updated." : "Item updated privately.", data: result });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Unable to update item." }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.isBlocked) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const existing = await prisma.item.findFirst({ where: { id, userId: user.id, deletedAt: null }, select: { id: true } });
  if (!existing) return NextResponse.json({ success: false, message: "Item not found." }, { status: 404 });

  await softDeleteItemWithCommunityIntegration(user.id, id);
  return NextResponse.json({ success: true, message: "Item archived and its public post closed.", data: {} });
}
