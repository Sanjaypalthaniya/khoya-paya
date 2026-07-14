import { z } from "zod";

const optionalText = z.string().trim().max(250).optional().transform((value) => value || undefined);

export const finderMessageSchema = z.object({
  finderName: optionalText,
  finderPhone: optionalText,
  finderEmail: z.string().trim().email("Enter a valid email address").optional().or(z.literal("")),
  finderMessage: z.string().trim().min(1, "Message is required").max(1000, "Message must be 1000 characters or less"),
  finderLocation: optionalText,
  finderPhotoUrl: z.string().trim().url("Enter a valid photo URL").optional().or(z.literal("")),
  website: z.string().optional(),
});

export type FinderMessageInput = z.infer<typeof finderMessageSchema>;
