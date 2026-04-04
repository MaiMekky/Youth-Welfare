"use client";
import React, { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";

interface Props {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

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
      {sidebarWithProps}
      <div className="layout-main">
        <Header onSidebarOpen={() => setSidebarOpen((v) => !v)} />
        <main className="layout-content">{children}</main>
        <Footer />
      </div>
    </>
  );
}