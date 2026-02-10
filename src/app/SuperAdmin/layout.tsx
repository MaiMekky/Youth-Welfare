// app/dashboard/layout.tsx
"use client";
import React from "react";
import Sidebar from "../SuperAdmin/components/sidebar";
import Header from "../SuperAdmin/components/header";
import Footer from "../SuperAdmin/components/Footer2";
import styles from "./layout.module.css";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layout}>
      <Header />

      <div className={styles.layoutBody}>
        {/* Sidebar always rendered; internal logic handles mobile hamburger & overlay */}
        <Sidebar />

        <main className={styles.main}>{children}</main>
      </div>

      <Footer />
    </div>
  );
}