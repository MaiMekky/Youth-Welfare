"use client";
import React, { useState } from "react";
import HeadPage from "./components/HeadPage";
import RequestDetails from "./components/RequestDetails";
import CreateFamForm from "../manage/components/CreateFamForm";
import MainPage from "./components/MainPage";
import TrackRequest from "../manage/components/TrackRequest";
import FamilyDetails from "./components/FamilyDetails";

type View = "home" | "requestDetails" | "createForm" | "trackRequest" | "familyDetails";

export default function FamiliesPage() {
  const [currentView, setCurrentView] = useState<View>("home");
  const [selectedFamily, setSelectedFamily] = useState<any>(null);

  const handleNavigateToRequestDetails = () => {
    setCurrentView("requestDetails");
  };

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

  const handleViewFamilyDetails = (family: any) => {
    setSelectedFamily(family);
    setCurrentView("familyDetails");
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F3F5FD", width: "100%" }}>
      {currentView === "home" && (
        <>
          <HeadPage
            onCreateClick={handleNavigateToRequestDetails}
            onReviewClick={handleNavigateToTrackRequest}
          />
          <MainPage onViewFamilyDetails={handleViewFamilyDetails} />
        </>
      )}
      {currentView === "requestDetails" && (
        <RequestDetails
          onBack={handleNavigateBack}
          onSubmit={handleNavigateToCreateForm}
        />
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
      {currentView === "familyDetails" && selectedFamily && (
        <FamilyDetails
          family={selectedFamily}
          onBack={handleNavigateBack}
        />
      )}
    </div>
  );
}

