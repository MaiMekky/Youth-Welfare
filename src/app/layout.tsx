import "./globals.css";
import { LanguageProvider } from "./context/LanguageContext";

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
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
