import { z } from "zod";
export const communitySearchSchema=z.object({q:z.string().trim().min(1).max(120),limit:z.coerce.number().int().min(1).max(50).default(20),cursor:z.string().cuid().optional(),city:z.string().trim().max(80).optional(),state:z.string().trim().max(80).optional(),category:z.string().trim().max(40).optional(),postType:z.string().trim().max(40).optional()});
