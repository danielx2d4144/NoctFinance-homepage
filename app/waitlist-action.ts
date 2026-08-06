"use server";

/**
 * Waitlist signup.
 *
 * Runs as a Server Action so the form submits without JavaScript — the page
 * already promises to work JS-disabled, and a signup form is exactly the thing
 * that must not quietly break for someone with a locked-down browser. That
 * matters more than usual here: the people most interested in a privacy
 * protocol are the most likely to be blocking scripts.
 *
 * Contacts go to Resend rather than a database we own, so there is a real list
 * to broadcast from on testnet day without an export step.
 *
 * Note this posts to the flat /contacts endpoint. Resend used to scope contacts
 * under /audiences/{id}/contacts; that model is retired — there is now one
 * global contact list, subdivided by segments. No audience ID to configure.
 */

import type { WaitlistState } from "./waitlist-state";

/**
 * Deliberately permissive. Strict RFC 5322 patterns reject addresses that
 * work fine, and the only authority on whether an address exists is whether
 * mail to it arrives. This rejects the obvious typos and nothing else.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function joinWaitlist(
  _prev: WaitlistState,
  formData: FormData,
): Promise<WaitlistState> {
  // Honeypot: a field hidden from humans that bots fill in anyway. Return the
  // success message so the bot has no signal to adapt against.
  if (formData.get("company")) {
    return { status: "ok", message: "You're on the list." };
  }

  // Keep the visitor's original casing to hand back on failure — correcting a
  // typo in what you typed is a different experience from retyping a string
  // the server has silently rewritten.
  const typed = String(formData.get("email") ?? "").trim();
  const email = typed.toLowerCase();

  if (!email) {
    return { status: "error", message: "Enter an email address." };
  }
  if (email.length > 254 || !EMAIL.test(email)) {
    return {
      status: "error",
      message: "That doesn't look like an email address.",
      email: typed,
    };
  }

  const apiKey = process.env.RESEND_API_KEY;

  // Misconfiguration is ours, not the visitor's. Log loudly, but never show a
  // stack trace to someone who just wanted to leave their email.
  if (!apiKey) {
    console.error("[waitlist] RESEND_API_KEY is unset — signup dropped.");
    return {
      status: "error",
      message: "Signups are temporarily unavailable. Try again shortly.",
      email: typed,
    };
  }

  try {
    const res = await fetch("https://api.resend.com/contacts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, unsubscribed: false }),
      cache: "no-store",
    });

    if (!res.ok) {
      // Re-adding an existing contact is a 4xx, but from the visitor's side
      // "I signed up twice" is a success, not a failure.
      const body = await res.text();
      if (res.status === 409 || /already exists/i.test(body)) {
        return { status: "ok", message: "You're already on the list." };
      }
      console.error(`[waitlist] Resend responded ${res.status}: ${body}`);
      return {
        status: "error",
        message: "Something went wrong on our end. Try again shortly.",
        email: typed,
      };
    }
  } catch (err) {
    console.error("[waitlist] Request to Resend failed:", err);
    return {
      status: "error",
      message: "Couldn't reach the signup service. Try again shortly.",
      email: typed,
    };
  }

  return { status: "ok", message: "You're on the list. We'll email once testnet is live." };
}
