"use client";
import React, { useState } from "react";
import Header from "./Header";

interface SidebarLayoutProps {
  sidebar: React.ReactNode;   // pass the sidebar as a slot
  children: React.ReactNode;
}

/**
 * Thin client wrapper that:
 *  1. Owns sidebarOpen state
 *  2. Passes onSidebarOpen → Header (so the ☰ button works)
 *  3. Clones the sidebar element and injects isOpen / setIsOpen into it
 */
export default function SidebarLayout({ sidebar, children }: SidebarLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Inject isOpen / setIsOpen into whatever sidebar is passed in
  const sidebarWithProps = React.isValidElement(sidebar)
    ? React.cloneElement(sidebar as React.ReactElement<any>, {
        isOpen: sidebarOpen,
        setIsOpen: setSidebarOpen,
      })
    : sidebar;

  return (
    <div className="app-layout">
      <Header onSidebarOpen={() => setSidebarOpen(true)} />
      <div className="app-container">
        {sidebarWithProps}
        <div className="main-content">
          <div className="page-wrapper">{children}</div>
        </div>
      </div>
    </div>
  );
}