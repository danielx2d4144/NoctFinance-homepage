# zenfinance — homepage

The public homepage for [zenfinance](https://github.com/danielx2d4144/zenfinance_privacy),
a privacy-preserving lending protocol.

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
