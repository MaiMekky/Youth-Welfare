"use client";
import { useState } from "react";
import Head from "next/head";
import Layout from "./Layout";
import ActivitiesManagement from "./components/Activitiesmanagement";
import ReportsView from "./components/Reportsview";
import PlanView from "./components/Planview";

export default function FacultyHeadPage() {
  const [currentView, setCurrentView] = useState<string>("activities");

  const renderContent = () => {
    switch (currentView) {
      case "activities":
        return <ActivitiesManagement />;
      case "reports":
        return <ReportsView />;
      case "plan":
        return <PlanView />;
      default:
        return <ActivitiesManagement />;
    }
  };

  const getPageTitle = () => {
    switch (currentView) {
      case "activities":
        return "إدارة الفعاليات";
      case "reports":
        return "التقارير والإنجازات";
      case "plan":
        return "خطة الكلية";
      default:
        return "المشرف العام للكلية";
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      <Head>
        <title>{getPageTitle()}</title>
      </Head>
      {renderContent()}
    </Layout>
  );
}