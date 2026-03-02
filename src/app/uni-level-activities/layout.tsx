"use client";
import React from "react";
import Header from "@/app/uni-level/components/Header";
import Sidebar from "./component/sidebar";
import Footer from "@/app/uni-level/components/Footer";
import "@/app/uni-level/styles/Layout.css";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="layout-container">
      <Sidebar />
      <div className="layout-main">
        <Header />
        <main className="layout-content">{children}</main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
