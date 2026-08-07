import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Shared artwork for the generated icons (`icon.tsx`, `apple-icon.tsx`).
 *
 * The brand mark is white on transparent, which is right for this site and
 * wrong for a browser tab: a light-mode tab strip or an iOS home screen would
 * render it as blank space. So it is composited onto the site's own background
 * here rather than shipped raw.
 *
 * The PNG is inlined as a data URI because Satori cannot fetch a relative path
 * — it needs the bytes. `readFileSync` at module scope runs once, at build
 * time, since both icon routes are statically generated.
 */
const markSrc = `data:image/png;base64,${readFileSync(
  join(process.cwd(), "public", "noctfinance-mark.png"),
).toString("base64")}`;

/** Trimmed intrinsic size of the mark — used to keep the scaling proportional. */
const MARK_RATIO = 300 / 342;

export function BrandTile({
  size,
  radius,
  fill = 0.62,
}: {
  size: number;
  /** 0 for Apple, which applies its own corner mask. */
  radius: number;
  /** Share of the tile height the mark occupies. */
  fill?: number;
}) {
  const markHeight = Math.round(size * fill);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius,
        background: "#0a0a0b",
        backgroundImage:
          "radial-gradient(100% 100% at 30% 0%, rgba(34,211,238,0.22), transparent 70%)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={markSrc}
        alt=""
        width={Math.round(markHeight * MARK_RATIO)}
        height={markHeight}
      />
    </div>
  );
}
