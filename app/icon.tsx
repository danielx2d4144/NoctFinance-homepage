import { ImageResponse } from "next/og";
import { BrandTile } from "./brand-tile";

// Next serves this at /icon and wires the <link rel="icon"> automatically.
// That only works while `metadata.icons` stays unset in layout.tsx — an
// explicit icons entry overrides this file convention silently.
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<BrandTile size={size.height} radius={14} />, size);
}
