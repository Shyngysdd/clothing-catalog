import type { MetadataRoute } from "next";
import { getAppUrl } from "@/lib/email-verification";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getAppUrl();
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/ru/account", "/en/account", "/kz/account"] }],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
