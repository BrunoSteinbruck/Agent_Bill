import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Bill Docs",
    template: "%s | Bill Docs",
  },
  description:
    "Documentation for Bill, the subscription assistant for governed recurring spend.",
};

export default function DocsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
