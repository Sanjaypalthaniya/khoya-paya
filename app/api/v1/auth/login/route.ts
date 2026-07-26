import { enforceRateLimit } from "@/lib/rate-limit";
import {
  createSafeAuthenticatedUserDTO,
  recordSuccessfulLogin,
  verifyUserCredentials,
} from "@/lib/server/auth/authentication.service";
import { mobileRouteError } from "@/lib/server/mobile-api/route-error";
import { mobileError, mobileSuccess, mobileValidationError } from "@/lib/server/mobile-api/response";
import { logMobileSecurityEvent } from "@/lib/server/mobile-api/security-log";
import { createMobileSession } from "@/lib/server/mobile-api/sessions";
import { mobileLoginSchema } from "@/lib/server/mobile-api/validation";

export async function POST(request: Request) {
  if (!enforceRateLimit(request, "mobile-login", 5, 60_000).allowed) {
    return mobileError("RATE_LIMITED", "Too many login attempts. Try again shortly.", 429);
  }
  try {
    const parsed = mobileLoginSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return mobileValidationError(parsed.error);
    const user = await verifyUserCredentials(parsed.data.identifier, parsed.data.password);
    const tokens = await createMobileSession(user, parsed.data.device);
    await recordSuccessfulLogin(user.id);
    logMobileSecurityEvent("login_success", { userId: user.id, sessionId: tokens.sessionId, platform: parsed.data.device.platform });
    return mobileSuccess({ user: createSafeAuthenticatedUserDTO(user), ...tokens }, {}, 201);
  } catch (error) {
    logMobileSecurityEvent("login_failure");
    return mobileRouteError("mobile.auth.login", error);
  }
}
