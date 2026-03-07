
"use client";
import React from "react";
import SidebarLayout from "../uni-level/components/Sidebarlayout";
import Sidebar from "./components/sidbar";
import Footer from "@/app/uni-level/components/Footer";
import "@/app/uni-level/styles/Layout.css";

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="layout-wrapper">
    <SidebarLayout sidebar={<Sidebar />}>
      {children}
    </SidebarLayout>
    <Footer />
  </div>
);

export default Layout;
