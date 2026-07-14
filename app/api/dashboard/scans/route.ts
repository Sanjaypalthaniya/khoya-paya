import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();

  if (!user || user.isBlocked) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const scans = await prisma.scanLog.findMany({
    where: { item: { userId: user.id } },
    orderBy: { scannedAt: "desc" },
    include: {
      item: { select: { itemName: true } },
      qrCode: { select: { uniqueCode: true } },
    },
  });

  return NextResponse.json({
    success: true,
    message: "Scan history loaded.",
    scans: scans.map((scan) => ({
      ...scan,
      scannedAt: scan.scannedAt.toISOString(),
    })),
  });
}
