import { z } from "zod";

export const abuseReportSchema = z.object({
  reportReason: z.string().trim().min(1, "Report reason is required").max(600, "Report reason is too long"),
  reportedBy: z.string().trim().max(250).optional().transform((value) => value || undefined),
});

export type AbuseReportInput = z.infer<typeof abuseReportSchema>;
