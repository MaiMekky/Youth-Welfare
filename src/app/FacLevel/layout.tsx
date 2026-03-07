
import React from "react";
import "./globals.css";
import TakafulSidebar from "./components/Sidebar";
import SidebarLayout from "../FacLevel/components/SidebarLayout";

export const metadata = {
  title: "إدارة التكافل الاجتماعي - جامعة العاصمة",
  description: "نظام إدارة طلبات الدعم المالي لجامعة حلوان",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar">
      <body className="app-body">
        <SidebarLayout sidebar={<TakafulSidebar />}>
          {children}
        </SidebarLayout>
      </body>
    </html>
  );
}