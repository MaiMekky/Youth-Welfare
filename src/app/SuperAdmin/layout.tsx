"use client";
import React from "react";
import Sidebar from "./components/sidebar";
import Header from "./components/header";
import Footer from "./components/Footer2";
import styles from "./Styles/page.module.css";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.dashboardContainer}>
      <Sidebar />
      <div className={styles.layoutMain}>
        <Header />
        <main className={styles.mainContent}>{children}</main>
        <Footer />
      </div>
    </div>
  );
}
