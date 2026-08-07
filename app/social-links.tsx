import { SOCIAL } from "./site";
import { DiscordIcon, XIcon } from "./social-icons";

/**
 * The community channels, declared once and rendered in two places — the footer
 * row (here) and the fixed dock (`social-dock.tsx`). Keeping the list in one
 * export is what stops the two surfaces drifting apart when a channel is added.
 */
export const SOCIAL_LINKS = [
  { href: SOCIAL.x, label: "NoctFinance on X", Icon: XIcon },
  { href: SOCIAL.discord, label: "NoctFinance on Discord", Icon: DiscordIcon },
] as const;

/**
 * Footer row of glass icon buttons.
 *
 * Each button is its own `.glass` surface, which is safe here because the
 * footer itself is not one — a backdrop-filter nested inside another backdrop
 * root has nothing to sample and renders flat. The dock, whose container *is*
 * glass, deliberately does not do this.
 *
 * `aria-label` is load-bearing: the icons are `aria-hidden`, so without it
 * these anchors would have no accessible name at all.
 */
export function SocialLinks() {
  return (
    <div className="social-row">
      {SOCIAL_LINKS.map(({ href, label, Icon }) => (
        <a
          key={href}
          className="social-btn glass glass-clear"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
        >
          <Icon />
        </a>
      ))}
    </div>
  );
}
