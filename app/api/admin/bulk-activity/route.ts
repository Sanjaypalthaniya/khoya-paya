import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      subscriptions: { where: { status: "ACTIVE" }, include: { plan: true }, take: 1, orderBy: { createdAt: "desc" } },
      bulkImportLogs: { orderBy: { createdAt: "desc" } },
    },
  });

  return NextResponse.json({
    success: true,
    message: "Bulk activity loaded.",
    data: users.map((entry) => ({
      user: { id: entry.id, name: entry.name, email: entry.email },
      isBusiness: entry.subscriptions[0]?.plan.name.toLowerCase().includes("business") ?? false,
      totalBulkUploads: entry.bulkImportLogs.length,
      totalImportedItems: entry.bulkImportLogs.reduce((sum, log) => sum + log.importedCount, 0),
      totalFailedRows: entry.bulkImportLogs.reduce((sum, log) => sum + log.failedCount, 0),
      lastBulkUploadDate: entry.bulkImportLogs[0]?.createdAt ?? null,
    })),
  });
}
