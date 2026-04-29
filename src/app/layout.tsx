import "./globals.css";
import { Cairo } from "next/font/google";
import { LanguageProvider } from "./context/LanguageContext";
import { ToastProvider } from "./context/ToastContext";
import AuthBackGuard from "./components/AuthBackGuard";
import RouteTracker from "./components/RouteTracker";
import SessionTracker from "./components/SessionTracker";

import type { Metadata } from "next";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-cairo",
});

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
    <html lang="ar" className={cairo.variable}>
      <body className="app-body">
        <ToastProvider>
          <LanguageProvider>

            {/* Detect active session (used to decide if expired session message should appear) */}
            <SessionTracker />

            {/* Track last visited page */}
            <RouteTracker />

            {/* Prevent navigating back after logout */}
            <AuthBackGuard />

            {children}

          </LanguageProvider>
        </ToastProvider>
      </body>
    </html>
  );
}