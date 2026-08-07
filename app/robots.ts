import type { MetadataRoute } from "next";
import { SITE_URL } from "./site";

/**
 * Served at /robots.txt. Allows every crawler, and — more importantly — points
 * them at the sitemap, which is how Bing and Yandex discover pages without a
 * manual submission.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Confirmation links carry a signed token in the query string. The page
        // is noindex anyway; this keeps crawlers from requesting it at all.
        disallow: "/waitlist/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    // Non-standard, honoured by Yandex: declares which mirror is canonical.
    host: SITE_URL,
  };
}
