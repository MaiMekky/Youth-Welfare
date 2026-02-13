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
  const [selectedFaculty, setSelectedFaculty] = useState<string>("الكل"); // Changed to string for faculty name
  const [selectedFamilyType, setSelectedFamilyType] = useState<string>("all"); // Added family type filter

  const [families, setFamilies] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  /* ================= Reset filters when switching tabs ================= */
  useEffect(() => {
    setSelectedFaculty("الكل");
    setSelectedFamilyType("all");
  }, [activeTab]);

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

  /* ================= فلترة حسب الكلية ونوع الأسرة ================= */

  const filteredQualityFamilies = useMemo(() => {
    let filtered = qualityFamilies;

    // Filter by faculty name
    if (selectedFaculty !== "الكل") {
      filtered = filtered.filter((f) => f.faculty_name === selectedFaculty);
    }

    // Filter by family type (if not "all")
    if (selectedFamilyType !== "all") {
      filtered = filtered.filter((f) => f.type === selectedFamilyType);
    }

    return filtered;
  }, [qualityFamilies, selectedFaculty, selectedFamilyType]);

  const filteredEcoFamilies = useMemo(() => {
    let filtered = ecoFamilies;

    // Filter by faculty name
    if (selectedFaculty !== "الكل") {
      filtered = filtered.filter((f) => f.faculty_name === selectedFaculty);
    }

    // Filter by family type (if not "all")
    if (selectedFamilyType !== "all") {
      filtered = filtered.filter((f) => f.type === selectedFamilyType);
    }

    return filtered;
  }, [ecoFamilies, selectedFaculty, selectedFamilyType]);

  /* ================= Combined filtered families for "quality" and "eco" tabs ================= */
  
  const filteredNonCentralFamilies = useMemo(() => {
    let filtered = families.filter((f) => f.type !== "مركزية");

    // Filter by faculty name
    if (selectedFaculty !== "الكل") {
      filtered = filtered.filter((f) => f.faculty_name === selectedFaculty);
    }

    // Filter by family type
    if (selectedFamilyType !== "all") {
      filtered = filtered.filter((f) => f.type === selectedFamilyType);
    }

    return filtered;
  }, [families, selectedFaculty, selectedFamilyType]);

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
          body: JSON.stringify({}),
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

      {/* <StatsGrid stats={stats} /> */}

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
              selectedFaculty={selectedFaculty}
              setSelectedFaculty={setSelectedFaculty}
              selectedFamilyType={selectedFamilyType}
              setSelectedFamilyType={setSelectedFamilyType}
            />
            <FamiliesGrid
              families={filteredNonCentralFamilies}
              showActions={true}
              onApprove={handleApproveFamily}
              onReject={handleRejectFamily}
            />
          </>
        )}

        {activeTab === "eco" && (
          <>
            <Filters
              selectedFaculty={selectedFaculty}
              setSelectedFaculty={setSelectedFaculty}
              selectedFamilyType={selectedFamilyType}
              setSelectedFamilyType={setSelectedFamilyType}
            />
            <FamiliesGrid
              families={filteredNonCentralFamilies}
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