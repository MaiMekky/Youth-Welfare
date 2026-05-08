import React, { Suspense } from "react";
import "../styles/applyForm.css";
import TakafolContent from "./TakafolContent";

export default function TakafolPage() {
  return (
    <Suspense fallback={<div className="student-takafol-page"><div className="student-page-wrap">Loading...</div></div>}>
      <TakafolContent />
    </Suspense>
  );
}