import { mobileSuccess } from "@/lib/server/mobile-api/response";

export const dynamic = "force-dynamic";

export async function GET() {
  return mobileSuccess({
    apiVersion: "v1",
    status: "available",
    minimumSupportedAppVersion: process.env.MOBILE_MINIMUM_APP_VERSION ?? "0.1.0",
    latestAppVersion: process.env.MOBILE_LATEST_APP_VERSION ?? "0.1.0",
    maintenance: false,
  });
}
