# NoctFinance — homepage

The public homepage for NoctFinance, a privacy-preserving lending protocol.
The protocol itself lives in a [separate repo](https://github.com/danielx2d4144/zenfinance_privacy)
— still under its pre-rebrand slug; GitHub will redirect it once renamed.

- **Stack:** Next.js (App Router, SSR) + hand-rolled CSS/JS — zero runtime dependencies
  beyond React. Fully server-rendered for SEO; all animation is a client-side
  enhancement that respects `prefers-reduced-motion` and degrades gracefully without JS.
- **Design system:** "Signal / Noise" — graphite monochrome, one surgical cyan→lime
  gradient, engineering grid, mono/terminal credibility.
- **Deploy:** Vercel. Import this repo, framework preset **Next.js**, no env vars needed.

## Local dev

```bash
npm install
npm run dev   # http://localhost:3000
```

## Canonical domain

`app/site.ts` holds the one origin every SEO surface derives from — the canonical
tag, `sitemap.xml`, the `robots.txt` host, and the JSON-LD `@id`s. Change it there
and nowhere else. It must match the host Vercel serves **without** redirecting.

## Search-engine verification

Optional; each tag is omitted entirely when its variable is unset. Set these in
Vercel → Settings → Environment Variables, then redeploy:

| Variable | Source |
| --- | --- |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Google Search Console → HTML tag method |
| `NEXT_PUBLIC_BING_SITE_VERIFICATION` | Bing Webmaster Tools → meta tag method |
| `NEXT_PUBLIC_YANDEX_VERIFICATION` | Yandex Webmaster → meta tag method |

A Search Console **Domain property** (DNS TXT) is preferable to the meta tag —
it covers every subdomain and both protocols at once.
