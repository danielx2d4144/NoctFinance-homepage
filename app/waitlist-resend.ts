/**
 * Every outbound call to Resend, in one place.
 *
 * Both callers — the signup action and the confirmation page — run inside a
 * serverless function with a hard wall-clock limit. A request with no deadline
 * of its own inherits that limit, so one slow upstream turns into a request
 * that holds an instance open until the platform kills it and the visitor sees
 * a generic 504 instead of a sentence we wrote. Hence the explicit timeout.
 */

import { CONTACT_EMAIL, SITE_URL, SOCIAL } from "./site";

/** Comfortably above Resend's normal latency, well under any platform limit. */
const TIMEOUT_MS = 8000;

const API = "https://api.resend.com";

export type ResendFailure =
  | "unconfigured" // no API key, or no verified From address
  | "auth" // key rejected — usually a sending-only key, which cannot write contacts
  | "timeout"
  | "network"
  | "server";

export type ResendResult =
  | { ok: true }
  | { ok: false; reason: ResendFailure; status?: number; detail?: string };

async function post(path: string, body: unknown): Promise<ResendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[waitlist] RESEND_API_KEY is unset.");
    return { ok: false, reason: "unconfigured" };
  }

  let res: Response;
  try {
    res = await fetch(`${API}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    // AbortSignal.timeout rejects with a DOMException named TimeoutError; a
    // genuine connection failure arrives as something else entirely. Worth
    // separating in the log, because one means "Resend is slow" and the other
    // means "we cannot reach the internet".
    const timedOut = err instanceof Error && err.name === "TimeoutError";
    console.error(
      `[waitlist] ${path} ${timedOut ? `timed out after ${TIMEOUT_MS}ms` : "failed"}:`,
      err,
    );
    return { ok: false, reason: timedOut ? "timeout" : "network" };
  }

  if (res.ok) return { ok: true };

  const detail = await res.text().catch(() => "");
  console.error(`[waitlist] ${path} responded ${res.status}: ${detail}`);

  const reason: ResendFailure = res.status === 401 || res.status === 403 ? "auth" : "server";
  return { ok: false, reason, status: res.status, detail };
}

/**
 * Whether an address is already a live subscriber.
 *
 * "unknown" is not a failure to handle — it is the answer whenever the lookup
 * did not return a clean yes or no, and callers must treat it as "go ahead".
 * Blocking a first-time signup because Resend was briefly slow would trade a
 * duplicate email for a lost one.
 */
export type ContactLookup = "on-list" | "not-on-list" | "unknown";

/**
 * Looks the address up so the signup action can decline to send a second
 * confirmation to someone already subscribed.
 *
 * Deliberately does NOT distinguish unsubscribed contacts from absent ones:
 * someone who opted out and then filled the form in again is asking to come
 * back, and should get the confirmation like anyone else.
 */
export async function lookupContact(email: string): Promise<ContactLookup> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return "unknown";

  try {
    const res = await fetch(`${API}/contacts/${encodeURIComponent(email)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (res.status === 404) return "not-on-list";
    if (!res.ok) {
      console.error(`[waitlist] contact lookup responded ${res.status}`);
      return "unknown";
    }

    const body = (await res.json()) as { unsubscribed?: boolean };
    return body.unsubscribed === false ? "on-list" : "not-on-list";
  } catch (err) {
    console.error("[waitlist] contact lookup failed:", err);
    return "unknown";
  }
}

/**
 * Adds the contact. Called only from the confirmation route, never from the
 * signup form — the whole point of double opt-in is that an unproven address
 * never reaches the list.
 *
 * Posts to the flat /contacts endpoint. Resend used to scope contacts under
 * /audiences/{id}/contacts; that model is retired — there is now one global
 * contact list, subdivided by segments. No audience ID to configure.
 */
export async function subscribeContact(email: string): Promise<ResendResult> {
  const res = await post("/contacts", { email, unsubscribed: false });

  // Confirming twice is a thing people do — a second click on the same link,
  // or a mail client that prefetches it. Already being on the list is the
  // outcome they wanted, so it is not an error. Matched narrowly, so a real
  // 500 still surfaces as one.
  if (!res.ok && (res.status === 409 || /already exists/i.test(res.detail ?? ""))) {
    return { ok: true };
  }

  return res;
}

export async function sendConfirmationEmail(
  email: string,
  confirmUrl: string,
): Promise<ResendResult> {
  const from = process.env.WAITLIST_FROM;
  if (!from) {
    console.error("[waitlist] WAITLIST_FROM is unset — cannot send confirmation.");
    return { ok: false, reason: "unconfigured" };
  }

  return post("/emails", {
    from,
    to: email,
    // Replies land with a human rather than bouncing off a no-reply void. The
    // address is a real forwarder; see README.
    reply_to: CONTACT_EMAIL,
    subject: "Confirm your spot on the NoctFinance waitlist",
    // Both parts, always. A text/plain alternative is what stops this landing
    // in spam, and it is the only version some clients will ever render.
    text: [
      "Welcome to NoctFinance.",
      "",
      "You're one click from the waitlist. Confirm your address and we'll write",
      "to you when the testnet demo opens — not before, and not about anything else.",
      "",
      "Confirm here:",
      confirmUrl,
      "",
      "The link works for 24 hours. If you didn't sign up, ignore this email —",
      "nothing happens and your address is never stored.",
      "",
      `X:       ${SOCIAL.x}`,
      `Discord: ${SOCIAL.discord}`,
      `Email:   ${CONTACT_EMAIL}`,
      "",
      "NoctFinance — lend and borrow on-chain without broadcasting your balance sheet.",
    ].join("\n"),
    // Deliberately plain HTML: inline styles, no external CSS, no gradients on
    // anything load-bearing. Mail clients strip <style> blocks, and Outlook's
    // Word engine ignores gradients and padded anchors entirely — hence the
    // table-wrapped button, which is the one construct every client renders.
    html: `
<div style="background:#0b0b0d;padding:40px 24px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e8e8ea">
  <span style="display:none;font-size:1px;color:#0b0b0d;max-height:0;overflow:hidden">
    One click to confirm, then we&rsquo;ll only write when the testnet demo opens.
  </span>
  <div style="max-width:520px;margin:0 auto">

    <img src="${SITE_URL}/noctfinance-wordmark.png" alt="NoctFinance"
         width="152" height="28"
         style="display:block;width:152px;height:28px;border:0;outline:none;text-decoration:none" />
    <div style="width:44px;height:2px;background:#22d3ee;margin:16px 0 26px"></div>

    <p style="font-size:19px;line-height:1.45;font-weight:600;margin:0 0 14px;color:#f4f4f6">
      Welcome to NoctFinance.
    </p>
    <p style="font-size:15px;line-height:1.65;margin:0 0 26px;color:#c9c9d1">
      You&rsquo;re one click from the waitlist. Confirm your address and we&rsquo;ll write
      to you when the testnet demo opens &mdash; not before, and not about anything else.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 26px">
      <tr>
        <td style="background:#0e7490;border-radius:10px">
          <a href="${confirmUrl}"
             style="display:inline-block;padding:14px 26px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
                    font-size:15px;font-weight:600;color:#ffffff;text-decoration:none">
            Confirm my email
          </a>
        </td>
      </tr>
    </table>

    <p style="font-size:13px;line-height:1.65;color:#8f8f9a;margin:0">
      The link works for 24 hours. If you didn&rsquo;t sign up, ignore this email
      &mdash; nothing happens and your address is never stored.
    </p>
    <p style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;line-height:1.5;
              color:#6b6b75;word-break:break-all;margin:18px 0 0">${confirmUrl}</p>

    <div style="border-top:1px solid #23232a;margin:32px 0 0;padding:22px 0 0">
      <p style="font-size:13px;line-height:1.6;margin:0 0 12px">
        <a href="${SOCIAL.x}" style="color:#22d3ee;text-decoration:none">X</a>
        <span style="color:#3a3a44">&nbsp;&middot;&nbsp;</span>
        <a href="${SOCIAL.discord}" style="color:#22d3ee;text-decoration:none">Discord</a>
        <span style="color:#3a3a44">&nbsp;&middot;&nbsp;</span>
        <a href="mailto:${CONTACT_EMAIL}" style="color:#22d3ee;text-decoration:none">${CONTACT_EMAIL}</a>
      </p>
      <p style="font-size:12px;line-height:1.6;color:#6b6b75;margin:0">
        Lend and borrow on-chain &mdash; without broadcasting your balance sheet.
      </p>
    </div>

  </div>
</div>`.trim(),
  });
}
