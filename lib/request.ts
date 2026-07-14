import type { NextRequest } from "next/server";

export function getRequestIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  return request.headers.get("x-real-ip") || null;
}

export function getUserAgent(request: NextRequest) {
  return request.headers.get("user-agent") || null;
}

export function shortUserAgent(userAgent?: string | null) {
  if (!userAgent) {
    return "Unknown browser";
  }

  return userAgent.length > 96 ? `${userAgent.slice(0, 96)}...` : userAgent;
}
