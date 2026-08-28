import type { MetadataRoute } from "next";

function getSiteUrl() {
  const host = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return host ? (host.startsWith("http") ? host : `https://${host}`) : "http://localhost:3000";
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: getSiteUrl(),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
