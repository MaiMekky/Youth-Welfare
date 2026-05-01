"use client";
import React from "react";
import SidebarLayout from "./components/SidebarLayout";
import ScoutsSidebar from "./components/Sidebar";
import "@/app/Styles/Layout.css";

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="layout-wrapper">
    <SidebarLayout sidebar={<ScoutsSidebar />}>
      {children}
    </SidebarLayout>
  </div>
);

export default Layout;
