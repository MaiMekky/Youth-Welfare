"use client";
import React, { useState } from "react";
import Layout from "./Layout";
import Activities from "./components/Activities";

export default function Page() {
  const [currentView, setCurrentView] = useState("activities");

  const renderView = () => {
    switch (currentView) {
      case "activities":
        return <Activities />;
      case "reports":
        // Replace <></> with your Reports component when ready
        return <></>;
      case "plan":
        // Replace <></> with your CollegeReports component when ready
        return <></>;
      default:
        return <Activities />;
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {renderView()}
    </Layout>
  );
}