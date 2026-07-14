import { z } from "zod";

export const chatMessageSchema = z.object({
  message: z.string().trim().min(1, "Message is required").max(1000, "Message must be 1000 characters or less"),
});

export const conversationStatusSchema = z.object({
  status: z.enum(["OPEN", "CLOSED", "SPAM"]),
});
