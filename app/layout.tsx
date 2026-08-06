import type { Metadata, Viewport } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SITE_NAME, SITE_URL } from "./site";

const sans = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  // Required for canonical/OG URLs to resolve absolutely rather than relative
  // to whatever host happens to serve the page (preview deploys included).
  metadataBase: new URL(SITE_URL),
  // Kept under ~60 characters so Google shows it whole, and keyword-first
  // because nobody is searching the brand name yet.
  title: "Private on-chain lending, ZK-verified — NoctFinance",
  description:
    "A privacy-preserving money market. Lend and borrow on-chain — zero-knowledge proofs verify every position without revealing it.",
  applicationName: SITE_NAME,
  keywords: [
    "private lending protocol",
    "privacy-preserving DeFi",
    "zero-knowledge lending",
    "shielded money market",
    "ZK borrow and lend",
    "private borrowing crypto",
    "confidential DeFi positions",
    "ERC-4337 lending",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  // Tokens come from env so ownership can be re-verified without a code
  // change. Next omits each tag entirely when its variable is unset.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : {},
  },
  openGraph: {
    title: "NoctFinance — the quiet money market",
    description:
      "Lend and borrow on-chain — without broadcasting your balance sheet. ZK-verified, private by construction.",
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "NoctFinance — the quiet money market",
    description:
      "Lend and borrow on-chain — without broadcasting your balance sheet. ZK-verified, private by construction.",
  },
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%230a0a0b'/%3E%3Cpath d='M8 11h16l-16 10h16' stroke='url(%23g)' stroke-width='3' fill='none'/%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%2322d3ee'/%3E%3Cstop offset='1' stop-color='%23a3e635'/%3E%3C/linearGradient%3E%3C/svg%3E",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
};

/**
 * Schema.org graph. Tells Google, Bing and AI search what this site is and who
 * publishes it — the difference between "some crypto page" and a named entity.
 * Every claim here is also stated on the page; keep it that way.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      description:
        "A privacy-preserving money market. Lend and borrow on-chain while zero-knowledge proofs verify every position without revealing it.",
      // Still the pre-rebrand repo slug. GitHub 301s renamed repos forever, so
      // this keeps resolving — but update it once the repo itself is renamed,
      // so sameAs points at the entity's real canonical URL.
      sameAs: ["https://github.com/danielx2d4144/zenfinance_privacy"],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      inLanguage: "en",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
