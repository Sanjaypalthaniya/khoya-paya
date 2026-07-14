import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { generateMissingQrCodes } from "@/lib/bulk";
import { parseBulkCsv } from "@/lib/csv";
import { prisma } from "@/lib/prisma";
import { getBulkUploadLimit, requireBusinessPlan } from "@/lib/business-access";
import { generateRecoveryCode } from "@/lib/recovery-code";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 2 * 1024 * 1024;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.isBlocked) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const access = await requireBusinessPlan(user.id);
  if (!access.success) return NextResponse.json(access, { status: 403 });

  const formData = await request.formData();
  const file = formData.get("file");
  const generateQr = formData.get("generateQr") === "true";

  if (!(file instanceof File)) return NextResponse.json({ success: false, message: "CSV file is required." }, { status: 400 });
  if (!file.name.toLowerCase().endsWith(".csv")) return NextResponse.json({ success: false, message: "Only .csv files are allowed." }, { status: 400 });
  if (file.size > MAX_FILE_SIZE) return NextResponse.json({ success: false, message: "CSV file must be 2MB or smaller." }, { status: 400 });

  const rows = parseBulkCsv(await file.text());
  const validRows = rows.filter((row) => row.data);
  const invalidRows = rows.filter((row) => row.errors.length);
  const limit = await getBulkUploadLimit(user.id);

  if (rows.length > limit) {
    return NextResponse.json({ success: false, message: `CSV can include up to ${limit} rows.` }, { status: 400 });
  }

  const currentItems = await prisma.item.count({ where: { userId: user.id } });
  if (currentItems + validRows.length > limit) {
    return NextResponse.json({ success: false, message: `Import exceeds your Business plan item limit of ${limit}.` }, { status: 400 });
  }

  const createdItems = [];
  for (const row of validRows) {
    if (!row.data) continue;
    const item = await prisma.item.create({
      data: {
        recoveryCode: await generateRecoveryCode(),
        userId: user.id,
        itemName: row.data.itemName,
        category: row.data.category,
        description: row.data.description || "",
        rewardAmount: row.data.rewardAmount ?? null,
        contactPreference: row.data.contactPreference,
        status: row.data.status,
        lostModeEnabled: row.data.status === "LOST",
      },
    });
    createdItems.push(item);
  }

  let generatedQrCount = 0;
  if (generateQr && createdItems.length) {
    const result = await generateMissingQrCodes(createdItems.map((item) => item.id), user.id);
    generatedQrCount = result.generated.length;
  }

  await prisma.bulkImportLog.create({
    data: {
      userId: user.id,
      fileName: file.name,
      totalRows: rows.length,
      importedCount: createdItems.length,
      failedCount: invalidRows.length,
      errorSummary: invalidRows.map((row) => ({ rowNumber: row.rowNumber, errors: row.errors })),
    },
  });

  return NextResponse.json({
    success: true,
    message: "Bulk import completed.",
    data: {
      totalRows: rows.length,
      importedCount: createdItems.length,
      failedCount: invalidRows.length,
      generatedQrCount,
      errors: invalidRows.map((row) => ({ rowNumber: row.rowNumber, errors: row.errors })),
      createdItems,
    },
  });
}
