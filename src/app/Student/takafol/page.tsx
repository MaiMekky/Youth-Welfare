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

  // ⬅️ دي هنجمع فيها حالة الطلبات اللي جاية من MyRequests
  const [requestsStatus, setRequestsStatus] = useState<string[]>([]);

  // ======================================================
  // 🔥 لو فيه طلب واحد على الأقل مش مقبول → alert يظهر
  // ======================================================
  useEffect(() => {
    if (requestsStatus.length === 0) return;

    // 🔥 يظهر التنويه فقط لو في طلب حالته "موافقة مبدئية"
    const hasUnderReview =
      requestsStatus.some(
        (st) =>
          st === "موافقة مبدئية" ||
          st === "under-review" ||
          st === "under_review"
      );

    setShowAlert(hasUnderReview);
  }, [requestsStatus]);

  // ======================================================
  // 🔥 لما الطالب يخلص تقديم الطلب → نروح طلباتي + alert يظهر
  // ======================================================
  const navigateToRequests = () => {
    setActiveTab("myRequests");
    setShowAlert(true);

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  // ======================================================
  // 🔥 محتوى الصفحات
  // ======================================================
  const renderContent = () => {
    switch (activeTab) {
      case "info":
        return <Cards />;

      case "apply":
        return <ApplyForm onNavigateToRequests={navigateToRequests} />;

      case "myRequests":
        return (
          <>
            {showAlert && (
              <div className="important-alert">
                <h4>تنبيه هام</h4>
                <p>
                  يرجى التوجه لرعاية شباب الكلية لتسليم المستندات الورقية خلال فترة
                  من <strong>3 إلى 5 أيام</strong> من تاريخ تقديم الطلب.
                </p>
              </div>
            )}

            <MyRequests
              onStatusesLoaded={(statuses: string[]) =>
                setRequestsStatus(statuses)
              }
            />
          </>
        );

      default:
        return <Cards />;
    }
  };

  return (
    <>
      <HeaderCard activeTab={activeTab} onTabChange={setActiveTab} />
      {renderContent()}
    </>
  );
}

