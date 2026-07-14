import { z } from "zod";
import { errorResponse, rateLimitResponse, successResponse, validationErrorResponse } from "@/lib/api-response";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";

const signupSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    email: z.string().trim().email("Valid email is required").toLowerCase(),
    phone: z.string().trim().optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function POST(request: Request) {
  try {
    const rateLimit = enforceRateLimit(request, "auth-signup", 5, 60 * 1000);
    if (!rateLimit.allowed) return rateLimitResponse();

    const parsed = signupSchema.safeParse(await request.json());

    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true },
    });

    if (existingUser) {
      return errorResponse("An account with this email already exists.", 409);
    }

    const passwordHash = await hashPassword(parsed.data.password);

    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        passwordHash,
        role: "USER",
        isBlocked: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
      },
    });

    return successResponse("Account created successfully.", { user }, 201);
  } catch {
    return errorResponse("Unable to create account right now.");
  }
}
