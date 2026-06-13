import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";

// Geist (UI/display) + Geist Mono (values, labels, "ledger" feel) + Newsreader
// (the large serif figures on the app screens). Exposed as CSS variables so the
// page/app stylesheets can reference them through --font / --mono / --serif.
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});
const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bill | A quiet watch on every charge",
  description:
    "Bill watches your virtual card for silent price hikes, charges that don't fit, and subscriptions you forgot — and stays quiet about everything that's normal.",
  // Favicon is served from app/icon.png (the brand logo), auto-detected by Next.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} ${newsreader.variable}`}>
      <body>{children}</body>
    </html>
  );
}
