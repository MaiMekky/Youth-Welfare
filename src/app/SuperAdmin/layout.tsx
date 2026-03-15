import React from "react";
import SidebarLayout from "./components/SidebarLayout";
import Sidebar from "./components/sidebar";
import Footer from "./components/Footer2";
import styles from "./layout.module.css";

export const metadata = { title: "Dashboard" };

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.sidebarWrapper}>
        <SidebarLayout sidebar={<Sidebar />}>
          {children}
        </SidebarLayout>
      </div>
      <Footer />
    </div>
  );
}