"use client";

import React, { useEffect, useState } from "react";
import Footer from "@/app/FacLevel/components/Footer";
import FamRequests from "../families-requests/components/famRequests";
import styles from "../families-requests/styles/famRequests.module.css";
import { authFetch } from "@/utils/globalFetch";

export default function FamilyRequestsPage() {
  const [requests, setRequests] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("access");

        const res = await authFetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/family/faculty/pending_requests/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch requests");

        const data = await res.json();
        setRequests(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  return (
    <div className={styles.pageWrapper}>


      <header className={styles.pageHeaderFamily}>
        <div className={styles.headerContentFamily}>
          <h1 className={styles.pageTitle}>طلبات الأسر الطلابية</h1>
          <p className={styles.pageSubtitle}>
            مراجعة ومتابعة طلبات إنشاء وإعتماد الأسر الطلابية
          </p>
        </div>
      </header>

      <main className={styles.contentArea}>
  {loading ? (
    <p>جاري التحميل...</p>
  ) : requests.length === 0 ? (
    <div className={styles.emptyState}>
      لا يوجد طلبات للأسر الطلابية
    </div>
  ) : (
    <div className={styles.requestsGrid}>
      {requests.map((request) => (
        <FamRequests key={request.family_id as string} request={request} />
      ))}
    </div>
  )}
</main>

      <Footer />
    </div>
  );
}
