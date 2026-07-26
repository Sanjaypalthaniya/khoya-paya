import { enforceRateLimit } from "@/lib/rate-limit";
import { mobileRouteError } from "@/lib/server/mobile-api/route-error";
import { mobileError, mobileSuccess, mobileValidationError } from "@/lib/server/mobile-api/response";
import { rotateMobileSession } from "@/lib/server/mobile-api/sessions";
import { mobileRefreshSchema } from "@/lib/server/mobile-api/validation";

export async function POST(request: Request) {
  if (!enforceRateLimit(request, "mobile-refresh", 20, 60_000).allowed) {
    return mobileError("RATE_LIMITED", "Too many refresh attempts. Try again shortly.", 429);
  }
  try {
    const parsed = mobileRefreshSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return mobileValidationError(parsed.error);
    return mobileSuccess(await rotateMobileSession(parsed.data.refreshToken, parsed.data.deviceId));
  } catch (error) {
    return mobileRouteError("mobile.auth.refresh", error);
  }
}
