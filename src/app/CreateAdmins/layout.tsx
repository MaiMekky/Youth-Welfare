import React from "react";
import Sidebar from "../SuperAdmin/components/sidebar";
import Header from "../SuperAdmin/components/header";
import Footer from "../SuperAdmin/components/Footer2";
import styles from "../ActivityLogs/layout.module.css";

export default function DashboardLayout({ children }) {
  return (
    <div className={styles.dashboardContainer}>
      <Header />
      <div className={styles.dashboardContent}>
        <Sidebar />
        <main className={styles.mainContent}>{children}</main>
      </div>
      <Footer />
    </div>
  );
}
