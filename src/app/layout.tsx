import type { Metadata } from "next";
import "./globals.css";
import { CoreAIProvider } from "@/components/CoreAI/CoreAIProvider";
import CoreAIModal from "@/components/CoreAI/CoreAIModal";
import { NotificationsProvider } from "@/components/Notifications/NotificationsProvider";
import NotificationsPanel from "@/components/Notifications/NotificationsPanel";

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
          <NotificationsProvider>
            {children}
            <CoreAIModal />
            <NotificationsPanel />
          </NotificationsProvider>
        </CoreAIProvider>
      </body>
    </html>
  );
}
