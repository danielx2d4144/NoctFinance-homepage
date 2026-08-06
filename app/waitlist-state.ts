/**
 * Shared between the Server Action and the client form.
 *
 * These live outside waitlist-action.ts because a "use server" module may only
 * export async functions — exporting a plain object from it compiles fine but
 * throws at request time, which means every signup 500s in production while
 * the build stays green.
 */

export type WaitlistState = {
  status: "idle" | "ok" | "error";
  message: string;
  /**
   * Echoed back on failure so the field can be repopulated. React resets an
   * uncontrolled form after a Server Action resolves, which would otherwise
   * make a typo cost the visitor their whole address.
   */
  email?: string;
};

export const WAITLIST_INITIAL: WaitlistState = { status: "idle", message: "" };
