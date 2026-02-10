"use client";
import React from "react";
import Header from "@/app/SuperAdmin/components/header";
import Sidebar from "@/app/SuperAdmin/components/sidebar";
import Footer from "@/app/SuperAdmin/components/Footer2";
import styles from "../ActivityLogs/layout.module.css";
const Layout = ({ children }: { children: React.ReactNode }) => {
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
  
};

export default Layout;
