"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

/**
 * Cookie consent banner. Shows once per browser; stores the choice in
 * localStorage under "cookie-consent" ("accepted" | "denied").
 * Renders nothing until the client confirms no prior choice exists, so there
 * is no hydration mismatch.
 */
export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem("cookie-consent")) setVisible(true);
    } catch {
      // Private-browsing environments block localStorage — treat as no consent.
      setVisible(true);
    }
  }, []);

  function persist(value: "accepted" | "denied") {
    try {
      localStorage.setItem("cookie-consent", value);
    } catch {
      // Silently ignore write failures (private mode, storage quota).
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="cookie-banner glass glass-frosted"
      role="dialog"
      aria-modal="false"
      aria-label="Cookie consent"
    >
      <p className="cookie-text">
        We use cookies to enhance your user experience, provide personalised
        content and analyse traffic.{" "}
        <Link href="/cookies" className="cookie-link">
          Cookie Policy
        </Link>
      </p>
      <div className="cookie-actions">
        <button
          className="btn btn-gradient"
          onClick={() => persist("accepted")}
        >
          Accept All
        </button>
        <button
          className="btn btn-outline"
          onClick={() => persist("denied")}
        >
          Deny All
        </button>
      </div>
    </div>
  );
}
