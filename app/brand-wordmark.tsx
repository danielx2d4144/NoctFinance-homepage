/**
 * The NoctFinance wordmark, replacing what used to be a text node in the nav.
 *
 * Served from `public/` as a pre-trimmed PNG. The original in `app/logo/` is
 * 512x210 but only 434x80 of that is artwork — the rest is transparent padding,
 * which would have rendered the visible letterforms at roughly a third of their
 * intended height for any given CSS height. `public/noctfinance-wordmark.png`
 * is that file cropped to its alpha bounding box; see the README.
 *
 * A plain `<img>`, not `next/image`: this is a fixed-size, above-the-fold, 13KB
 * asset, and the project ships no `next.config` and no other `next/image` use.
 * The intrinsic `width`/`height` are what actually matter here — they let the
 * browser reserve the box before the PNG lands, so the nav does not reflow.
 *
 * `alt=""` is correct rather than lazy: the anchor wrapping this carries the
 * accessible name, and a second one here would announce the brand twice.
 */
export function BrandWordmark() {
  return (
    <img
      className="wordmark-img"
      src="/noctfinance-wordmark.png"
      width={434}
      height={80}
      alt=""
      decoding="async"
    />
  );
}
