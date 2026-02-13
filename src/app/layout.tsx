import "./globals.css";
import { LanguageProvider } from "./context/LanguageContext";
import AuthBackGuard from "./components/AuthBackGuard";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Helwan University Portal",
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
          {/* don't allow to go back after  logout */}
          <AuthBackGuard />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
