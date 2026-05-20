"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Users, Plus, ArrowLeft, Building2, Globe, ChevronRight, Crown, UserCheck, Hash } from "lucide-react";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { useToast } from "@/app/context/ToastContext";
import { useRouter } from "next/navigation";
import styles from "./styles/unions.module.css";

const API_URL = `${getBaseUrl()}/api`;

interface Faculty {
  faculty_id: number;
  name: string;
}

interface Union {
  family_id: number;
  name: string;
  description: string;
  faculty: number | null;
  faculty_name: string | null;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
  president_name: string | null;
  vice_president_name: string | null;
  member_count: number;
}

export default function UnionsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [unions, setUnions] = useState<Union[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFaculty, setSelectedFaculty] = useState<string>("all");

  const fetchFaculties = useCallback(async () => {
    try {
      const response = await authFetch(`${API_URL}/family/faculties/`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) return;
      const data = await response.json();
      setFaculties(data);
    } catch (error) {
      console.warn("Error fetching faculties:", error);
    }
  }, []);

  const fetchUnions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await authFetch(`${API_URL}/family/unions/`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `خطأ: ${response.status}`);
      }
      const data = await response.json();
      setUnions(data);
    } catch (error) {
      console.error("Error fetching unions:", error);
      showToast("فشل تحميل الاتحادات", "error");
      setUnions([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchFaculties();
    fetchUnions();
  }, [fetchFaculties, fetchUnions]);

  const filteredUnions =
    selectedFaculty === "all"
      ? unions
      : unions.filter((u) => u.faculty?.toString() === selectedFaculty);

  const generalUnions = filteredUnions.filter((u) => !u.faculty);

  // Group faculty unions by faculty
  const facultyGrouped = filteredUnions
    .filter((u) => u.faculty)
    .reduce((acc, union) => {
      const key = union.faculty_name || "كلية غير محددة";
      if (!acc[key]) acc[key] = [];
      acc[key].push(union);
      return acc;
    }, {} as Record<string, Union[]>);

  const handleCreateUnion = () => {
    router.push(`/uni-level-family/unions/create`);
  };

  const handleViewUnion = (unionId: number) => {
    router.push(`/uni-level-family/unions/${unionId}`);
  };

  const statusMap: Record<string, { label: string; cls: string }> = {
    pending: { label: "قيد الانتظار", cls: styles.statusPending },
    منتظر: { label: "قيد الانتظار", cls: styles.statusPending },
    approved: { label: "مقبول", cls: styles.statusApproved },
    مقبول: { label: "مقبول", cls: styles.statusApproved },
    rejected: { label: "مرفوض", cls: styles.statusRejected },
    مرفوض: { label: "مرفوض", cls: styles.statusRejected },
  };

  const getStatus = (status: string) =>
    statusMap[status] || { label: status, cls: styles.statusPending };

  const UnionCard = ({ union }: { union: Union }) => {
    const st = getStatus(union.status);
    return (
      <div className={styles.unionCard}>
        <div className={styles.cardTop}>
          <div className={styles.cardTitleRow}>
            <h3 className={styles.unionName}>{union.name}</h3>
            <span className={`${styles.statusBadge} ${st.cls}`}>{st.label}</span>
          </div>
          {union.description && (
            <p className={styles.unionDescription}>{union.description}</p>
          )}
        </div>

        <div className={styles.cardMeta}>
          <div className={styles.metaItem}>
            <Crown size={14} className={styles.metaIcon} />
            <span className={styles.metaLabel}>الرئيس</span>
            <span className={styles.metaValue}>{union.president_name || "—"}</span>
          </div>
          <div className={styles.metaItem}>
            <UserCheck size={14} className={styles.metaIcon} />
            <span className={styles.metaLabel}>نائب الرئيس</span>
            <span className={styles.metaValue}>{union.vice_president_name || "—"}</span>
          </div>
          <div className={styles.metaItem}>
            <Hash size={14} className={styles.metaIcon} />
            <span className={styles.metaLabel}>الأعضاء</span>
            <span className={styles.metaValue}>{union.member_count}</span>
          </div>
        </div>

        <button
          className={styles.detailsBtn}
          onClick={() => handleViewUnion(union.family_id)}
        >
          <span>عرض التفاصيل</span>
          <ArrowLeft size={15} />
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingWrap}>
          <div className={styles.spinnerRing} />
          <p className={styles.loadingText}>جاري تحميل الاتحادات…</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <Users size={26} />
          </div>
          <div>
            <h1 className={styles.title}>إدارة الاتحادات</h1>
            <p className={styles.subtitle}>إدارة ومتابعة اتحادات الطلاب على مستوى الكليات</p>
          </div>
        </div>
        <button className={styles.createBtn} onClick={handleCreateUnion}>
          <Plus size={18} />
          <span>إنشاء اتحاد جديد</span>
        </button>
      </header>

      {/* ── Stats ── */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.statTotal}`}>
          <div className={styles.statBg} />
          <div className={styles.statIconWrap}>
            <Users size={22} />
          </div>
          <div className={styles.statBody}>
            <p className={styles.statLabel}>إجمالي الاتحادات</p>
            <p className={styles.statValue}>{unions.length}</p>
          </div>
          <div className={styles.statDecor}>{unions.length}</div>
        </div>

        <div className={`${styles.statCard} ${styles.statFaculty}`}>
          <div className={styles.statBg} />
          <div className={styles.statIconWrap}>
            <Building2 size={22} />
          </div>
          <div className={styles.statBody}>
            <p className={styles.statLabel}>اتحادات الكليات</p>
            <p className={styles.statValue}>{unions.filter((u) => u.faculty).length}</p>
          </div>
          <div className={styles.statDecor}>{unions.filter((u) => u.faculty).length}</div>
        </div>

        <div className={`${styles.statCard} ${styles.statGeneral}`}>
          <div className={styles.statBg} />
          <div className={styles.statIconWrap}>
            <Globe size={22} />
          </div>
          <div className={styles.statBody}>
            <p className={styles.statLabel}>اتحادات عامة</p>
            <p className={styles.statValue}>{unions.filter((u) => !u.faculty).length}</p>
          </div>
          <div className={styles.statDecor}>{unions.filter((u) => !u.faculty).length}</div>
        </div>
      </div>

      {/* ── Filter ── */}
      {faculties.length > 0 && (
        <div className={styles.filterBar}>
          <span className={styles.filterLabel}>تصفية حسب الكلية</span>
          <div className={styles.filterGroup}>
            <button
              className={`${styles.filterChip} ${selectedFaculty === "all" ? styles.filterChipActive : ""}`}
              onClick={() => setSelectedFaculty("all")}
            >
              الكل
            </button>
            {faculties.map((f) => (
              <button
                key={f.faculty_id}
                className={`${styles.filterChip} ${selectedFaculty === f.faculty_id.toString() ? styles.filterChipActive : ""}`}
                onClick={() => setSelectedFaculty(f.faculty_id.toString())}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Content ── */}
      {unions.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Users size={44} strokeWidth={1.2} />
          </div>
          <h3>لا توجد اتحادات بعد</h3>
          <p>لم يتم إنشاء أي اتحاد حتى الآن. ابدأ بإنشاء أول اتحاد.</p>
          <button className={styles.createBtn} onClick={handleCreateUnion}>
            <Plus size={18} />
            <span>إنشاء اتحاد جديد</span>
          </button>
        </div>
      ) : (
        <div className={styles.sectionsWrap}>

          {/* General Unions */}
          {(selectedFaculty === "all" || generalUnions.length > 0) && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionHeaderLeft}>
                  <div className={`${styles.sectionDot} ${styles.dotGeneral}`} />
                  <Globe size={18} />
                  <h2 className={styles.sectionTitle}>الاتحادات العامة</h2>
                  <span className={styles.sectionCount}>{generalUnions.length}</span>
                </div>
              </div>
              {generalUnions.length === 0 ? (
                <p className={styles.noItems}>لا توجد اتحادات عامة</p>
              ) : (
                <div className={styles.cardsGrid}>
                  {generalUnions.map((u) => (
                    <UnionCard key={u.family_id} union={u} />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Faculty Unions */}
          {Object.keys(facultyGrouped).length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionHeaderLeft}>
                  <div className={`${styles.sectionDot} ${styles.dotFaculty}`} />
                  <Building2 size={18} />
                  <h2 className={styles.sectionTitle}>اتحادات الكليات</h2>
                  <span className={styles.sectionCount}>
                    {Object.values(facultyGrouped).flat().length}
                  </span>
                </div>
              </div>

              <div className={styles.facultiesWrap}>
                {Object.entries(facultyGrouped).map(([facultyName, facultyUnions]) => (
                  <div key={facultyName} className={styles.facultyGroup}>
                    <div className={styles.facultyGroupHeader}>
                      <ChevronRight size={16} className={styles.chevron} />
                      <span className={styles.facultyGroupName}>{facultyName}</span>
                      <span className={styles.facultyCount}>{facultyUnions.length} اتحاد</span>
                    </div>
                    <div className={styles.cardsGrid}>
                      {facultyUnions.map((u) => (
                        <UnionCard key={u.family_id} union={u} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}