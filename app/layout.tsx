import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bill | Subscription assistant for governed spending",
  description:
    "Bill watches recurring spend, flags subscription changes, and helps you govern card decisions without moving your wallet.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
