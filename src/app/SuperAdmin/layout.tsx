// app/dashboard/layout.tsx
"use client";
import React, { useState } from "react";
import Sidebar from "../SuperAdmin/components/sidebar";
import Header from "../SuperAdmin/components/header";
import Footer from "../SuperAdmin/components/Footer2";
import styles from "./layout.module.css";


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className={styles.layout}>
      <Header toggleSidebar={toggleSidebar} />
      
      <div className={styles.layoutBody}>
        <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
        
        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className={styles.overlay} 
            onClick={closeSidebar}
          />
        )}
        
        <main className={styles.main}>
          {children}
        </main>
      </div>
      
      <Footer />
    </div>
  );
}