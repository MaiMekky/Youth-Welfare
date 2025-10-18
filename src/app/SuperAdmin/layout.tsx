// app/SuperAdmin/layout.tsx
import React from "react";
import "../globals.css";
import Header from "./components/header";

export const metadata = {
  title: "التكافل الاجتماعي - لوحة الإدارة",
};

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html >
      <body>
        <div className="sa-app">
          <Header />
          <div className="sa-content">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
