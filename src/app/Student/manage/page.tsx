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
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#f0f2f8",
        width: "100%",
        direction: "rtl",
        fontFamily: "'Cairo', sans-serif",
      }}
    >
      {/* ── HOME VIEW ── */}
      {currentView === "home" && (
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "28px 24px 48px",
          }}
        >
          {/* Full-width hero card with both action buttons */}
          <TrackReqButton
            onCreateClick={() => setCurrentView("createForm")}
            onReviewClick={() => setCurrentView("trackRequest")}
          />

          {/* Dashboard below — its own internal header is removed in favour of the hero above */}
          <Dashboard />
        </div>
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