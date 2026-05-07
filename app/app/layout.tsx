import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ProductShell } from "./_components/product-shell";

export const metadata: Metadata = {
  title: "Bill App",
  description: "Dashboard for card spend and available balance.",
};

export default function AppLayout({ children }: { children: ReactNode }) {
  return <ProductShell>{children}</ProductShell>;
}
