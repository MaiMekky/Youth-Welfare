
"use client";
import React, { useState } from "react";
import Header from "./header";

interface Props {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export default function SidebarLayout({ sidebar, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarWithProps = React.isValidElement(sidebar)
    ? React.cloneElement(sidebar as React.ReactElement<any>, {
        isOpen: sidebarOpen,
        setIsOpen: setSidebarOpen,
      })
    : sidebar;

  return (
    <>
      {sidebarWithProps}
      <div className="layout-main">        {/* re-uses your existing Layout.css class */}
        <Header onSidebarOpen={() => setSidebarOpen(true)} />
        <main className="layout-content">{children}</main>
      </div>
    </>
  );
}