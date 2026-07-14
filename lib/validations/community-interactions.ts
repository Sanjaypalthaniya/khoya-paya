import { z } from "zod";
export const reactionSchema=z.object({reactionType:z.enum(["LIKE","HELPFUL","HOPE","FOUND_IT","CELEBRATE"])});
export const commentSchema=z.object({content:z.string().trim().min(1).max(2000),parentId:z.string().cuid().optional()});
