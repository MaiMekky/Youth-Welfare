import "./globals.css";
import { LanguageProvider } from "./context/LanguageContext";
import AuthBackGuard from "./components/AuthBackGuard";
import RouteTracker from "./components/RouteTracker";

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

          {/* Track last visited page */}
          <RouteTracker />

          {/* don't allow to go back after logout */}
          <AuthBackGuard />

          {children}

        </LanguageProvider>
      </body>
    </html>
  );
}