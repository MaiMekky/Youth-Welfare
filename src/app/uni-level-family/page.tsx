"use client";

import React, { useMemo, useState, useEffect, useCallback, Suspense } from "react";
import { Users } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import styles from "./Styles/page.module.css";
import Tabs from "./components/Tabs";
import FamiliesGrid from "./components/FamiliesGrid";
import Filters from "./components/Filters";
import StatsGrid from "../SuperAdmin-family/components/StatsGrid";

const API_URL = `${getBaseUrl()}/api`;
const TAB_STORAGE_KEY = "families_active_tab";

type TabType = "central" | "quality";

function PageContent() {
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<TabType>(
    (searchParams.get("tab") as TabType) || "central"
  );

  useEffect(() => {
    const fromUrl = searchParams.get("tab") as TabType;
    if (fromUrl) {
      localStorage.setItem(TAB_STORAGE_KEY, fromUrl);
      setActiveTab(fromUrl);
    } else {
      const saved = localStorage.getItem(TAB_STORAGE_KEY) as TabType;
      if (saved) setActiveTab(saved as TabType);
    }
  }, [searchParams]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    localStorage.setItem(TAB_STORAGE_KEY, tab);
  };

  const [selectedFaculty, setSelectedFaculty]       = useState<string>("الكل");
  const [selectedFamilyType, setSelectedFamilyType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus]         = useState<string>("all");
  const [readyOnly, setReadyOnly]                   = useState<"all" | "true" | "false">("all");
  const [families, setFamilies]                     = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading]                       = useState<boolean>(false);
  const [toast, setToast]                           = useState<{ message: string; type: "success" | "error" | "warning" } | null>(null);

  /* Reset filters when switching tabs — only reset readyOnly if it differs to avoid extra fetch */
  useEffect(() => {
    setSelectedFaculty("الكل");
    setSelectedFamilyType("all");
    setSelectedStatus("all");
    setReadyOnly((prev) => (prev === "all" ? prev : "all"));
  }, [activeTab]);

  /* ── Stable fetch function ── */
  const fetchFamilies = useCallback(async (ready: "all" | "true" | "false" = "all") => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access");

      const params = new URLSearchParams();
      if (ready === "true")  params.set("ready", "true");
      if (ready === "false") params.set("ready", "false");
      const query = params.toString() ? `?${params.toString()}` : "";

      const response = await authFetch(`${API_URL}/family/super_dept/${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Unauthorized");
      const data = await response.json();
      setFamilies(data);
    } catch (error) {
      console.error("Error fetching families:", error);
      setFamilies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── Single source of truth: fetch whenever readyOnly changes ── */
  useEffect(() => {
    fetchFamilies(readyOnly);
  }, [readyOnly, fetchFamilies]);

  /* ── readyOnly handler — only updates state, effect handles fetch ── */
  const handleReadyChange = (value: "all" | "true" | "false") => {
    setReadyOnly(value);
  };

  /* ── Derived data ── */
  const centralFamilies = useMemo(() => families.filter((f) => f.type === "مركزية"), [families]);
  const qualityFamilies = useMemo(() => families.filter((f) => f.type !== "مركزية"), [families]);

  /* Client-side filters (faculty, type, status) */
  const filteredQualityFamilies = useMemo(() => {
    let filtered = qualityFamilies;
    if (selectedFaculty !== "الكل")   filtered = filtered.filter((f) => f.faculty_name === selectedFaculty);
    if (selectedFamilyType !== "all") filtered = filtered.filter((f) => f.type === selectedFamilyType);
    if (selectedStatus !== "all")     filtered = filtered.filter((f) => f.status === selectedStatus);
    return filtered;
  }, [qualityFamilies, selectedFaculty, selectedFamilyType, selectedStatus]);

  /* ── Stats ── */
  const stats = useMemo(() => {
    const ecoCount     = families.filter((f) => f.type === "اصدقاء البيئة").length;
    const qualityCount = families.filter((f) => f.type === "نوعية").length;
    return [
      { id: 1, label: "إجمالي الأسر",         value: families.length },
      { id: 2, label: "الأسر المركزية",        value: centralFamilies.length },
      { id: 3, label: "الأسر النوعية",         value: qualityCount },
      { id: 4, label: "الأسر الصديقة للبيئة", value: ecoCount },
    ];
  }, [families, centralFamilies]);

  const pendingCount = useMemo(
    () => qualityFamilies.filter((f) => f.status === "منتظر" || f.status === "في الانتظار").length,
    [qualityFamilies]
  );

  /* ── Toast ── */
  const showToast = (message: string, type: "success" | "error" | "warning") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  /* ── Approve / Reject ── */
  async function handleApproveFamily(familyId: number) {
    try {
      const token = localStorage.getItem("access");
      const response = await authFetch(`${API_URL}/family/super_dept/${familyId}/final_approve/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({}),
      });
      if (!response.ok) throw new Error("فشل الموافقة");
      setFamilies((prev) => prev.map((f) => f.family_id === familyId ? { ...f, status: "مقبول" } : f));
      showToast("تم قبول الأسرة بنجاح", "success");
    } catch {
      showToast("فشل قبول الأسرة", "error");
    }
  }

  async function handleRejectFamily(familyId: number) {
    try {
      const token = localStorage.getItem("access");
      const response = await authFetch(`${API_URL}/family/super_dept/${familyId}/reject/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({}),
      });
      if (!response.ok) throw new Error("فشل الرفض");
      setFamilies((prev) => prev.filter((f) => f.family_id !== familyId));
      showToast("تم رفض الأسرة", "warning");
    } catch {
      showToast("فشل رفض الأسرة", "error");
    }
  }

  return (
    <div className={styles.container}>
      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
          <span>{toast.message}</span>
          <button className={styles.toastClose} onClick={() => setToast(null)}>×</button>
          <div className={styles.toastProgress} />
        </div>
      )}

      <header className={styles.headerCard}>
        <div>
          <h1 className={styles.pageTitle}>إدارة الأسر الطلابية</h1>
          <p className={styles.pageSubtitle}>إدارة ومتابعة جميع الأسر الطلابية المركزية والنوعية وأصدقاء البيئة</p>
        </div>
      </header>

      <StatsGrid stats={stats} />

      <Tabs
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        pendingCount={pendingCount}
      />

      {loading && (
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>جاري تحميل الأسر...</p>
        </div>
      )}

      <main className={styles.tabContent}>
        {/* ── Central tab ── */}
        {!loading && activeTab === "central" && (
          <div className={styles.contentSection}>
            {centralFamilies.length === 0 ? (
              <EmptyState
                icon={<Users size={52} strokeWidth={1.4} />}
                title="لا توجد أسر مركزية"
                desc="لم يتم تسجيل أي أسرة مركزية حتى الآن."
              />
            ) : (
              <FamiliesGrid families={centralFamilies} showActions={false} activeTab={activeTab} />
            )}
          </div>
        )}

        {/* ── Quality + Eco combined tab ── */}
        {!loading && activeTab === "quality" && (
          <div className={styles.contentSection}>
            <Filters
              selectedFaculty={selectedFaculty}
              setSelectedFaculty={setSelectedFaculty}
              selectedFamilyType={selectedFamilyType}
              setSelectedFamilyType={setSelectedFamilyType}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              readyOnly={readyOnly}
              setReadyOnly={handleReadyChange}
            />
            {filteredQualityFamilies.length === 0 ? (
              <EmptyState
                icon={<Users size={52} strokeWidth={1.4} />}
                title="لا توجد أسر"
                desc={
                  selectedFaculty !== "الكل" || selectedFamilyType !== "all" || selectedStatus !== "all"
                    ? "لا توجد نتائج تطابق الفلاتر المحددة"
                    : "لم يتم تسجيل أي أسرة حتى الآن."
                }
              />
            ) : (
              <FamiliesGrid
                families={filteredQualityFamilies}
                showActions={true}
                activeTab={activeTab}
                onApprove={handleApproveFamily}
                onReject={handleRejectFamily}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div style={{ textAlign: "center", padding: "50px", color: "#2C3A5F" }}>
          <p>جاري تحميل الأسر...</p>
        </div>
      </div>
    }>
      <PageContent />
    </Suspense>
  );
}

function EmptyState({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>{icon}</div>
      <h3 className={styles.emptyTitle}>{title}</h3>
      <p className={styles.emptyDesc}>{desc}</p>
    </div>
  );
}