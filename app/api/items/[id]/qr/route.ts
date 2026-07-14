import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.isBlocked) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const item = await prisma.item.findFirst({ where: { id, userId: user.id }, include: { qrCode: true } });
  if (!item) return NextResponse.json({ success: false, message: "Item not found." }, { status: 404 });
  if (!item.qrCode) return NextResponse.json({ success: false, message: "QR code has not been generated." }, { status: 404 });

  return NextResponse.json({ success: true, message: "QR code loaded.", data: { qrCode: item.qrCode, itemName: item.itemName } });
}
