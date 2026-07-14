import { z } from "zod";

export const itemCategories = [
  "Bag",
  "Wallet",
  "Keys",
  "Mobile",
  "Laptop",
  "Documents",
  "School Item",
  "Pet",
  "Travel Luggage",
  "Office Asset",
  "Other",
] as const;

export const contactPreferences = [
  "Message Only",
  "Show Phone After Approval",
  "Show Email After Approval",
] as const;

export const itemStatusValues = ["SAFE", "LOST", "FOUND", "RECOVERED"] as const;

const optionalUrl = z.string().trim().url("Enter a valid image URL").refine(
  (value) => value.startsWith("https://"),
  "Image URL must use HTTPS",
).optional().or(z.literal(""));
const rewardAmount = z.coerce.number().min(0, "Reward amount cannot be negative").optional().nullable();

export const createItemSchema = z.object({
  itemName: z.string().trim().min(1, "Item name is required").max(120),
  category: z.enum(itemCategories),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  imageUrl: optionalUrl,
  rewardAmount,
  contactPreference: z.enum(contactPreferences),
  status: z.enum(itemStatusValues).optional().default("SAFE"),
  brand: z.string().trim().max(120).optional().or(z.literal("")),
  modelNumber: z.string().trim().max(120).optional().or(z.literal("")),
  color: z.string().trim().max(80).optional().or(z.literal("")),
  identifyingMarks: z.string().trim().max(500).optional().or(z.literal("")),
  purchaseDate: z.coerce.date().optional().nullable(),
  estimatedValue: z.coerce.number().min(0).optional().nullable(),
  recoveryPreference: z.string().trim().max(120).optional().or(z.literal("")),
  visibility: z.enum(["PRIVATE", "PUBLIC"]).optional().default("PRIVATE"),
  emergencyContact: z.string().trim().max(120).optional().or(z.literal("")),
  lostDate: z.coerce.date().optional().nullable(),
  lastSeenLocation: z.string().trim().max(300).optional().or(z.literal("")),
  publicSearchVisible: z.boolean().optional().default(false),
  qrRecoveryEnabled: z.boolean().optional().default(true),
  imageUrls: z.array(z.string().url().refine((value) => value.startsWith("https://"))).max(5).optional().default([]),
});

export const updateItemSchema = createItemSchema.partial().extend({
  itemName: z.string().trim().min(1, "Item name is required").max(120).optional(),
  category: z.enum(itemCategories).optional(),
  contactPreference: z.enum(contactPreferences).optional(),
});

export const statusUpdateSchema = z.object({
  status: z.enum(itemStatusValues),
});

export const lostModeSchema = z.object({
  lostModeEnabled: z.boolean(),
});
