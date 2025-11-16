"use client";

import React, { useState } from "react";
import "../styles/applyForm.css";
import ApplicationDetailsForm from "./ApplicationDetailsForm";

export default function ApplyForm() {
  const [showForm, setShowForm] = useState(false);

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

      {showForm && <ApplicationDetailsForm />}
    </div>
  );
}
