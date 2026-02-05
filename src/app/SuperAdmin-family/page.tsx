// File: app/page.tsx
"use client";

import React, { useMemo, useState, useEffect } from "react";
import styles from "./Styles/page.module.css";
import StatsGrid from "./components/StatsGrid";
import Tabs from "./components/Tabs";
import Filters from "./components/Filters";
import FamiliesGrid from "./components/FamiliesGrid";

export default function Page() {
  const [activeTab, setActiveTab] = useState<string>("central");
  const [selectedFaculty, setSelectedFaculty] = useState<number>(-1);
  const [selectedFamilyType, setSelectedFamilyType] = useState<string>("all");

  const [families, setFamilies] = useState<any[]>([]);
  const [loadingFamilies, setLoadingFamilies] = useState(false);

  // Notification state
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  // Show notification helper
  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 2500);
  };

  /* ===================== Stats ===================== */
  const stats = useMemo(() => {
    const totalFamilies = families.length;
    const centralCount = families.filter((f) => f.type === "مركزية").length;
    const qualityCount = families.filter((f) => f.type === "نوعية").length;
    const ecoCount = families.filter((f) => f.type === "اصدقاء البيئة").length;

    return [
      {
        id: 1,
        label: "إجمالي الأسر",
        value: totalFamilies,
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        ),
      },
      {
        id: 2,
        label: "الأسر المركزية",
        value: centralCount,
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        ),
      },
      {
        id: 3,
        label: "الأسر النوعية",
        value: qualityCount,
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        ),
      },
      {
        id: 4,
        label: "الأسر الصديقة للبيئة",
        value: ecoCount,
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"></path>
            <path d="M12 22V2"></path>
            <path d="M17 12c0-2.76-2.24-5-5-5s-5 2.24-5 5 2.24 5 5 5"></path>
            <path d="M2 12h20"></path>
          </svg>
        ),
      },
    ];
  }, [families]);

  /* ===================== API Mapping ===================== */
  const mapFamilyFromApi = (f: any) => ({
    id: f.family_id,
    title: f.name,
    description: f.description,
    members: f.member_count,
    scope: "على مستوى الجامعة",
    createdBy: f.created_by_name || f.faculty_name,
    faculty: f.faculty, 
    type: f.type,
    status: f.status,
    // Status badge colors - matching the family badge style
    statusColor:
      f.status === "مقبول"
        ? "#D4F4DD"  // Light green (same as eco-friendly badge)
        : f.status === "منتظر"
        ? "#FFF3E0"  // Light orange
        : "#FFE0E0",  // Light red
    statusTextColor:
      f.status === "مقبول"
        ? "#2E7D32"  // Dark green text
        : f.status === "منتظر"
        ? "#E65100"  // Dark orange text
        : "#C62828",  // Dark red text
    // Family type badge colors
    badge: f.type === "اصدقاء البيئة" ? "صديقة للبيئة" : undefined,
    badgeColor: f.type === "اصدقاء البيئة" ? "#D4F4DD" : undefined,
    badgeTextColor: f.type === "اصدقاء البيئة" ? "#2E7D32" : undefined,
    needsApproval: f.status === "منتظر",
  });

  /* ===================== Faculties ===================== */
  interface Faculty {
    faculty_id: number;
    name: string;
  }

  const [faculties, setFaculties] = useState<Faculty[]>([{ faculty_id: -1, name: "الكل" }]);

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const token = localStorage.getItem("access");
        const res = await fetch(
          "http://localhost:8000/api/solidarity/super_dept/faculties/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          throw new Error("فشل في تحميل الكليات");
        }

        const data: Faculty[] = await res.json();
        setFaculties([{ faculty_id: -1, name: "الكل" }, ...data]);
      } catch (error) {
        console.error("Error fetching faculties:", error);
        showNotification("فشل في تحميل قائمة الكليات", "error");
      }
    };

    fetchFaculties();
  }, []);

  /* ===================== Families ===================== */
  useEffect(() => {
    const fetchFamilies = async () => {
      setLoadingFamilies(true);
      try {
        const token = localStorage.getItem("access");

        const params = new URLSearchParams();

        // Only send faculty_id if it's a valid number and not -1 (all)
        if (!isNaN(selectedFaculty) && selectedFaculty !== -1) {
          params.append("faculty_id", selectedFaculty.toString());
        }

        const res = await fetch(
          `http://localhost:8000/api/family/super_dept/?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          throw new Error("فشل في تحميل الأسر");
        }

        const data = await res.json();
        setFamilies(data.map(mapFamilyFromApi));
      } catch (error) {
        console.error("Error fetching families:", error);
        showNotification("فشل في تحميل بيانات الأسر", "error");
        setFamilies([]);
      } finally {
        setLoadingFamilies(false);
      }
    };

    fetchFamilies();
  }, [selectedFaculty]);

  /* ===================== Derived Lists ===================== */
  const centralFamilies = useMemo(
    () => families.filter((f) => f.type === "مركزية"),
    [families]
  );

  const qualityFamilies = useMemo(
    () => families.filter((f) => f.type !== "مركزية"),
    [families]
  );

  const filteredQualityFamilies = useMemo(() => {
    let filtered = qualityFamilies;

    // Filter by faculty
    if (selectedFaculty !== -1) {
      filtered = filtered.filter((f) => f.faculty === selectedFaculty);
    }

    // Filter by family type
    if (selectedFamilyType !== "all") {
      filtered = filtered.filter((f) => f.type === selectedFamilyType);
    }

    return filtered;
  }, [qualityFamilies, selectedFaculty, selectedFamilyType]);

  const pendingCount = useMemo(
    () => filteredQualityFamilies.filter((f) => f.needsApproval).length,
    [filteredQualityFamilies]
  );

  /* ===================== UI ===================== */
  return (
    <div className={styles.container}>
      {/* Notification */}
      {notification.show && (
        <div className={`${styles.notification} ${styles[notification.type]}`}>
          {notification.message}
        </div>
      )}

      <header className={styles.headerCard}>
        <h1 className={styles.pageTitle}>إدارة الأسر الطلابية</h1>
        <p className={styles.pageSubtitle}>
          إدارة ومتابعة جميع الأسر الطلابية المركزية والنوعية وأصدقاء البيئة
        </p>
      </header>

      <StatsGrid stats={stats} />

      <section className={styles.controlsRow}>
        <Tabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pendingCount={pendingCount}
        />
      </section>

      <main className={styles.tabContent}>
        {activeTab === "central" && (
          <div className={styles.contentSection}>
            <p className={styles.sectionDescription}>
              جميع الأسر المركزية التي تديرها الإدارة المركزية
            </p>
            <FamiliesGrid families={centralFamilies} showActions={false} />
          </div>
        )}

        {activeTab === "quality" && (
          <div className={styles.contentSection}>
            <p className={styles.sectionDescription}>
              طلبات الأسر النوعية وأصدقاء البيئة الواردة من الكليات
            </p>

            <Filters
              faculties={faculties}
              familyTypes={["all", "نوعية", "اصدقاء البيئة"]}
              selectedFaculty={selectedFaculty}
              setSelectedFaculty={setSelectedFaculty}
              selectedFamilyType={selectedFamilyType}
              setSelectedFamilyType={setSelectedFamilyType}
            />

            <FamiliesGrid
              families={filteredQualityFamilies}
              showActions={true}
            />
          </div>
        )}
      </main>
    </div>
  );
}