"use client";

import React, { useMemo, useState, useEffect } from "react";
import styles from "./Styles/page.module.css";
import StatsGrid from "./components/StatsGrid";
import Tabs from "./components/Tabs";
import Filters from "./components/Filters";
import AddButton from "./components/AddButton";
import FamiliesGrid from "./components/FamiliesGrid";

const API_URL = "http://localhost:8000/api";

export default function Page() {
  const [activeTab, setActiveTab] = useState<string>("central");
  const [selectedFaculty, setSelectedFaculty] = useState<string>("الكل");

  const [families, setFamilies] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  /* ================= API ================= */

  async function fetchFamilies() {
    try {
      setLoading(true);

      const token = localStorage.getItem("access");

      const response = await fetch(`${API_URL}/family/super_dept/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  useEffect(() => {
    fetchFamilies();
  }, []);

  /* ================= تقسيم حسب النوع ================= */

  const centralFamilies = useMemo(
    () => families.filter((f) => f.type === "مركزية"),
    [families]
  );

  const qualityFamilies = useMemo(
    () => families.filter((f) => f.type === "نوعية"),
    [families]
  );

  const ecoFamilies = useMemo(
    () => families.filter((f) => f.type === "اصدقاء البيئة"),
    [families]
  );

  /* ================= فلترة حسب الكلية ================= */

  const filteredQualityFamilies = useMemo(() => {
    return qualityFamilies.filter(
      (f) => selectedFaculty === "الكل" || f.faculty_name === selectedFaculty
    );
  }, [qualityFamilies, selectedFaculty]);

  const filteredEcoFamilies = useMemo(() => {
    return ecoFamilies.filter(
      (f) => selectedFaculty === "الكل" || f.faculty_name === selectedFaculty
    );
  }, [ecoFamilies, selectedFaculty]);

  /* ================= approve / reject ================= */

  async function handleApproveFamily(familyId: number) {
    try {
      const token = localStorage.getItem("access");

      const response = await fetch(
        `${API_URL}/family/super_dept/${familyId}/final_approve/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}), // بعض الـ APIs يحتاج body حتى لو فاضي
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Approve error:", errorData);
        throw new Error("فشل الموافقة");
      }

      alert("تم قبول الأسرة بنجاح");
      fetchFamilies();
    } catch (err) {
      alert("فشل قبول الأسرة");
    }
  }

  async function handleRejectFamily(familyId: number) {
    try {
      const token = localStorage.getItem("access");

      const response = await fetch(
        `${API_URL}/family/super_dept/${familyId}/reject/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Reject error:", errorData);
        throw new Error("فشل الرفض");
      }

      alert("تم رفض الأسرة");
      fetchFamilies();
    } catch (err) {
      alert("فشل رفض الأسرة");
    }
  }

  /* ================= Stats ================= */

  function getStats() {
    const qualityPending = qualityFamilies.filter(
      (f) => f.status === "في الانتظار"
    ).length;

    const ecoPending = ecoFamilies.filter((f) => f.status === "في الانتظار")
      .length;

    const totalNonPending =
      qualityFamilies.length + ecoFamilies.length - (qualityPending + ecoPending);

    const totalQualityEco = qualityFamilies.length + ecoFamilies.length;

    const approvalRate = totalQualityEco
      ? Math.round((totalNonPending / totalQualityEco) * 100) + "%"
      : "0%";

    return [
      { id: 1, label: "إجمالي الأسر", value: families.length.toString() },
      { id: 2, label: "الأسر المركزية", value: centralFamilies.length.toString() },
      { id: 3, label: "طلبات في الانتظار", value: (qualityPending + ecoPending).toString() },
      { id: 4, label: "معدل الموافقة", value: approvalRate },
    ];
  }

  const stats = useMemo(() => getStats(), [families]);

  const faculties = [
    "الكل",
    "كلية الطب",
    "كلية الحاسبات",
    "كلية الهندسة",
    "كلية الزراعة",
    "كلية الفنون التطبيقية",
  ];

  const qualityPendingCount = qualityFamilies.filter(
    (f) => f.status === "في الانتظار"
  ).length;

  const ecoPendingCount = ecoFamilies.filter((f) => f.status === "في الانتظار")
    .length;

  /* ================= UI ================= */

  return (
    <div className={styles.container}>
      <header className={styles.headerCard}>
        <h1 className={styles.pageTitle}>إدارة الأسر الطلابية</h1>
        <p className={styles.pageSubtitle}>
          إدارة ومتابعة جميع الأسر الطلابية
        </p>
      </header>

      <StatsGrid stats={stats} />

      <Tabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        qualityPendingCount={qualityPendingCount}
        ecoPendingCount={ecoPendingCount}
      />

      {loading && (
        <div style={{ textAlign: "center", padding: 20 }}>جاري التحميل...</div>
      )}

      <main className={styles.tabContent}>
        {activeTab === "central" && (
          <>
            <AddButton />
            <FamiliesGrid families={centralFamilies} showActions={false} />
          </>
        )}

        {activeTab === "quality" && (
          <>
            <Filters
              faculties={faculties}
              selectedFaculty={selectedFaculty}
              setSelectedFaculty={setSelectedFaculty}
            />
            <FamiliesGrid
              families={filteredQualityFamilies}
              showActions={true}
              onApprove={handleApproveFamily}
              onReject={handleRejectFamily}
            />
          </>
        )}

        {activeTab === "eco" && (
          <>
            <Filters
              faculties={faculties}
              selectedFaculty={selectedFaculty}
              setSelectedFaculty={setSelectedFaculty}
            />
            <FamiliesGrid
              families={filteredEcoFamilies}
              showActions={true}
              onApprove={handleApproveFamily}
              onReject={handleRejectFamily}
            />
          </>
        )}
      </main>
    </div>
  );
}
