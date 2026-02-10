"use client";

import React, { useState } from "react";
import "../styles/applyForm.css";
import ApplicationDetailsForm from "./ApplicationDetailsForm";

export default function ApplyForm({ onNavigateToRequests }: any) {
  const [showForm, setShowForm] = useState(false);
   const [notification, setNotification] = useState<{ message: string; type: string } | null>(null);

  const handleNotify = (message: string, type: "success" | "warning" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };
  const handleSuccess = () => {
    onNavigateToRequests();
  };
  return (
    <div className="apply-form-container">
      {!showForm && (
        <>
          <div className="note-box">
            <p>
              يرجى قراءة شروط الاستحقاق والتأكد من توفر جميع المستندات المطلوبة قبل تقديم الطلب.
            </p>
          </div>

          <div className="apply-card">
            <h3 className="apply-title">تقديم طلب دعم مالي</h3>
            <p className="apply-subtitle">
              املأ البيانات التالية بدقة وأرفق المستندات المطلوبة
            </p>

            <button className="apply-btn" onClick={() => setShowForm(true)}>
              بدء تعبئة طلب الدعم
            </button>
          </div>
        </>
      )}

     {showForm && (
  <ApplicationDetailsForm
    onSuccess={() => {
      // alert("🔔 تنبيه هام:\n\nيرجى التوجه إلى الجامعة وتسليم المستندات الرسمية خلال مدة من 3 إلى 5 أيام عمل من تاريخ تقديم الطلب لضمان مراجعة ملفك دون تأخير.");
      // // تغيير التبويب من Apply إلى MyRequests
      // const changeTab = (window as any).changeTabToMyRequests;
      // if (changeTab) changeTab();
      handleSuccess();
    }}
     onNotify={handleNotify}
  />
  
)}
{notification && (
  <div
    className={`notification ${notification.type}`}
    style={{
      position: "fixed",
      top: "20px",
      right: "20px",
      padding: "12px 20px",
      borderRadius: "8px",
      color: "#fff",
      backgroundColor:
        notification.type === "success"
          ? "#22c55e"
          : notification.type === "error"
          ? "#ef4444"
          : "#facc15",
      zIndex: 9999,
    }}
  >
    {notification.message}
  </div>
)}


    </div>
  );
}