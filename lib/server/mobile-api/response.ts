import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type MobileErrorCode =
  | "VALIDATION_ERROR" | "INVALID_CREDENTIALS" | "AUTHENTICATION_REQUIRED"
  | "TOKEN_EXPIRED" | "REFRESH_TOKEN_INVALID" | "SESSION_REVOKED"
  | "ACCOUNT_BLOCKED" | "ACCOUNT_SUSPENDED" | "FORBIDDEN"
  | "RATE_LIMITED" | "NOT_FOUND" | "INTERNAL_ERROR";

export function mobileSuccess(data: unknown, meta: Record<string, unknown> = {}, status = 200) {
  return NextResponse.json({ success: true, data, meta }, { status });
}

export function mobileError(code: MobileErrorCode, message: string, status: number, fieldErrors: Record<string, string[]> = {}) {
  return NextResponse.json({ success: false, error: { code, message, fieldErrors } }, { status });
}

export function mobileValidationError(error: ZodError) {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "request";
    fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
  }
  return mobileError("VALIDATION_ERROR", "Check the submitted fields and try again.", 400, fieldErrors);
}
