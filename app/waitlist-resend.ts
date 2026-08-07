/**
 * Every outbound call to Resend, in one place.
 *
 * Both callers — the signup action and the confirmation page — run inside a
 * serverless function with a hard wall-clock limit. A request with no deadline
 * of its own inherits that limit, so one slow upstream turns into a request
 * that holds an instance open until the platform kills it and the visitor sees
 * a generic 504 instead of a sentence we wrote. Hence the explicit timeout.
 */

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
    subject: "Confirm your NoctFinance waitlist signup",
    // Both parts, always. A text/plain alternative is what stops this landing
    // in spam, and it is the only version some clients will ever render.
    text: [
      "Someone — hopefully you — asked to join the NoctFinance waitlist with this address.",
      "",
      "Confirm here:",
      confirmUrl,
      "",
      "The link is good for 24 hours. If this wasn't you, ignore this email;",
      "nothing happens and your address is not stored.",
    ].join("\n"),
    html: `
<div style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;background:#0b0b0d;color:#e8e8ea;padding:40px 24px">
  <div style="max-width:520px;margin:0 auto">
    <p style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#7d7d87;margin:0 0 24px">
      NoctFinance
    </p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 24px">
      Someone &mdash; hopefully you &mdash; asked to join the waitlist with this address.
      Confirm it and you&rsquo;re on the list.
    </p>
    <p style="margin:0 0 28px">
      <a href="${confirmUrl}"
         style="display:inline-block;background:linear-gradient(90deg,#22d3ee,#a3e635);color:#0b0b0d;
                font-weight:600;text-decoration:none;padding:13px 22px;border-radius:10px">
        Confirm my email
      </a>
    </p>
    <p style="font-size:13px;line-height:1.6;color:#9a9aa4;margin:0 0 8px">
      The link is good for 24 hours. If this wasn&rsquo;t you, ignore this email
      &mdash; nothing happens and your address is not stored.
    </p>
    <p style="font-size:12px;color:#6b6b75;word-break:break-all;margin:24px 0 0">${confirmUrl}</p>
  </div>
</div>`.trim(),
  });
}
