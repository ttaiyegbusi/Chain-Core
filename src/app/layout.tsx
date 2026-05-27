import type { Metadata } from "next";
import "./globals.css";
import { CoreAIProvider } from "@/components/CoreAI/CoreAIProvider";
import CoreAIModal from "@/components/CoreAI/CoreAIModal";

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
      <body>
        <CoreAIProvider>
          {children}
          <CoreAIModal />
        </CoreAIProvider>
      </body>
    </html>
  );
}
