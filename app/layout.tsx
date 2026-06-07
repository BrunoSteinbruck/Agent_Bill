import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bill | Subscription assistant for recurring spend",
  description:
    "Bill watches recurring spend, flags subscription changes, and keeps card decisions clear without moving your wallet.",
  // Favicon is served from app/icon.png (the brand logo), auto-detected by Next.
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
