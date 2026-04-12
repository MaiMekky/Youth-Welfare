"use client";

import React, { useState, useCallback } from "react";
import "../styles/applyForm.css";
import ApplicationDetailsForm from "./ApplicationDetailsForm";
import { useToast } from "@/app/context/ToastContext";

export default function ApplyForm({ onNavigateToRequests }: { onNavigateToRequests: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const { showToast } = useToast();

  const handleNotify = useCallback((message: string, type: "success" | "warning" | "error") => {
    showToast(message, type);
  }, [showToast]);
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
          onSuccess={handleSuccess}
          onNotify={handleNotify}
        />
      )}


    </div>
  );
}
