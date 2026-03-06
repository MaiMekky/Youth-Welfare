
import React from "react";
import "./global.css";
import EventsSidebar from "./components/sidebar";
import SidebarLayout from "../FacLevel/components/SidebarLayout";

export const metadata = {
  title: "إدارة الأنشطة - جامعة العاصمة",
  description: "نظام إدارة طلبات الأنشطة لجامعة حلوان",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar">
      <body className="app-body">
        <SidebarLayout sidebar={<EventsSidebar />}>
          {children}
        </SidebarLayout>
      </body>
    </html>
  );
}