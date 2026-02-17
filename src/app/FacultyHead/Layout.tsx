"use client";
import React from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import "./styles/Layout.css";

interface LayoutProps {
  children: React.ReactNode;
  currentView?: string;
  onNavigate?: (view: string) => void;
}

const Layout = ({ children, currentView = "activities", onNavigate }: LayoutProps) => {
  return (
    <div className="layout-container">
      <Sidebar currentView={currentView} onNavigate={onNavigate} />
      <div className="layout-main">
        <Header />
        <main className="layout-content">{children}</main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;