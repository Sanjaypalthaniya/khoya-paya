import { NextResponse } from "next/server";
import { z } from "zod";
import { createToken, getSessionCookieOptions, SESSION_COOKIE_NAME } from "@/lib/auth";
import { errorResponse, rateLimitResponse, validationErrorResponse } from "@/lib/api-response";
import { enforceRateLimit } from "@/lib/rate-limit";
import {
  AuthenticationError,
  recordSuccessfulLogin,
  verifyUserCredentials,
} from "@/lib/server/auth/authentication.service";

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

    const user = await verifyUserCredentials(parsed.data.email, parsed.data.password);

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
    void recordSuccessfulLogin(user.id).catch(() => undefined);

    return response;
  } catch (error) {
    if (error instanceof AuthenticationError) {
      if (error.code === "ACCOUNT_BLOCKED") return errorResponse(error.message, 403);
      return errorResponse("Invalid email or password.", 401);
    }
    return errorResponse("Unable to login right now.");
  }
}
