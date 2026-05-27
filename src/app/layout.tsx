import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChainCore — Accounting",
  description: "ChainCore core banking — Charts of Accounts",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
