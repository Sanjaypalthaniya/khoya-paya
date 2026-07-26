import { createSafeAuthenticatedUserDTO } from "@/lib/server/auth/authentication.service";
import { requireMobileAuthentication } from "@/lib/server/mobile-api/authenticate";
import { mobileRouteError } from "@/lib/server/mobile-api/route-error";
import { mobileSuccess } from "@/lib/server/mobile-api/response";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const auth = await requireMobileAuthentication(request);
    return mobileSuccess({ user: createSafeAuthenticatedUserDTO(auth.user), sessionId: auth.session.id });
  } catch (error) {
    return mobileRouteError("mobile.auth.me", error);
  }
}
