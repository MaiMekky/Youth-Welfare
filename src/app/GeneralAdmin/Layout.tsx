"use client";
import React from "react";
import SidebarLayout from "./components/Sidebarlayout";
import Sidebar from "./components/Sidebar";
import styles from "../FacultyHead/Styles/Layout.module.css";

interface LayoutProps {
  children: React.ReactNode;
  currentView?: string;
  onNavigate?: (view: string) => void;
}

const Layout = ({ children, currentView = "activities", onNavigate }: LayoutProps) => {
  return (
    <div className={styles.layoutContainer}>
      <SidebarLayout
        sidebar={<Sidebar currentView={currentView} onNavigate={onNavigate} />}
      >
        {children}
      </SidebarLayout>
    </div>
  );
};

export default Layout;