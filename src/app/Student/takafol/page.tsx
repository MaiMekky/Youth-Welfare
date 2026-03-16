"use client";
import React, { useState, useEffect } from "react";
import "../styles/applyForm.css";
import HeaderCard from "../components/HeaderCard";
import ApplyForm from "../components/ApplyForm";
import MyRequests from "../components/MyRequests";
import Cards from "../components/Cards";

export default function TakafolPage() {
  const [activeTab, setActiveTab] = useState<string>("info");
  const [showAlert, setShowAlert] = useState(false);
  const [requestsStatus, setRequestsStatus] = useState<string[]>([]);

  useEffect(() => {
    if (requestsStatus.length === 0) return;
    const hasUnderReview = requestsStatus.some(
      (st) => st === "موافقة مبدئية" || st === "under-review" || st === "under_review"
    );
    setShowAlert(hasUnderReview);
  }, [requestsStatus]);

  const navigateToRequests = () => {
    setActiveTab("myRequests");
    setShowAlert(true);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case "info":
        return <Cards />;
      case "apply":
        return <ApplyForm onNavigateToRequests={navigateToRequests} />;
      case "myRequests":
        return (
          <MyRequests
            showAlert={showAlert}
            onStatusesLoaded={(statuses: string[]) => setRequestsStatus(statuses)}
          />
        );
      default:
        return <Cards />;
    }
  };

  return (
    <div className="student-takafol-page">
      <HeaderCard activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="student-page-wrap">{renderContent()}</div>
    </div>
  );
}