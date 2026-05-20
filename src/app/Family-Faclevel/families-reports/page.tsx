"use client";
import React, { useEffect, useState } from "react";
import Footer from "@/app/FacLevel/components/Footer";
import ReportCard from "../families-reports/components/reports";
import styles from "../families-reports/styles/report.module.css";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { useToast } from "@/app/context/ToastContext";

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

const INACTIVE_FAMILIES_KEY = "inactive_family_ids";

function getStoredInactiveIds(): number[] {
  try {
    const raw = localStorage.getItem(INACTIVE_FAMILIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addStoredInactiveId(id: number) {
  const current = getStoredInactiveIds();
  if (!current.includes(id)) {
    localStorage.setItem(INACTIVE_FAMILIES_KEY, JSON.stringify([...current, id]));
  }
}

export default function FamilyReportsPage() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [deactivatingId, setDeactivatingId] = useState<number | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        const res = await authFetch(
          `${getBaseUrl()}/api/family/faculty/families/`,
          { headers: { "Content-Type": "application/json" } }
        );
        if (!res.ok) throw new Error("Failed to fetch families");
        const data: Family[] = await res.json();

        // Merge locally stored inactive IDs so status survives refresh
        const storedInactiveIds = getStoredInactiveIds();
        const merged = data.map((f) =>
          storedInactiveIds.includes(f.family_id)
            ? { ...f, status: "inactive" }
            : f
        );

        setFamilies(merged);
      } catch (err) {
        console.error(err);
        showToast("حدث خطأ أثناء جلب الأسر", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchFamilies();
  }, []);

  const handleDeactivate = async (familyId: number) => {
    setDeactivatingId(familyId);
    try {
      const res = await authFetch(
        `${getBaseUrl()}/api/family/faculty/${familyId}/deactivate/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const message =
          errorData?.detail ||
          errorData?.message ||
          "حدث خطأ أثناء إلغاء تفعيل الأسرة";
        showToast(message, "error");
        return;
      }

      // Persist to localStorage so status survives refresh
      addStoredInactiveId(familyId);

      // Update local state
      setFamilies((prev) =>
        prev.map((f) =>
          f.family_id === familyId ? { ...f, status: "inactive" } : f
        )
      );

      showToast("تم إلغاء تفعيل الأسرة بنجاح", "success");
    } catch (err) {
      console.error(err);
      showToast("حدث خطأ في الاتصال بالخادم", "error");
    } finally {
      setDeactivatingId(null);
    }
  };

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
                onDeactivate={
                  family.status !== "inactive"
                    ? () => handleDeactivate(family.family_id)
                    : undefined
                }
                isDeactivating={deactivatingId === family.family_id}
              />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}