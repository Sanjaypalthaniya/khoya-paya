import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifyToken } from "@/lib/auth-token";

export async function proxy(request: NextRequest) {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    const origin = request.headers.get("origin");
    const requestHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    let originHost: string | null = null;

    if (origin) {
      try {
        originHost = new URL(origin).host;
      } catch {
        return NextResponse.json({ success: false, message: "Invalid request origin." }, { status: 403 });
      }
    }

    if (originHost && requestHost && originHost !== requestHost) {
      return NextResponse.json({ success: false, message: "Invalid request origin." }, { status: 403 });
    }
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const loginUrl = new URL("/login", request.url);

  if (!token) {
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const payload = await verifyToken(token);

    if (request.nextUrl.pathname.startsWith("/admin") && payload.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set(SESSION_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/api/:path*"],
};
