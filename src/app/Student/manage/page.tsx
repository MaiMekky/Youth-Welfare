"use client";
import React, { useState } from "react";
import TrackReqButton from "./components/TrackReqButton";
import Dashboard from "./components/Dashboard";
import CreateFamForm from "./components/CreateFamForm";
import TrackRequest from "./components/TrackRequest";

type View = "home" | "createForm" | "trackRequest";

export default function FamilyManagePage() {
  const [currentView, setCurrentView] = useState<View>("home");

  const handleFormSubmitSuccess = () => {
    localStorage.setItem("familyRequestStatus", "pending");
    localStorage.setItem("familyRequestSubmitted", "true");
    setCurrentView("trackRequest");
  };

  return (
    <main className="student-manage-page">
      {/* ── HOME VIEW ── */}
      {currentView === "home" && (
        <>
          {/* Full-width hero card with both action buttons */}
          <TrackReqButton
            onCreateClick={() => setCurrentView("createForm")}
            onReviewClick={() => setCurrentView("trackRequest")}
          />

          {/* Dashboard content in the constrained layout wrapper */}
          <div className="student-page-wrap">
            <Dashboard />
          </div>
        </>
      )}

      {/* ── CREATE FORM VIEW ── */}
      {currentView === "createForm" && (
        <CreateFamForm
          onBack={() => setCurrentView("home")}
          onSubmitSuccess={handleFormSubmitSuccess}
        />
      )}

      {/* ── TRACK REQUEST VIEW ── */}
      {currentView === "trackRequest" && (
        <TrackRequest onBack={() => setCurrentView("home")} />
      )}
    </main>
  );
}