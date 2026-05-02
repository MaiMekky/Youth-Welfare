"use client";
import React, { useState } from "react";
import Sidebar from "../components/sidebar";
import "@/app/Styles/Layout.css";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="layout-wrapper">
      <div className="layout-container">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="layout-main">
          <main className="layout-content">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
