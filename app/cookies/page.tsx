import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, SITE_URL } from "../site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `Cookie Policy — ${SITE_NAME}`,
  description:
    "How NoctFinance uses cookies and similar technologies on this website.",
  alternates: { canonical: "/cookies" },
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "8 August 2026";

const COOKIE_TABLE = [
  {
    name: "cookie-consent",
    type: "Essential",
    purpose: "Stores your Accept / Deny choice so the banner doesn't reappear.",
    duration: "1 year",
    party: "First",
  },
  {
    name: "__vercel_live_token",
    type: "Essential",
    purpose: "Vercel deployment infrastructure — required for preview builds.",
    duration: "Session",
    party: "First",
  },
  {
    name: "_vercel_no_cache",
    type: "Essential",
    purpose: "Prevents stale previews from being served from the CDN cache.",
    duration: "Session",
    party: "First",
  },
];

export default function CookiesPage() {
  return (
    <>
      <div className="ambient" aria-hidden="true">
        <span className="orb orb-a" />
        <span className="orb orb-b" />
        <span className="orb orb-c" />
      </div>

      <div className="cookies-wrap">
        {/* back link */}
        <div className="cookies-back">
          <Link href="/" className="cookies-back-link">
            ← back to NoctFinance
          </Link>
        </div>

        <article className="cookies-article glass glass-frosted">
          {/* header */}
          <header className="cookies-header">
            <p className="kicker">{"// LEGAL"}</p>
            <h1 className="cookies-h1">Cookie Policy</h1>
            <p className="cookies-meta">
              {SITE_NAME} · Last updated {LAST_UPDATED}
            </p>
          </header>

          {/* sections */}
          <section className="cookies-section">
            <h2 className="cookies-h2">What are cookies?</h2>
            <p>
              Cookies are small text files placed on your device when you visit
              a website. They are widely used to make sites work correctly, to
              remember your preferences, and to provide information to the
              site&rsquo;s owners.
            </p>
          </section>

          <section className="cookies-section">
            <h2 className="cookies-h2">How we use cookies</h2>
            <p>
              NoctFinance is a static marketing site. We do not run advertising
              networks, sell your data, or deploy third-party tracking pixels.
              Our cookie use is intentionally minimal:
            </p>
            <ul className="cookies-list">
              <li>
                <strong>Essential cookies</strong> — required for the site to
                function. They cannot be turned off. They are set in response to
                actions you take, such as recording your cookie preference.
              </li>
              <li>
                <strong>Analytics cookies</strong> — only set if you click
                &ldquo;Accept All&rdquo;. We use privacy-friendly, cookieless
                analytics where possible. No personal data leaves your device.
              </li>
            </ul>
            <p>
              Because privacy is core to what NoctFinance builds, we hold
              ourselves to the same standard we ask of the protocol: collect
              nothing you don&rsquo;t need, prove everything you claim.
            </p>
          </section>

          <section className="cookies-section">
            <h2 className="cookies-h2">Cookies we set</h2>
            <p>
              The table below lists every cookie this site places. We audit it
              every time the site changes.
            </p>

            <div className="cookies-table-wrap">
              <table className="cookies-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Purpose</th>
                    <th>Duration</th>
                    <th>Party</th>
                  </tr>
                </thead>
                <tbody>
                  {COOKIE_TABLE.map((row) => (
                    <tr key={row.name}>
                      <td>
                        <code>{row.name}</code>
                      </td>
                      <td>{row.type}</td>
                      <td>{row.purpose}</td>
                      <td>{row.duration}</td>
                      <td>{row.party}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="cookies-section">
            <h2 className="cookies-h2">Your choices</h2>
            <p>
              You can withdraw or change your consent at any time by clearing
              your browser&rsquo;s local storage or cookies for this site. The
              banner will reappear on your next visit.
            </p>
            <p>
              You can also configure your browser to block or delete cookies
              entirely. Note that blocking essential cookies may prevent parts
              of the site from working correctly.
            </p>
            <p>
              Most browsers provide a &ldquo;Do Not Track&rdquo; signal. We
              honour it: when DNT is enabled, no analytics cookies are set
              regardless of your banner choice.
            </p>
          </section>

          <section className="cookies-section">
            <h2 className="cookies-h2">Changes to this policy</h2>
            <p>
              We may update this policy when we make changes to the site. The
              &ldquo;Last updated&rdquo; date at the top of this page will
              reflect the most recent revision. Material changes will reset the
              consent banner so you can review them.
            </p>
          </section>

          <section className="cookies-section">
            <h2 className="cookies-h2">Contact</h2>
            <p>
              Questions about this policy or our data practices?{" "}
              <a className="cookie-link" href="mailto:team@noctfinance.xyz">
                team@noctfinance.xyz
              </a>
            </p>
          </section>

          {/* footer strip */}
          <div className="cookies-foot">
            <Link href="/" className="btn btn-outline cookies-home-btn">
              ← Back to NoctFinance
            </Link>
          </div>
        </article>
      </div>
    </>
  );
}
