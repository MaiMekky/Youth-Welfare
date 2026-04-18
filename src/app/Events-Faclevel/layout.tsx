
import React from "react";
import "./global.css";
import EventsSidebar from "./components/sidebar";
import SidebarLayout from "../FacLevel/components/SidebarLayout";
import Footer from "../FacLevel/components/Footer";

export const metadata = {
  title: "إدارة الأنشطة - جامعة العاصمة",
  description: "نظام إدارة طلبات الأنشطة لجامعة حلوان",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
    <SidebarLayout sidebar={<EventsSidebar />}>
      {children}
    </SidebarLayout>
    <Footer />
     </>
  );
}