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

## Brand assets and links

Source artwork lives in `app/logo/` — untouched exports, never served. Next does
not serve static files out of `app/`, and both files are mostly transparent
padding: the wordmark is 434×80 of art inside a 512×210 box, so using it raw at
`height: 22px` would render the letterforms about 9px tall.

What ships is the trimmed derivative in `public/`:

| Served | From | Size |
| --- | --- | --- |
| `public/noctfinance-wordmark.png` | `app/logo/noctfinance_logo_nobd.png.png` | 434×80 |
| `public/noctfinance-mark.png` | `app/logo/noctfinance_favicon.png` | 300×342 |

Regenerate after replacing a source file by cropping to the **alpha** bounding
box — not `sharp.trim()`, which keys off luminance and will eat a white-on-
transparent mark. Read the raw RGBA buffer, scan for `alpha > 8` to find
min/max x and y, then `sharp(src).extract({...}).png()`. `sharp` is already
present as a Next transitive dependency; this is a one-off manual step, not a
build step, which is why the outputs are committed.

The favicon and Apple touch icon are generated from `public/noctfinance-mark.png`
at build time by `app/icon.tsx` and `app/apple-icon.tsx`, both rendering the
shared `app/brand-tile.tsx`. The mark is white on transparent and would be
invisible in a light-mode tab strip, so the tile bakes in the dark background.
**`metadata.icons` must stay absent from `app/layout.tsx`** — setting it silently
overrides the `app/icon.*` file convention and these never ship.

Outbound links have one source: `SOCIAL`, `X_HANDLE`, and `CONTACT_EMAIL` in
`app/site.ts`. They feed the footer row, the fixed dock, the JSON-LD `sameAs`,
and the `twitter:site` / `twitter:creator` tags. Change a URL there and nowhere
else.

## Waitlist

Double opt-in, in two steps:

1. `app/waitlist-action.ts` — a Server Action. Validates, rate-limits, and mails
   an HMAC-signed confirmation link. **Does not touch the contact list.**
2. `app/waitlist/confirm/page.tsx` — verifies the token and POSTs to Resend's
   `/contacts`.

A form POST proves someone typed an address, not that they own it. Splitting it
means nobody can sign someone else up, and the form's response is identical
whether or not an address is already subscribed — so it can't be used to test
who has signed up.

### Environment variables

| Variable | Required | Source |
| --- | --- | --- |
| `RESEND_API_KEY` | yes | Resend → API keys → Create API Key, **Full access** |
| `WAITLIST_FROM` | yes | A sender on a domain you've verified in Resend, e.g. `NoctFinance <hello@noctfinance.xyz>` |
| `WAITLIST_TOKEN_SECRET` | recommended | Any high-entropy string: `openssl rand -base64 32` |
| `WAITLIST_ORIGIN` | no | Overrides the origin in confirmation links. Only needed off Vercel |

`WAITLIST_TOKEN_SECRET` is optional because the signing key otherwise derives
from `RESEND_API_KEY`. Set it anyway: without it, rotating the Resend key
silently invalidates every confirmation link nobody has clicked yet.

No `NEXT_PUBLIC_` prefix on any of these. That prefix inlines the value into the
client bundle, where both the API key and the token secret would be readable by
anyone who views source.

**Use a separate key per environment.** Preview deploys get a public URL on
every branch and push, and Development means the key lands in a `.env` file on
a laptop. A Full-access key can read and write your entire contact list, so
issuing one key and pasting it into all three scopes means a preview build — or
a stolen laptop — reaches production data.

The safe setup: create a key per environment in Resend, then in Vercel →
Settings → Environment Variables add each one scoped to a single environment.
**Redeploy after** — Vercel does not apply new variables to an existing build.

Leaving Preview and Development unset is also fine, and is the better default
if you aren't testing signup: the form degrades to a polite "temporarily
unavailable" and logs the reason server-side rather than silently discarding
the address. Sending-only keys can send the confirmation but cannot write
contacts, so confirmation will 401 — use Full access.

For local dev, put the values in `.env.local` (already gitignored). Confirmation
links point at `http://localhost:3000` automatically; preview deploys point at
themselves. The origin is never read from request headers, because it goes into
an email signed by your domain and a spoofed `Host` would make the form a
phishing relay.

### Abuse controls

`app/waitlist-rate-limit.ts` caps signups at 5 per IP and 3 per address per ten
minutes, plus a honeypot field on the form. The counters are **process-local** —
each serverless instance has its own, so the real ceiling scales with how many
are warm. That stops a loop from one host, which is the cheap attack; a
determined distributed one needs a shared store (Vercel KV, Upstash) wired into
`withinLimit`.

### Contacts

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
