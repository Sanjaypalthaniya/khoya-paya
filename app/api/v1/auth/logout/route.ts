import { MobileAuthenticationError } from "@/lib/server/mobile-api/authenticate";
import { mobileRouteError } from "@/lib/server/mobile-api/route-error";
import { mobileSuccess } from "@/lib/server/mobile-api/response";
import { logMobileSecurityEvent } from "@/lib/server/mobile-api/security-log";
import { revokeMobileSession } from "@/lib/server/mobile-api/sessions";
import { MobileTokenError, verifyMobileAccessToken } from "@/lib/server/mobile-api/tokens";

function readBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    throw new MobileAuthenticationError("AUTHENTICATION_REQUIRED");
  }
  return authorization.slice("Bearer ".length).trim();
}

export async function POST(request: Request) {
  try {
    let claims;
    try {
      claims = await verifyMobileAccessToken(readBearerToken(request));
    } catch (error) {
      if (error instanceof MobileTokenError) throw new MobileAuthenticationError(error.code);
      throw error;
    }
    await revokeMobileSession(claims.sessionId, claims.userId);
    logMobileSecurityEvent("session_revoked", { userId: claims.userId, sessionId: claims.sessionId });
    return mobileSuccess({ revoked: true });
  } catch (error) {
    return mobileRouteError("mobile.auth.logout", error);
  }
}
