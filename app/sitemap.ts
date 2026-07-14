import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const routes = ["", "/about", "/how-it-works", "/pricing", "/contact", "/faq", "/privacy-policy", "/terms-and-conditions"];

  return routes.map((route) => ({
    url: `${baseUrl.replace(/\/$/, "")}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
