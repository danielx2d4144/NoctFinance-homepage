import { ImageResponse } from "next/og";
import { BrandTile } from "./brand-tile";

// Served at /apple-icon for iOS home-screen bookmarks. Square with no corner
// radius on purpose: iOS applies its own squircle mask, and rounding first
// leaves dark slivers inside it.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<BrandTile size={size.height} radius={0} />, size);
}
