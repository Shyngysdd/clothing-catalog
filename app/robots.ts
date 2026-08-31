import type { MetadataRoute } from "next";
import { getAppUrl } from "@/lib/email-verification";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getAppUrl();
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/account"] }],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
