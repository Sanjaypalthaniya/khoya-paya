import { z } from "zod";
import { itemCategories } from "@/lib/validations/item";

const optionalText = (max = 200) => z.string().trim().max(max).optional().or(z.literal(""));
const optionalUrl = z.string().trim().url().refine((url) => url.startsWith("https://"), "Secure HTTPS URL required").optional().or(z.literal(""));
export const foundReportSchema = z.object({ recoveryCode: optionalText(24), category: z.enum(itemCategories), brand: optionalText(), modelNumber: optionalText(), color: optionalText(), identifyingMarks: optionalText(500), description: z.string().trim().min(10).max(2000), foundLocation: z.string().trim().min(2).max(300), foundDate: z.coerce.date(), photoUrl: optionalUrl, imageUrls: z.array(z.string().trim().url().refine((url) => url.startsWith("https://"))).max(5).optional().default([]), finderName: optionalText(120), finderPhone: optionalText(30), finderWhatsapp: optionalText(30), finderEmail: z.string().trim().email().optional().or(z.literal("")), message: z.string().trim().min(2).max(2000) });
export const recoverySearchSchema = z.object({ recoveryCode: z.string().trim().min(4).max(24) });
export const verificationQuestionsSchema = z.object({ questions: z.array(z.string().trim().min(3).max(300)).min(1).max(10) });
export const verificationAnswersSchema = z.object({ answers: z.array(z.object({ questionId: z.string().cuid(), answer: z.string().trim().min(1).max(1000) })).min(1).max(10) });
export const recoveryStatusSchema = z.object({ status: z.enum(["LOST","OWNER_NOTIFIED","CHAT_STARTED","VERIFYING_OWNERSHIP","MEETING_SCHEDULED","RETURNED","COMPLETED","STILL_MISSING","FALSE_REPORT","CANCELLED"]), scheduledMeetingLocation: optionalText(300), scheduledMeetingTime: z.coerce.date().optional() });
