/**
 * Canonical origin for the site — the single value every SEO surface reads.
 *
 * Canonical URL, sitemap entries, robots host and the JSON-LD @ids all derive
 * from this, so they cannot drift apart and show crawlers duplicate content.
 *
 * NOTE: this must match the exact host Vercel serves without redirecting. If
 * you configure the domain so the apex 308s to www, change this to the www
 * form. Do not redeploy until the domain resolves — a canonical pointing at a
 * host that does not exist is worse than no canonical at all.
 */
export const SITE_URL = "https://noctfinance.xyz";

export const SITE_NAME = "NoctFinance";
