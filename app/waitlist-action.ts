"use server";

/**
 * Waitlist signup — step one of two.
 *
 * Runs as a Server Action so the form submits without JavaScript — the page
 * already promises to work JS-disabled, and a signup form is exactly the thing
 * that must not quietly break for someone with a locked-down browser. That
 * matters more than usual here: the people most interested in a privacy
 * protocol are the most likely to be blocking scripts.
 *
 * This step deliberately does *not* touch the contact list. A form POST proves
 * only that someone typed an address; it does not prove they own it. So all
 * this does is send a signed confirmation link, and the address is added when
 * that link is clicked (see app/waitlist/confirm/page.tsx). Two useful
 * consequences beyond consent: nobody can use the form to sign someone else
 * up, and the response is identical whether or not the address is already on
 * the list, so the endpoint cannot be used to test who has signed up.
 */

import { headers } from "next/headers";
import { SITE_URL } from "./site";
import { withinLimit } from "./waitlist-rate-limit";
import { sendConfirmationEmail } from "./waitlist-resend";
import { mintConfirmToken } from "./waitlist-token";
import { EMAIL_MAX, EMAIL_RE, type WaitlistState } from "./waitlist-state";

/** Per requester. Generous for a human, tedious for a script. */
const MAX_PER_IP = 5;

/**
 * Per address, across all requesters. Lower, because this is the limit that
 * stops the form being used to mail-bomb one person from many IPs — the send
 * comes from our verified domain, so that would be our reputation burning.
 */
const MAX_PER_EMAIL = 3;

const CHECK_INBOX = "Almost there — check your inbox for a confirmation link.";

/**
 * Where the confirmation link points.
 *
 * Never derived from request headers. The origin is embedded in an email sent
 * from our verified domain, so honouring a spoofed Host header would turn the
 * signup form into a phishing relay with our DKIM signature on it.
 */
function confirmOrigin(): string {
  const override = process.env.WAITLIST_ORIGIN;
  if (override) return override.replace(/\/+$/, "");
  if (process.env.VERCEL_ENV === "production") return SITE_URL;
  // Preview deploys confirm against themselves rather than production.
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.NODE_ENV !== "production") return "http://localhost:3000";
  return SITE_URL;
}

async function requesterKey(): Promise<string> {
  const h = await headers();
  // Vercel sets x-forwarded-for; the left-most entry is the client. Behind a
  // different proxy this may be spoofable, which is one more reason the
  // per-address limit exists as a second line.
  const fwd = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return fwd || h.get("x-real-ip") || "unknown";
}

export async function joinWaitlist(
  _prev: WaitlistState,
  formData: FormData,
): Promise<WaitlistState> {
  // Honeypot: a field hidden from humans that bots fill in anyway. Return the
  // ordinary success message so the bot has no signal to adapt against.
  if (formData.get("company")) {
    return { status: "ok", message: CHECK_INBOX };
  }

  // Keep the visitor's original casing to hand back on failure — correcting a
  // typo in what you typed is a different experience from retyping a string
  // the server has silently rewritten.
  const typed = String(formData.get("email") ?? "").trim();
  const email = typed.toLowerCase();

  if (!email) {
    return { status: "error", message: "Enter an email address." };
  }
  if (email.length > EMAIL_MAX || !EMAIL_RE.test(email)) {
    return {
      status: "error",
      message: "That doesn't look like an email address.",
      email: typed,
    };
  }

  const now = Date.now();
  const tooMany = {
    status: "error" as const,
    message: "Too many attempts. Try again in a few minutes.",
    email: typed,
  };

  // Requester first, so a rejected flood never spends the address's budget and
  // locks its real owner out of signing up.
  if (!withinLimit(`ip:${await requesterKey()}`, MAX_PER_IP, now)) return tooMany;
  if (!withinLimit(`email:${email}`, MAX_PER_EMAIL, now)) return tooMany;

  const token = mintConfirmToken(email, now);
  const unavailable = {
    status: "error" as const,
    message: "Signups are temporarily unavailable. Try again shortly.",
    email: typed,
  };

  // Misconfiguration is ours, not the visitor's. The helpers log the specifics;
  // nobody who just wanted to leave their email should read a stack trace.
  if (!token) return unavailable;

  const url = `${confirmOrigin()}/waitlist/confirm?token=${encodeURIComponent(token)}`;
  const sent = await sendConfirmationEmail(email, url);

  if (!sent.ok) {
    switch (sent.reason) {
      case "unconfigured":
      case "auth":
        return unavailable;
      case "timeout":
      case "network":
        return {
          status: "error",
          message: "Couldn't reach the signup service. Try again shortly.",
          email: typed,
        };
      default:
        return {
          status: "error",
          message: "Something went wrong on our end. Try again shortly.",
          email: typed,
        };
    }
  }

  return { status: "ok", message: CHECK_INBOX };
}
