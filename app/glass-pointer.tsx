"use client";

import { useEffect } from "react";

/**
 * Feeds pointer position into `--gx` / `--gy` on every `.glass-react` surface,
 * which the specular hotspot in globals.css reads.
 *
 * Pure enhancement: without it the hotspot sits at its default and the glass is
 * simply static. Disabled entirely under prefers-reduced-motion, matching the
 * rest of the page's motion policy.
 */
export function GlassPointer() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const surfaces = Array.from(
      document.querySelectorAll<HTMLElement>(".glass-react"),
    );
    const cleanups = surfaces.map((el) => {
      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty(
          "--gx",
          (((e.clientX - r.left) / r.width) * 100).toFixed(1) + "%",
        );
        el.style.setProperty(
          "--gy",
          (((e.clientY - r.top) / r.height) * 100).toFixed(1) + "%",
        );
      };
      el.addEventListener("pointermove", onMove);
      return () => el.removeEventListener("pointermove", onMove);
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
