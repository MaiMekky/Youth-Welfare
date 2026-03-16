
import React from "react";
import SidebarLayout from "../SuperAdmin/components/SidebarLayout";
import Sidebar from "../SuperAdmin/components/sidebar";
import Footer from "../SuperAdmin/components/Footer2";
import styles from "../SuperAdmin/layout.module.css";

export const metadata = { title: "سجلات النشاط - جامعة العاصمة" };

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.dashboardContainer}>
      <SidebarLayout sidebar={<Sidebar />}>
        {children}
      </SidebarLayout>
      <Footer />
    </div>
  );
}