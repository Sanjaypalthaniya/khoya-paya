import Papa from "papaparse";
import { bulkUploadRowSchema, BulkUploadRow } from "@/lib/validations/bulkUpload";

export type ParsedBulkRow = {
  rowNumber: number;
  raw: Record<string, unknown>;
  data?: BulkUploadRow;
  errors: string[];
};

export const bulkCsvHeaders = ["itemName", "category", "description", "rewardAmount", "contactPreference", "status"];

export const bulkCsvTemplateRows = [
  ["School Bag", "School Item", "Blue school bag with books", "500", "Message Only", "SAFE"],
  ["Office Laptop", "Laptop", "Dell laptop with black bag", "1000", "Message Only", "SAFE"],
  ["Pet Collar", "Pet", "Dog collar with name tag", "300", "Message Only", "SAFE"],
];

export function buildCsv(rows: Array<Array<string | number | boolean | null | undefined>>) {
  return Papa.unparse(rows.map((row) => row.map((value) => value ?? "")));
}

export function buildBulkTemplateCsv() {
  return buildCsv([bulkCsvHeaders, ...bulkCsvTemplateRows]);
}

export function parseBulkCsv(csvText: string) {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
    transform: (value) => value.trim(),
  });

  const rows: ParsedBulkRow[] = parsed.data.map((raw, index) => {
    const result = bulkUploadRowSchema.safeParse(raw);
    return {
      rowNumber: index + 2,
      raw,
      data: result.success ? result.data : undefined,
      errors: result.success ? [] : result.error.issues.map((issue) => issue.message),
    };
  });

  if (parsed.errors.length) {
    rows.unshift({
      rowNumber: 1,
      raw: {},
      errors: parsed.errors.map((error) => error.message),
    });
  }

  return rows;
}

export function exportItemsCsv(items: Array<{
  itemName: string;
  category: string;
  description: string;
  status: string;
  lostModeEnabled: boolean;
  rewardAmount: unknown;
  contactPreference: string;
  createdAt: Date;
  qrCode: { publicUrl: string } | null;
}>) {
  return Papa.unparse({
    fields: ["itemName", "category", "description", "status", "lostModeEnabled", "rewardAmount", "contactPreference", "qrPublicUrl", "createdAt"],
    data: items.map((item) => [
      item.itemName,
      item.category,
      item.description,
      item.status,
      item.lostModeEnabled,
      item.rewardAmount ? String(item.rewardAmount) : "",
      item.contactPreference,
      item.qrCode?.publicUrl ?? "",
      item.createdAt.toISOString(),
    ]),
  });
}
