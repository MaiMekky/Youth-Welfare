
import React from "react";
import "../FacLevel/globals.css";
import FamilySidebar from "./components/sidebar";
import SidebarLayout from "../FacLevel/components/SidebarLayout";

export const metadata = {
  title: "إدارة الأسر الطلابية - جامعة العاصمة",
  description: "نظام إدارة طلبات الأسر الطلابية لجامعة حلوان",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar">
      <body className="app-body">
        <SidebarLayout sidebar={<FamilySidebar />}>
          {children}
        </SidebarLayout>
      </body>
    </html>
  );
}