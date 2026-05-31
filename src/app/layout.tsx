import type { Metadata } from "next";
import "./globals.css";
import { CoreAIProvider } from "@/components/CoreAI/CoreAIProvider";
import CoreAIModal from "@/components/CoreAI/CoreAIModal";
import { NotificationsProvider } from "@/components/Notifications/NotificationsProvider";
import NotificationsPanel from "@/components/Notifications/NotificationsPanel";
import { SearchProvider } from "@/components/Search/SearchProvider";
import SearchModal from "@/components/Search/SearchModal";

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
            <SearchProvider>
              {children}
              <CoreAIModal />
              <NotificationsPanel />
              <SearchModal />
            </SearchProvider>
          </NotificationsProvider>
        </CoreAIProvider>
      </body>
    </html>
  );
}
