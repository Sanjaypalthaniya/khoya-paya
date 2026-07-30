const contentSecurityPolicy = ["default-src 'self'", "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com", "style-src 'self' 'unsafe-inline'", "img-src 'self' data: blob: https://res.cloudinary.com", "media-src 'self' blob: https://res.cloudinary.com", "connect-src 'self' https://api.razorpay.com https://*.razorpay.com https://res.cloudinary.com", "frame-src https://api.razorpay.com https://*.razorpay.com", "object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'"].join("; ");
const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  ...(process.env.NODE_ENV === "production" ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }] : []),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: ["10.224.72.218", "172.19.95.218"],
  turbopack: { root: process.cwd() },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
