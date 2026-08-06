# NoctFinance — homepage

The public homepage for NoctFinance, a privacy-preserving lending protocol.
The protocol itself lives in a [separate repo](https://github.com/danielx2d4144/zenfinance_privacy)
— still under its pre-rebrand slug; GitHub will redirect it once renamed.

- **Stack:** Next.js (App Router, SSR) + hand-rolled CSS/JS — zero runtime dependencies
  beyond React. Fully server-rendered for SEO; all animation is a client-side
  enhancement that respects `prefers-reduced-motion` and degrades gracefully without JS.
- **Design system:** "Signal / Noise" — graphite monochrome, one surgical cyan→lime
  gradient, engineering grid, mono/terminal credibility.
- **Deploy:** Vercel. Import this repo, framework preset **Next.js**. One env var
  is required for the waitlist to store anything — see below.

## Local dev

```bash
npm install
npm run dev   # http://localhost:3000
```

## Canonical domain

`app/site.ts` holds the one origin every SEO surface derives from — the canonical
tag, `sitemap.xml`, the `robots.txt` host, and the JSON-LD `@id`s. Change it there
and nowhere else. It must match the host Vercel serves **without** redirecting.

## Waitlist

The signup form is a Server Action (`app/waitlist-action.ts`) that POSTs to
Resend's `/contacts` endpoint. Set one variable in Vercel → Settings →
Environment Variables, for all three environments, then **redeploy** — Vercel
does not apply new variables to an existing build:

| Variable | Source |
| --- | --- |
| `RESEND_API_KEY` | Resend → API keys → Create API Key, **Full access** |

No `NEXT_PUBLIC_` prefix. That prefix inlines the value into the client bundle,
and this key can read and write your whole contact list.

Sending-only keys cannot write contacts, so the form will fail with a 401 if you
create one of those. Without the variable set at all, the form degrades to a
polite "temporarily unavailable" and logs the reason server-side rather than
silently discarding the address.

Contacts land in the single global list under **Audience**. Resend retired the
old per-audience endpoints; there is no audience ID to configure. Use a
**Segment** if you later need to separate waitlist signups from other sources.

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
