
import React from "react";
import "./globals.css";
import TakafulSidebar from "../FacLevel/components/Sidebar";
import SidebarLayout from "../FacLevel/components/SidebarLayout";

export const metadata = {
  title: "إدارة التكافل الاجتماعي - جامعة العاصمة",
  description: "نظام إدارة طلبات الدعم المالي لجامعة حلوان",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarLayout sidebar={<TakafulSidebar />}>
      {children}
    </SidebarLayout>
  );
}