import JSZip from "jszip";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { requireBusinessPlan } from "@/lib/business-access";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function cleanFileName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "item";
}

function dataUrlToBuffer(dataUrl: string) {
  const base64 = dataUrl.split(",")[1];
  return Buffer.from(base64 ?? "", "base64");
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.isBlocked) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const access = await requireBusinessPlan(user.id);
  if (!access.success) return NextResponse.json(access, { status: 403 });

  const body = await request.json();
  const itemIds = Array.isArray(body.itemIds) ? body.itemIds.filter((id: unknown) => typeof id === "string") : [];
  if (!itemIds.length) return NextResponse.json({ success: false, message: "No items selected." }, { status: 400 });

  const items = await prisma.item.findMany({
    where: { userId: user.id, id: { in: itemIds }, qrCode: { isNot: null } },
    include: { qrCode: true },
  });

  if (!items.length) return NextResponse.json({ success: false, message: "Selected items do not have QR codes." }, { status: 400 });

  const zip = new JSZip();
  for (const item of items) {
    if (!item.qrCode?.imageUrl) continue;
    zip.file(`${cleanFileName(item.itemName)}-qr.png`, dataUrlToBuffer(item.qrCode.imageUrl));
  }

  const zipBuffer = await zip.generateAsync({ type: "arraybuffer" });
  return new NextResponse(zipBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="khoya-paya-qr-codes.zip"',
    },
  });
}
