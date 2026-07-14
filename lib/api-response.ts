import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function successResponse(message: string, data: Record<string, unknown> = {}, status = 200) {
  return NextResponse.json({ success: true, message, data }, { status });
}

export function errorResponse(message: string, status = 500) {
  return NextResponse.json({ success: false, message }, { status });
}

export function unauthorizedResponse(message = "Unauthorized") {
  return errorResponse(message, 401);
}

export function forbiddenResponse(message = "Forbidden") {
  return errorResponse(message, 403);
}

export function validationErrorResponse(error: ZodError | string) {
  const message = typeof error === "string" ? error : error.issues[0]?.message ?? "Invalid request.";
  return errorResponse(message, 400);
}

export function rateLimitResponse() {
  return errorResponse("Too many requests. Please try again later.", 429);
}
