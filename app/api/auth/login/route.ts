import { NextResponse } from "next/server";
import { z } from "zod";
import { comparePassword, createToken, getSessionCookieOptions, SESSION_COOKIE_NAME } from "@/lib/auth";
import { errorResponse, rateLimitResponse, validationErrorResponse } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";

const loginSchema = z.object({
  email: z.string().trim().email("Valid email is required").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: Request) {
  try {
    const rateLimit = enforceRateLimit(request, "auth-login", 8, 60 * 1000);
    if (!rateLimit.allowed) return rateLimitResponse();

    const parsed = loginSchema.safeParse(await request.json());

    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        role: true,
        isBlocked: true,
      },
    });

    if (!user) {
      return errorResponse("Invalid email or password.", 401);
    }

    if (user.isBlocked) {
      return errorResponse("Your account is blocked. Please contact support.", 403);
    }

    const passwordMatches = await comparePassword(parsed.data.password, user.passwordHash);

    if (!passwordMatches) {
      return errorResponse("Invalid email or password.", 401);
    }

    const token = await createToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());

    return response;
  } catch {
    return errorResponse("Unable to login right now.");
  }
}
