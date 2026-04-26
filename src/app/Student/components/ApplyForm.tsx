"use client";

import React, { useState } from "react";
import "../styles/applyForm.css";
import ApplicationDetailsForm from "./ApplicationDetailsForm";
import { useToast } from "@/app/context/ToastContext";

export default function ApplyForm({ onNavigateToRequests }: { onNavigateToRequests: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const { showToast } = useToast();

  const handleNotify = (message: string, type: "success" | "warning" | "error") => {
    showToast(message, type);
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
      // const changeTab = (window as Record<string, unknown>).changeTabToMyRequests;
      // if (changeTab) changeTab();
      handleSuccess();
    }}
     onNotify={handleNotify}
  />
  
)}

    </div>
  );
}
