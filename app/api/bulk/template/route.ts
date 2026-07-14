import { NextResponse } from "next/server";
import { buildBulkTemplateCsv } from "@/lib/csv";

export async function GET() {
  return new NextResponse(buildBulkTemplateCsv(), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="khoya-paya-bulk-template.csv"',
    },
  });
}
