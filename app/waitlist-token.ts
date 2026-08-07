/**
 * Stateless confirmation tokens for waitlist double opt-in.
 *
 * A signup POST proves only that someone typed an address into a form — not
 * that they own it. Anyone could subscribe anyone. So the address is not added
 * to the contact list until the person holding the inbox clicks a link, and
 * that link carries an HMAC-signed token rather than a database row: there is
 * no database here, and a signature is the cheapest way to know we minted the
 * token ourselves.
 *
 * Being stateless means a token is replayable until it expires. The only thing
 * replaying it does is re-add a contact who already confirmed, so the cost of
 * that is nil, and it buys us not having to run a store just for pending
 * signups.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

/** Long enough to survive a weekend in an unread inbox, short enough to matter. */
const TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Mixed into the derived key so a signature minted here can never be mistaken
 * for one minted by some other feature that happens to share the secret.
 */
const PURPOSE = "noctfinance/waitlist-confirm/v1";

export type TokenResult =
  | { ok: true; email: string }
  | { ok: false; reason: "invalid" | "expired" | "unconfigured" };

/**
 * Prefers a dedicated secret. Falls back to a key *derived* from the Resend
 * key rather than the Resend key itself — the raw key never signs anything, so
 * a token cannot leak material that talks to Resend.
 *
 * The fallback exists so the waitlist works with one environment variable, but
 * it ties token lifetime to key rotation: rotating RESEND_API_KEY invalidates
 * every unclicked confirmation link. Set WAITLIST_TOKEN_SECRET to decouple them.
 */
function signingKey(): Buffer | null {
  const explicit = process.env.WAITLIST_TOKEN_SECRET;
  if (explicit) return createHmac("sha256", explicit).update(PURPOSE).digest();

  const derived = process.env.RESEND_API_KEY;
  if (derived) return createHmac("sha256", derived).update(PURPOSE).digest();

  return null;
}

function sign(payload: string, key: Buffer): string {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

/** Returns null when no secret is configured — the caller reports that as an outage. */
export function mintConfirmToken(email: string, now: number): string | null {
  const key = signingKey();
  if (!key) return null;

  // base64url keeps the address out of the URL's reserved character set and
  // out of the plain text of anything that logs the query string.
  const payload = `${now + TTL_MS}.${Buffer.from(email, "utf8").toString("base64url")}`;
  return `${payload}.${sign(payload, key)}`;
}

export function readConfirmToken(token: string, now: number): TokenResult {
  const key = signingKey();
  if (!key) return { ok: false, reason: "unconfigured" };

  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false, reason: "invalid" };

  const [expRaw, emailRaw, sig] = parts;
  const expected = sign(`${expRaw}.${emailRaw}`, key);

  // Compare in constant time. Both sides are fixed-length base64url of a
  // SHA-256 digest, but length-check first anyway: timingSafeEqual throws on
  // a mismatch rather than returning false.
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, reason: "invalid" };
  }

  const exp = Number(expRaw);
  if (!Number.isFinite(exp)) return { ok: false, reason: "invalid" };
  if (now > exp) return { ok: false, reason: "expired" };

  const email = Buffer.from(emailRaw, "base64url").toString("utf8");
  if (!email) return { ok: false, reason: "invalid" };

  return { ok: true, email };
}
