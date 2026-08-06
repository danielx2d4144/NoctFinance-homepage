import type { MetadataRoute } from "next";
import { SITE_URL } from "./site";

/**
 * Served at /sitemap.xml. One entry, because the site is one page — the nav
 * links are in-page anchors, not routes, and listing them would just be noise
 * a crawler discards. Add entries here as real routes appear.
 *
 * lastModified resolves at build time, so redeploying refreshes it.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
