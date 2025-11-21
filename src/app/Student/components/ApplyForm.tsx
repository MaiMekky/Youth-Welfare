"use client";

import React, { useState } from "react";
import "../styles/applyForm.css";
import ApplicationDetailsForm from "./ApplicationDetailsForm";

export default function ApplyForm({ onNavigateToRequests }: any) {
  const [showForm, setShowForm] = useState(false);
  const handleSuccess = () => {
    // نرسل للبارنت إن الطلب اتبعت
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
  />
)}

    </div>
  );
}
