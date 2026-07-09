import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/constants";
import { getAdminBasePath } from "@/lib/admin-path";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", `${getAdminBasePath()}/`, "/api/"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
