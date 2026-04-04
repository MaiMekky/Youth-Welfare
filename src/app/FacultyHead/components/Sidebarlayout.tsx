"use client";
import React, { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";

interface Props {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Final DOM structure:
 *
 * <div class="layout-container">          ← flex row, direction: rtl
 *   <aside class="fh-sidebar ...">        ← fixed overlay, slides from right
 *   <div class="layout-main">             ← flex column, fills full width
 *     <Header onSidebarOpen=... />        ← sticky top
 *     <main class="layout-content">      ← page content
 *       {children}
 *     </main>
 *     <Footer />                          ← bottom of column
 *   </div>
 * </div>
 */
export default function SidebarLayout({ sidebar, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarWithProps = React.isValidElement(sidebar)
    ? React.cloneElement(sidebar as React.ReactElement<Record<string, unknown>>, {
        isOpen:    sidebarOpen,
        setIsOpen: setSidebarOpen,
      })
    : sidebar;

  return (
    <>
      {/* Sidebar — fixed overlay, toggled by Header button */}
      {sidebarWithProps}

      {/* Main column — full width since sidebar is overlaid */}
      <div className="layout-main">
        <Header onSidebarOpen={() => setSidebarOpen((v) => !v)} />
        <main className="layout-content">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}