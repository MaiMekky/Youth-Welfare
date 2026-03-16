import "./globals.css";
import { LanguageProvider } from "./context/LanguageContext";
import AuthBackGuard from "./components/AuthBackGuard";
import RouteTracker from "./components/RouteTracker";
import SessionTracker from "./components/SessionTracker";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "بوابة رعاية الطلاب - جامعة العاصمة",
  description: "بوابة رعاية الشباب بجامعة حلوان",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar">
      <body className="app-body">
        <LanguageProvider>

          {/* Detect active session (used to decide if expired session message should appear) */}
          <SessionTracker />

          {/* Track last visited page */}
          <RouteTracker />

          {/* Prevent navigating back after logout */}
          <AuthBackGuard />

          {children}

        </LanguageProvider>
      </body>
    </html>
  );
}