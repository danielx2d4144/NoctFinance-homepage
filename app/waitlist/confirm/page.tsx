import type { Metadata } from "next";
import Link from "next/link";
import { subscribeContact } from "../../waitlist-resend";
import { readConfirmToken } from "../../waitlist-token";

/**
 * Step two of the waitlist double opt-in: the address is added here, and only
 * here, because reaching this page requires having opened the inbox it was
 * typed into.
 *
 * A plain link rather than a form, so it works from any mail client with no
 * JavaScript. The tradeoff is that a link-scanning corporate mail gateway can
 * click it on the recipient's behalf — the standard weakness of one-click
 * confirmation, accepted here because the alternative is asking someone to
 * click twice to join a mailing list.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Confirm your waitlist signup — NoctFinance",
  // The token is in the URL. Nothing about this page belongs in an index.
  robots: { index: false, follow: false },
};

type Outcome = {
  kicker: string;
  heading: string;
  body: string;
  ok: boolean;
};

async function resolve(token: string | undefined): Promise<Outcome> {
  if (!token) {
    return {
      ok: false,
      kicker: "// LINK INCOMPLETE",
      heading: "That link is missing its token.",
      body: "Some mail clients wrap long URLs onto a second line and only link the first half. Copy the whole address from the email into your browser, or sign up again for a fresh link.",
    };
  }

  const read = readConfirmToken(token, Date.now());

  if (!read.ok) {
    if (read.reason === "expired") {
      return {
        ok: false,
        kicker: "// LINK EXPIRED",
        heading: "That link has expired.",
        body: "Confirmation links last 24 hours. Nothing was stored — sign up again and we'll send a fresh one.",
      };
    }
    if (read.reason === "unconfigured") {
      return {
        ok: false,
        kicker: "// UNAVAILABLE",
        heading: "We can't confirm signups right now.",
        body: "This one is on us, not on you. Try the link again shortly — it stays valid for 24 hours.",
      };
    }
    return {
      ok: false,
      kicker: "// LINK INVALID",
      heading: "We couldn't read that link.",
      body: "It may have been altered in transit or truncated by a mail client. Sign up again for a fresh one.",
    };
  }

  const subscribed = await subscribeContact(read.email);

  if (!subscribed.ok) {
    return {
      ok: false,
      kicker: "// TRY AGAIN",
      heading: "Something went wrong on our end.",
      body: "Your link is still good for 24 hours — open it again in a few minutes and it should go through.",
    };
  }

  return {
    ok: true,
    kicker: "// CONFIRMED",
    heading: "You're on the list.",
    body: "One email, once — when testnet goes live. No trackers, no sharing, unsubscribe in a click.",
  };
}

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const { token } = await searchParams;
  const outcome = await resolve(Array.isArray(token) ? token[0] : token);

  return (
    <main className="section closing" style={{ minHeight: "100dvh", display: "grid", alignContent: "center" }}>
      <div className="closing-panel glass">
        <p className="kicker">{outcome.kicker}</p>
        <h2>{outcome.heading}</h2>
        <p className="sub" style={{ margin: "24px auto 0" }}>
          {outcome.body}
        </p>
        <div className="cta-row center" style={{ justifyContent: "center" }}>
          <Link className="btn btn-outline" href={outcome.ok ? "/" : "/#waitlist"}>
            {outcome.ok ? "Back to the site" : "Sign up again"}
          </Link>
        </div>
      </div>
    </main>
  );
}
