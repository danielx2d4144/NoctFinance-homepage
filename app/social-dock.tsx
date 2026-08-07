import { SOCIAL_LINKS } from "./social-links";

/**
 * Community dock — a glass pill pinned to the bottom-right corner, so X and
 * Discord stay one click away without the visitor having to reach the footer.
 *
 * Two structural decisions worth keeping:
 *
 * 1. The container is the only `.glass` element; the buttons inside are plain.
 *    Nesting a backdrop-filter inside another backdrop root gives the inner one
 *    nothing to sample, which is the same trap `.nav-menu-panel` works around
 *    by going near-opaque. One glass surface, transparent children.
 *
 * 2. It sits at z-index 45 — deliberately *below* the sticky nav (50) and its
 *    mobile dropdown (60), so an open menu always wins the corner.
 *
 * Mounted from `page.tsx` rather than the layout, alongside `Interactions` and
 * `GlassPointer`, which keeps it off `/waitlist/confirm`.
 */
export function SocialDock() {
  return (
    <aside className="social-dock glass" aria-label="Community links">
      {SOCIAL_LINKS.map(({ href, label, Icon }) => (
        <a
          key={href}
          className="dock-btn"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
        >
          <Icon />
        </a>
      ))}
    </aside>
  );
}
