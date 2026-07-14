import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { exportItemsCsv } from "@/lib/csv";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.isBlocked) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const items = await prisma.item.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { qrCode: { select: { publicUrl: true } } },
  });

  return new NextResponse(exportItemsCsv(items), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="khoya-paya-items.csv"',
    },
  });
}
