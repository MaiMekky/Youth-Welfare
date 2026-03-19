"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import styles from "./Styles/page.module.css";
import Tabs from "./components/Tabs";
import Filters from "./components/Filters";
import FamiliesGrid from "./components/FamiliesGrid";
import { useSearchParams, useRouter } from "next/navigation";
import { Users, Leaf, Star } from "lucide-react";
import { authFetch } from "@/utils/globalFetch";

export const dynamic = "force-dynamic";

const API_URL = "http://localhost:8000/api";
const TAB_STORAGE_KEY = "families_active_tab";

type TabType = "central" | "quality" | "eco";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 32, textAlign: "center" }}>Loading...</div>}>
      <FamiliesPageClient />
    </Suspense>
  );
}

function FamiliesPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  /* ── Tab persistence: always start with searchParam or "central",
       then correct from localStorage after mount (avoids SSR mismatch) ── */
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
      if (saved) setActiveTab(saved);
    }
  }, []);

  // Persist tab to localStorage whenever it changes
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    localStorage.setItem(TAB_STORAGE_KEY, tab);
  };

  const [selectedFaculty, setSelectedFaculty] = useState<string>("الكل");
  const [selectedFamilyType, setSelectedFamilyType] = useState<string>("all");
  const [families, setFamilies] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" } | null>(null);

  /* Reset filters when switching tabs */
  useEffect(() => {
    setSelectedFaculty("الكل");
    setSelectedFamilyType("all");
  }, [activeTab]);

  /* ── API ── */
  async function fetchFamilies() {
    try {
      setLoading(true);
      const token = localStorage.getItem("access");
      const response = await authFetch(`${API_URL}/family/super_dept/`, {
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
  }

  useEffect(() => { fetchFamilies(); }, []);

  /* ── Derived data ── */
  const centralFamilies = useMemo(() => families.filter((f) => f.type === "مركزية"), [families]);
  const qualityFamilies = useMemo(() => families.filter((f) => f.type === "نوعية"), [families]);
  const ecoFamilies     = useMemo(() => families.filter((f) => f.type === "اصدقاء البيئة"), [families]);

  const filteredNonCentralFamilies = useMemo(() => {
    let filtered = families.filter((f) => f.type !== "مركزية");
    if (selectedFaculty !== "الكل") filtered = filtered.filter((f) => f.faculty_name === selectedFaculty);
    if (selectedFamilyType !== "all") filtered = filtered.filter((f) => f.type === selectedFamilyType);
    return filtered;
  }, [families, selectedFaculty, selectedFamilyType]);

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

  /* ── Stats ── */
  const qualityPendingCount = qualityFamilies.filter((f) => f.status === "في الانتظار").length;
  const ecoPendingCount     = ecoFamilies.filter((f) => f.status === "في الانتظار").length;

  const currentList = activeTab === "central"
    ? centralFamilies
    : filteredNonCentralFamilies;

  return (
    <div className={styles.container}>
      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
          <span>{toast.message}</span>
          <button className={styles.toastClose} onClick={() => setToast(null)} />
          <div className={styles.toastProgress} />
        </div>
      )}

      <header className={styles.headerCard}>
        <h1 className={styles.pageTitle}>إدارة الأسر الطلابية</h1>
        <p className={styles.pageSubtitle}>إدارة ومتابعة جميع الأسر الطلابية</p>
      </header>

      <Tabs
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        qualityPendingCount={qualityPendingCount}
        ecoPendingCount={ecoPendingCount}
      />

      {/* Loading */}
      {loading && (
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>جاري تحميل الأسر...</p>
        </div>
      )}

      <main className={styles.tabContent}>
        {/* ── Central tab ── */}
        {!loading && activeTab === "central" && (
          <>
            {centralFamilies.length === 0 ? (
              <EmptyState
                icon={<Users size={52} strokeWidth={1.4} />}
                title="لا توجد أسر مركزية"
                desc="لم يتم تسجيل أي أسرة مركزية حتى الآن."
              />
            ) : (
              <FamiliesGrid families={centralFamilies} showActions={false} activeTab={activeTab} />
            )}
          </>
        )}

        {/* ── Quality tab ── */}
        {!loading && activeTab === "quality" && (
          <>
            <Filters
              selectedFaculty={selectedFaculty}
              setSelectedFaculty={setSelectedFaculty}
              selectedFamilyType={selectedFamilyType}
              setSelectedFamilyType={setSelectedFamilyType}
            />
            {filteredNonCentralFamilies.length === 0 ? (
              <EmptyState
                icon={<Star size={52} strokeWidth={1.4} />}
                title="لا توجد أسر نوعية"
                desc={
                  selectedFaculty !== "الكل" || selectedFamilyType !== "all"
                    ? "لا توجد نتائج تطابق الفلاتر المحددة"
                    : "لم يتم تسجيل أي أسرة نوعية حتى الآن."
                }
              />
            ) : (
              <FamiliesGrid
                families={filteredNonCentralFamilies}
                showActions={true}
                activeTab={activeTab}
                onApprove={handleApproveFamily}
                onReject={handleRejectFamily}
              />
            )}
          </>
        )}

        {/* ── Eco tab ── */}
        {!loading && activeTab === "eco" && (
          <>
            <Filters
              selectedFaculty={selectedFaculty}
              setSelectedFaculty={setSelectedFaculty}
              selectedFamilyType={selectedFamilyType}
              setSelectedFamilyType={setSelectedFamilyType}
            />
            {filteredNonCentralFamilies.length === 0 ? (
              <EmptyState
                icon={<Leaf size={52} strokeWidth={1.4} />}
                title="لا توجد أسر أصدقاء البيئة"
                desc={
                  selectedFaculty !== "الكل" || selectedFamilyType !== "all"
                    ? "لا توجد نتائج تطابق الفلاتر المحددة. جرّب تغيير الفلتر."
                    : "لم يتم تسجيل أي أسرة بيئية حتى الآن."
                }
              />
            ) : (
              <FamiliesGrid
                families={filteredNonCentralFamilies}
                showActions={false}
                activeTab={activeTab}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

/* ── Reusable empty state component ── */
function EmptyState({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>{icon}</div>
      <h3 className={styles.emptyTitle}>{title}</h3>
      <p className={styles.emptyDesc}>{desc}</p>
    </div>
  );
}