import { enforceRateLimit } from "@/lib/rate-limit";
import { requireMobileAuthentication } from "@/lib/server/mobile-api/authenticate";
import { mobileRouteError } from "@/lib/server/mobile-api/route-error";
import { mobileError, mobileSuccess } from "@/lib/server/mobile-api/response";
import { logMobileSecurityEvent } from "@/lib/server/mobile-api/security-log";
import { revokeAllMobileSessions } from "@/lib/server/mobile-api/sessions";

export async function POST(request: Request) {
  if (!enforceRateLimit(request, "mobile-logout-all", 5, 60_000).allowed) {
    return mobileError("RATE_LIMITED", "Too many requests. Try again shortly.", 429);
  }
  try {
    const auth = await requireMobileAuthentication(request);
    const revokedSessions = await revokeAllMobileSessions(auth.user.id);
    logMobileSecurityEvent("logout_all", { userId: auth.user.id, revokedSessions });
    return mobileSuccess({ revokedSessions });
  } catch (error) {
    return mobileRouteError("mobile.auth.logout-all", error);
  }
}
