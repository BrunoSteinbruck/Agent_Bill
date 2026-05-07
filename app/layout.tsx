import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bill | Subscription assistant for recurring spend",
  description:
    "Bill watches recurring spend, flags subscription changes, and keeps card decisions clear without moving your wallet.",
  icons: {
    icon: [
      { url: "/images/bill-favicon-max.png", sizes: "32x32", type: "image/png" },
      { url: "/images/bill-favicon-max.png", sizes: "64x64", type: "image/png" },
      { url: "/images/bill-favicon-max.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/images/bill-favicon-max.png",
    apple: "/images/bill-favicon-max.png",
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
