"use client";
import React, { useState } from "react";
import Header from "./Header";

interface Props {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export default function SidebarLayout({ sidebar, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarWithProps = React.isValidElement(sidebar)
    ? React.cloneElement(sidebar as React.ReactElement<Record<string, unknown>>, {
        isOpen: sidebarOpen,
        setIsOpen: setSidebarOpen,
      })
    : sidebar;

  return (
    <div className="layout-container">
      {sidebarWithProps}
      <div className="layout-main">
        <Header onSidebarOpen={() => setSidebarOpen(true)} />
        <main className="layout-content">{children}</main>
      </div>
    </div>
  );
}