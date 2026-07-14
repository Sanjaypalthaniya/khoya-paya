import { z } from "zod";
import { contactPreferences, itemCategories, itemStatusValues } from "@/lib/validations/item";

const emptyToUndefined = z.preprocess((value) => (typeof value === "string" && value.trim() === "" ? undefined : value), z.coerce.number().min(0).optional());

export const bulkUploadRowSchema = z.object({
  itemName: z.string().trim().min(1, "itemName is required").max(120),
  category: z.enum(itemCategories, { message: "category is invalid" }),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  rewardAmount: emptyToUndefined,
  contactPreference: z.enum(contactPreferences, { message: "contactPreference is invalid" }),
  status: z.enum(itemStatusValues, { message: "status is invalid" }).default("SAFE"),
});

export type BulkUploadRow = z.infer<typeof bulkUploadRowSchema>;
