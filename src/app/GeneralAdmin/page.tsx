"use client";
import React, { useState } from "react";
import Layout from "./Layout";
import Activities from "./components/Activities";
import PlanView from "./components/PlanView";

export default function Page() {
  const [currentView, setCurrentView] = useState("activities");

  const renderView = () => {
    switch (currentView) {
      case "activities":
        return <Activities />;
      case "reports":
        return <></>;
      case "plan":
        return <PlanView />;
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