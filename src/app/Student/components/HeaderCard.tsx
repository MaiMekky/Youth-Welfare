// app/student/components/HeaderCard.tsx
import React from "react";
import "../styles/headerCard.css";

export default function HeaderCard() {
  return (
    <header className="header-card-container">
      <div className="header-card">
        <h1 className="header-title">التكافل الاجتماعي</h1>
        <p className="header-subtitle">نظام الدعم المالي والاجتماعي لطلاب الجامعة</p>
      </div>

      <div className="header-tabs">
        <button className="tab-btn active">معلومات الدعم</button>
        <button className="tab-btn">تقديم طلب</button>
        <button className="tab-btn">طلباتي</button>
      </div>
    </header>
  );
}