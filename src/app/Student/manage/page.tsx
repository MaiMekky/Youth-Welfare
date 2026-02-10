"use client";
import React, { useState } from "react";
import TrackReqButton from "./components/TrackReqButton";
import Dashboard from "./components/Dashboard";
import CreateFamForm from "./components/CreateFamForm";
import TrackRequest from "./components/TrackRequest";

type View = "home" | "createForm" | "trackRequest";

export default function FamilyManagePage() {
  const [currentView, setCurrentView] = useState<View>("home");

  const handleNavigateToCreateForm = () => {
    setCurrentView("createForm");
  };

  const handleNavigateToTrackRequest = () => {
    setCurrentView("trackRequest");
  };

  const handleNavigateBack = () => {
    setCurrentView("home");
  };

  const handleFormSubmitSuccess = () => {
    // After successful form submission, save status to localStorage
    localStorage.setItem("familyRequestStatus", "pending");
    localStorage.setItem("familyRequestSubmitted", "true");
    setCurrentView("trackRequest");
  };

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#F3F5FD", width: "100%", direction: "rtl" }}>
      {currentView === "home" && (
        <>
          <TrackReqButton 
            onCreateClick={handleNavigateToCreateForm}
            onReviewClick={handleNavigateToTrackRequest}
          />
          <Dashboard />
        </>
      )}

      {currentView === "createForm" && (
        <CreateFamForm 
          onBack={handleNavigateBack}
          onSubmitSuccess={handleFormSubmitSuccess}
        />
      )}

      {currentView === "trackRequest" && (
        <TrackRequest onBack={handleNavigateBack} />
      )}
    </main>
  );
}