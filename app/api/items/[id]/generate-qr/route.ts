import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildPublicFinderUrl, generateQRCodeDataURL, generateUniqueQRCode } from "@/lib/qr";

type RouteContext = { params: Promise<{ id: string }> };

async function createQr(itemId: string) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const uniqueCode = generateUniqueQRCode();
    const publicUrl = buildPublicFinderUrl(uniqueCode);
    const imageUrl = await generateQRCodeDataURL(publicUrl);

    try {
      return await prisma.qRCode.create({ data: { itemId, uniqueCode, publicUrl, imageUrl } });
    } catch {
      if (attempt === 4) throw new Error("Unable to generate unique QR code.");
    }
  }

  throw new Error("Unable to generate unique QR code.");
}

export async function POST(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.isBlocked) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const item = await prisma.item.findFirst({ where: { id, userId: user.id }, include: { qrCode: true } });
  if (!item) return NextResponse.json({ success: false, message: "Item not found." }, { status: 404 });

  const qrCode = item.qrCode ?? await createQr(item.id);
  return NextResponse.json({ success: true, message: item.qrCode ? "QR code already exists." : "QR code generated.", data: { qrCode } });
}
