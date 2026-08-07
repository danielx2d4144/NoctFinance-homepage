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

/**
 * Every off-site profile the project owns, in one place.
 *
 * These are an SEO surface as much as a UI one: they populate the JSON-LD
 * `sameAs` array, which is how a search engine ties this domain to the same
 * entity on X, Discord and GitHub. Rendering them in the footer and dock while
 * declaring a different set in the structured data is worse than declaring
 * nothing, so both read from here.
 *
 * NOTE: `github` is still the pre-rebrand repo slug. GitHub 301s renamed repos
 * forever, so it keeps resolving — but update it once the repo is renamed, so
 * `sameAs` points at the entity's real canonical URL.
 */
export const SOCIAL = {
  x: "https://x.com/Noct_finance",
  discord: "https://discord.gg/6qHtgYF33m",
  github: "https://github.com/danielx2d4144/zenfinance_privacy",
} as const;

/** Bare handle, with the @ — what `twitter:site` and `twitter:creator` want. */
export const X_HANDLE = "@Noct_finance";

export const CONTACT_EMAIL = "team@noctfinance.xyz";
