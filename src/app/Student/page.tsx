// app/student/page.tsx
"use client";

import React, { useState } from "react";
import StudentNavbar from "./components/StudentNavbar";
import HeaderCard from "./components/HeaderCard";
import SupportInfo from "./components/Cards";
import ApplyForm from "./components/ApplyForm";
import MyRequests from "./components/MyRequests";
import StudentFooter from "./components/StudentFooter";
import Cards from "./components/Cards";

export default function StudentHome() {
  const [activeTab, setActiveTab] = useState<string>("info");

  const renderContent = () => {
    switch (activeTab) {
      case "info":
        return <Cards />;
      case "apply":
        return <ApplyForm />;
      case "myRequests":
        return <MyRequests />;
      default:
        return <SupportInfo />;
    }
  };

  return (
    <>
      <StudentNavbar />
      <HeaderCard activeTab={activeTab} onTabChange={setActiveTab} />
      {renderContent()}
      <StudentFooter />
    </>
  );
}