import type { Metadata } from "next";
import "./globals.css";
import { CoreAIProvider } from "@/components/CoreAI/CoreAIProvider";
import CoreAIModal from "@/components/CoreAI/CoreAIModal";
import { NotificationsProvider } from "@/components/Notifications/NotificationsProvider";
import NotificationsPanel from "@/components/Notifications/NotificationsPanel";
import { SearchProvider } from "@/components/Search/SearchProvider";
import SearchModal from "@/components/Search/SearchModal";
import PrimaryRail from "@/components/PrimaryRail";

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
        {/*
          Reads --rail-width from localStorage before React hydrates.
          This prevents any layout flash on first load — the correct
          width is applied before the browser paints the first frame.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var _e=localStorage.getItem('chaincore-primary-nav-expanded')==='true';document.documentElement.style.setProperty('--rail-width',_e?'280px':'72px')}catch(_){}`,
          }}
        />
        <CoreAIProvider>
          <NotificationsProvider>
            <SearchProvider>
              <PrimaryRail />
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
