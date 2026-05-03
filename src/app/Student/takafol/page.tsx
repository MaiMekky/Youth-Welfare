"use client";
import React, { useState, useEffect, useCallback, Suspense } from "react";
import "../styles/applyForm.css";
import HeaderCard from "../components/HeaderCard";
import ApplyForm from "../components/ApplyForm";
import MyRequests from "../components/MyRequests";
import Cards from "../components/Cards";
import { useSearchParams, useRouter } from "next/navigation";

function TakafolContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const activeTab = searchParams.get("tab") ?? "info";

  const handleTabChange = (tab: string) => {
    router.push(`/Student/takafol?tab=${tab}`);
  };

  const navigateToRequests = () => {
    router.push(`/Student/takafol?tab=myRequests`);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  };

  const [showAlert, setShowAlert] = useState(false);
  const [requestsStatus, setRequestsStatus] = useState<string[]>([]);

  useEffect(() => {
    if (requestsStatus.length === 0) return;
    const hasUnderReview = requestsStatus.some(
      (st) => st === "موافقة مبدئية" || st === "under-review" || st === "under_review"
    );
    setShowAlert(hasUnderReview);
  }, [requestsStatus]);

  const handleStatusesLoaded = useCallback((statuses: string[]) => {
    setRequestsStatus(statuses);
  }, []);

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
            onStatusesLoaded={handleStatusesLoaded}
          />
        );
      default:
        return <Cards />;
    }
  };

  return (
    <div className="student-takafol-page">
      <HeaderCard activeTab={activeTab} onTabChange={handleTabChange} />
      <div className="student-page-wrap">{renderContent()}</div>
    </div>
  );
}

export default function TakafolPage() {
  return (
    <Suspense fallback={<div className="student-takafol-page"><div className="student-page-wrap">Loading...</div></div>}>
      <TakafolContent />
    </Suspense>
  );
}