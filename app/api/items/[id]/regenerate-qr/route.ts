import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildPublicFinderUrl, generateQRCodeDataURL, generateUniqueQRCode } from "@/lib/qr";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.isBlocked) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const item = await prisma.item.findFirst({ where: { id, userId: user.id }, select: { id: true } });
  if (!item) return NextResponse.json({ success: false, message: "Item not found." }, { status: 404 });

  await prisma.qRCode.deleteMany({ where: { itemId: item.id } });
  const uniqueCode = generateUniqueQRCode();
  const publicUrl = buildPublicFinderUrl(uniqueCode);
  const imageUrl = await generateQRCodeDataURL(publicUrl);
  const qrCode = await prisma.qRCode.create({ data: { itemId: item.id, uniqueCode, publicUrl, imageUrl } });

  return NextResponse.json({ success: true, message: "QR code regenerated.", data: { qrCode } });
}
