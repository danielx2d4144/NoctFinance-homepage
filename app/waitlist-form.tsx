"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { joinWaitlist } from "./waitlist-action";
import { WAITLIST_INITIAL } from "./waitlist-state";

/**
 * Split out so the button can read useFormStatus, which only reports the
 * pending state of the <form> above it in the tree.
 */
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn-gradient" type="submit" disabled={pending}>
      {pending ? "Joining…" : "Join the waitlist"}
    </button>
  );
}

export function WaitlistForm() {
  const [state, formAction] = useActionState(joinWaitlist, WAITLIST_INITIAL);

  // On success the form is replaced entirely — leaving an empty input under a
  // confirmation invites a second submission and reads as though it failed.
  if (state.status === "ok") {
    return (
      <p className="waitlist-done" role="status">
        <span className="waitlist-check" aria-hidden="true" />
        {state.message}
      </p>
    );
  }

  return (
    <form className="waitlist-form" action={formAction} noValidate>
      <div className="waitlist-row">
        <label className="sr-only" htmlFor="waitlist-email">
          Email address
        </label>
        {/* keyed on the returned value so React remounts the input and picks
            up the new defaultValue — without the key it keeps the reset DOM
            node and the address the visitor typed is lost on every error. */}
        <input
          key={state.email ?? ""}
          id="waitlist-email"
          className="waitlist-input"
          type="email"
          name="email"
          placeholder="you@domain.com"
          autoComplete="email"
          defaultValue={state.email ?? ""}
          required
          aria-invalid={state.status === "error"}
          aria-describedby={state.status === "error" ? "waitlist-error" : undefined}
        />

        {/* Honeypot — hidden from people, tempting to bots. */}
        <input
          className="waitlist-hp"
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />

        <SubmitButton />
      </div>

      {state.status === "error" && (
        <p className="waitlist-error" id="waitlist-error" role="alert">
          {state.message}
        </p>
      )}
    </form>
  );
}
