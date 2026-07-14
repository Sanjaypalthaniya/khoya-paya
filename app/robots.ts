import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/about", "/how-it-works", "/pricing", "/contact", "/faq", "/privacy-policy", "/terms-and-conditions", "/found/"],
        disallow: ["/dashboard/", "/admin/", "/api/"],
      },
    ],
    sitemap: `${baseUrl.replace(/\/$/, "")}/sitemap.xml`,
  };
}
