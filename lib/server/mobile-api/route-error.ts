import { AuthenticationError } from "@/lib/server/auth/authentication.service";
import { reportServerError } from "@/lib/logger";
import { MobileAuthenticationError } from "./authenticate";
import { mobileError } from "./response";
import { MobileSessionError } from "./sessions";

export function mobileRouteError(context: string, error: unknown) {
  if (error instanceof AuthenticationError) {
    if (error.code === "ACCOUNT_BLOCKED") return mobileError("ACCOUNT_BLOCKED", error.message, 403);
    return mobileError("INVALID_CREDENTIALS", "The provided login details are incorrect.", 401);
  }
  if (error instanceof MobileAuthenticationError) {
    const status = error.code === "ACCOUNT_BLOCKED" ? 403 : 401;
    const message = error.code === "TOKEN_EXPIRED"
      ? "The access token has expired."
      : error.code === "SESSION_REVOKED"
        ? "This mobile session is no longer active."
        : error.code === "ACCOUNT_BLOCKED"
          ? "This account cannot authenticate."
          : "Mobile authentication is required.";
    return mobileError(error.code, message, status);
  }
  if (error instanceof MobileSessionError) {
    const code = error.code === "TOKEN_EXPIRED" ? "TOKEN_EXPIRED" : error.code;
    const status = error.code === "ACCOUNT_BLOCKED" ? 403 : 401;
    return mobileError(code, "The refresh session is invalid or no longer active.", status);
  }
  reportServerError(context, error);
  return mobileError("INTERNAL_ERROR", "The request could not be completed.", 500);
}
