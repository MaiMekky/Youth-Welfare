"use client";

import React, { useState } from "react";
import Header from "@/app/FacLevel/components/Header";
import Footer from "@/app/FacLevel/components/Footer";
import FamRequests from "../families-requests/components/famRequests";
import styles from "../families-requests/styles/famRequests.module.css";

export default function FamilyRequestsPage() {
  const [activeTab, setActiveTab] = useState("creation");

  const requests = [
    {
      id: 1,
      familyName: "أسرة الذكاء الاصطناعي",
      category: "علمي",
      studentId: "202012001",
      submittedBy: "Abdullah Mohammed Al-Ahmad",
      submissionDate: "الجمعة، 10 رجب 1446 هـ",
      description:
        "أسرة متخصصة في مجال الذكاء الاصطناعي والتعلم الآلي، تهدف إلى نشر المعرفة التقنية المتقدمة",
      goals: [
        "تطوير مشاريع الذكاء الاصطناعي",
        "تنظيم ورش عمل متخصصة",
        "التعاون مع الشركات التقنية",
        "نشر البحوث العلمية في المجال",
      ],
    },
  ];

  return (
    <div className={styles.pageWrapper}>

      {/* ---- Global Header ---- */}
      <Header />

      <header className={styles.pageHeaderFamily}>
        <div className={styles.headerContentFamily}>
          <h1 className={styles.pageTitle}>طلبات الأسر الطلابية</h1>
          <p className={styles.pageSubtitle}>
            مراجعة ومتابعة طلبات إنشاء وإعتماد الأسر الطلابية
          </p>
        </div>
      </header>

      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tab} ${
            activeTab === "creation" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("creation")}
        >
          <span className={styles.tabIcon}></span>
          <span className={styles.tabText}>طلب إنشاء الأسرة</span>
          <span className={styles.tabCount}>3</span>
        </button>

        <button
          className={`${styles.tab} ${
            activeTab === "approval" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("approval")}
        >
          <span className={styles.tabIcon}></span>
          <span className={styles.tabText}>طلب اعتماد الأسرة</span>
          <span className={styles.tabCount}>0</span>
        </button>
      </div>

      <main className={styles.contentArea}>
        {activeTab === "creation" ? (
          <div className={styles.requestsGrid}>
            {requests.map((request) => (
              <FamRequests key={request.id} request={request} />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📋</div>
            <p className={styles.emptyText}>
              لا توجد طلبات اعتماد في الوقت الحالي
            </p>
          </div>
        )}
      </main>

      {/* ---- Global Footer ---- */}
      <Footer />
    </div>
  );
}
