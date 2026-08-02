import type { Metadata, Viewport } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

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
  title: "zenfinance — lend and borrow on-chain, without broadcasting your balance sheet",
  description:
    "A privacy-preserving money market. Zero-knowledge proofs verify every position — without revealing it. Shielded positions, ZK-verified solvency, agent-native ERC-4337.",
  openGraph: {
    title: "zenfinance — the quiet money market",
    description:
      "Lend and borrow on-chain — without broadcasting your balance sheet. ZK-verified, private by construction.",
    type: "website",
  },
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%230a0a0b'/%3E%3Cpath d='M8 11h16l-16 10h16' stroke='url(%23g)' stroke-width='3' fill='none'/%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%2322d3ee'/%3E%3Cstop offset='1' stop-color='%23a3e635'/%3E%3C/linearGradient%3E%3C/svg%3E",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
