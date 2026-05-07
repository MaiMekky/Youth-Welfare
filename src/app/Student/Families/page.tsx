"use client";
import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import HeadPage from "./components/HeadPage";
import RequestDetails from "./components/RequestDetails";
import CreateFamForm from "../manage/components/CreateFamForm";
import MainPageRefactored from "./components/MainPageRefactored";
import TrackRequest from "../manage/components/TrackRequest";
import FamilyDetails from "./familyDetails/[id]/FamilyDetails";
import type { ProgramFamily } from "./types";

type View = "home" | "requestDetails" | "createForm" | "trackRequest" | "familyDetails";

// ─── Storage key for persisting the selected family across navigation ──────────
const FAMILY_STORAGE_KEY = "selected_family_details";

function saveFamilyToStorage(family: ProgramFamily) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(FAMILY_STORAGE_KEY, JSON.stringify(family));
  } catch { /* ignore */ }
}

function loadFamilyFromStorage(): ProgramFamily | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(FAMILY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// ─── Inner component that reads search params ────────────────────────────────

function FamiliesPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Derive current view and family from URL
  const viewParam = searchParams.get("view") as View | null;
  const familyIdParam = searchParams.get("id");

  const [currentView, setCurrentView] = useState<View>(viewParam ?? "home");
  const [selectedFamily, setSelectedFamily] = useState<ProgramFamily | null>(() => {
    // On first render, restore family from sessionStorage if URL says familyDetails
    if (viewParam === "familyDetails") return loadFamilyFromStorage();
    return null;
  });

  // Keep state in sync when the URL changes (e.g. browser back/forward)
  useEffect(() => {
    const view = (searchParams.get("view") as View) ?? "home";
    setCurrentView(view);

    if (view === "familyDetails") {
      const stored = loadFamilyFromStorage();
      if (stored) setSelectedFamily(stored);
    }
  }, [searchParams]);

  // ── Navigation helpers ────────────────────────────────────────────────────

  const navigate = useCallback((view: View, params?: Record<string, string>) => {
    const qs = new URLSearchParams(params ?? {});
    if (view !== "home") qs.set("view", view);
    const queryString = qs.toString();
    router.push(queryString ? `?${queryString}` : window.location.pathname);
  }, [router]);

  const handleNavigateBack = useCallback(() => {
    // If there's browser history to go back to, use it; otherwise fall back to home
    if (window.history.length > 1) {
      router.back();
    } else {
      navigate("home");
    }
  }, [router, navigate]);

  const handleNavigateToRequestDetails = useCallback(() => {
    navigate("requestDetails");
  }, [navigate]);

  const handleNavigateToCreateForm = useCallback(() => {
    navigate("createForm");
  }, [navigate]);

  const handleNavigateToTrackRequest = useCallback(() => {
    navigate("trackRequest");
  }, [navigate]);

  const handleFormSubmitSuccess = useCallback(() => {
    localStorage.setItem("familyRequestStatus", "pending");
    localStorage.setItem("familyRequestSubmitted", "true");
    navigate("trackRequest");
  }, [navigate]);

  const handleViewFamilyDetails = useCallback((family: ProgramFamily) => {
    // Persist family data so a hard-refresh or back-forward navigation can restore it
    saveFamilyToStorage(family);
    setSelectedFamily(family);
    navigate("familyDetails", { id: String(family.id) });
  }, [navigate]);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="student-families-page">
      {currentView === "home" && (
        <>
          <HeadPage
            onCreateClick={handleNavigateToRequestDetails}
            onReviewClick={handleNavigateToTrackRequest}
          />
          <MainPageRefactored onViewFamilyDetails={handleViewFamilyDetails} />
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

      {/* Fallback: URL says familyDetails but we lost the family data */}
      {currentView === "familyDetails" && !selectedFamily && (
        <div style={{ padding: 32, textAlign: "center", direction: "rtl" }}>
          <p>تعذّر تحميل بيانات الأسرة. يرجى العودة والمحاولة مرة أخرى.</p>
          <button onClick={() => navigate("home")}>العودة للرئيسية</button>
        </div>
      )}
    </div>
  );
}

// ─── Public export — wraps inner component in Suspense ───────────────────────
// Required because useSearchParams() suspends in Next.js App Router.

export default function FamiliesPage() {
  return (
    <Suspense fallback={<div style={{ padding: 32 }} />}>
      <FamiliesPageInner />
    </Suspense>
  );
}