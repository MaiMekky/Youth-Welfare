"use client";
import React, { useEffect, useState } from "react";
import Footer from "@/app/FacLevel/components/Footer";
import ReportCard from "../families-reports/components/reports";
import styles from "../families-reports/styles/report.module.css";
import { authFetch } from "@/utils/globalFetch";

interface Family {
  family_id: number;
  name: string;
  description: string;
  faculty_name: string;
  status: string;
  created_at: string;
  updated_at: string;
  min_limit: number;
  type: string;
  created_by_name: string | null;
  member_count: number;
}

export default function FamilyReportsPage() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        const token = localStorage.getItem("access");
        const res = await authFetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/family/faculty/families/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch families");
        const data = await res.json();
        setFamilies(data);
      } catch (err) {
        console.error(err);
        alert("حدث خطأ أثناء جلب الأسر");
      } finally {
        setLoading(false);
      }
    };
    fetchFamilies();
  }, []);

  const centeredStateStyle: React.CSSProperties = {
    textAlign: "center",
    padding: "64px 0",
    color: "#9ca3af",
    fontSize: "2rem",
    fontWeight: 600,
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.reportsPage}>
        <div className={styles.pageHeaderReports}>
          <h1 className={styles.pageTitleReports}>تقارير الأسر الطلابية</h1>
          <div className={styles.registeredBadge}>
            <span className={styles.badgeText}>
              {families.length} أسرة مسجلة
            </span>
          </div>
        </div>

        {loading ? (
          <div style={centeredStateStyle}>جاري تحميل الأسر...</div>
        ) : families.length === 0 ? (
          <div style={centeredStateStyle}>لا يوجد أسر مسجلة حاليًا</div>
        ) : (
          <div className={styles.reportsList}>
            {families.map((family) => (
              <ReportCard
                key={family.family_id}
                family={{
                  id: family.family_id,
                  name: family.name,
                  coordinator: family.created_by_name || "-",
                  supervisor: "-",
                  membersCount: family.member_count,
                  foundingDate: new Date(family.created_at).toLocaleDateString("ar-EG"),
                  category: family.type,
                  description: family.description,
                  status: family.status,
                }}
              />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}