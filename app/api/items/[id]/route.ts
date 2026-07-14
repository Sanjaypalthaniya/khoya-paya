import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateItemSchema } from "@/lib/validations/item";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.isBlocked) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const item = await prisma.item.findFirst({
    where: { id, userId: user.id },
    include: {
      qrCode: true,
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

  const existing = await prisma.item.findFirst({ where: { id, userId: user.id }, select: { id: true } });
  if (!existing) return NextResponse.json({ success: false, message: "Item not found." }, { status: 404 });

  const parsed = updateItemSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: parsed.error.issues[0]?.message ?? "Invalid item details." }, { status: 400 });
  }
  const status = parsed.data.status;
  const { imageUrls, ...updates } = parsed.data;
  const item = await prisma.item.update({
    where: { id },
    data: {
      ...updates,
      description: parsed.data.description ?? undefined,
      imageUrl: parsed.data.imageUrl === "" ? null : parsed.data.imageUrl,
      rewardAmount: parsed.data.rewardAmount === undefined ? undefined : parsed.data.rewardAmount,
      lostModeEnabled: status ? status === "LOST" : undefined,
      images: imageUrls ? { deleteMany: {}, create: imageUrls.map((imageUrl, sortOrder) => ({ imageUrl, sortOrder })) } : undefined,
    },
  });

  return NextResponse.json({ success: true, message: "Item updated successfully.", data: { item } });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.isBlocked) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const existing = await prisma.item.findFirst({ where: { id, userId: user.id }, select: { id: true } });
  if (!existing) return NextResponse.json({ success: false, message: "Item not found." }, { status: 404 });

  await prisma.item.delete({ where: { id } });
  return NextResponse.json({ success: true, message: "Item deleted successfully.", data: {} });
}
