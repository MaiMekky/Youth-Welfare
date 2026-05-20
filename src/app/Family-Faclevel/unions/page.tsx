"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Users, Plus, ArrowLeft } from "lucide-react";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { useToast } from "@/app/context/ToastContext";
import { useRouter } from "next/navigation";
import Footer from "@/app/FacLevel/components/Footer";
import styles from "./styles/unions.module.css";

const API_URL = `${getBaseUrl()}/api`;

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

export default function FacultyUnionsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [unions, setUnions] = useState<Union[]>([]);
  const [loading, setLoading] = useState(true);

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
    fetchUnions();
  }, [fetchUnions]);

  const handleCreateUnion = () => {
    router.push(`/Family-Faclevel/unions/create`);
  };

  const handleViewUnion = (unionId: number) => {
    router.push(`/Family-Faclevel/unions/${unionId}`);
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
      <div className={styles.wideCard} onClick={() => handleViewUnion(union.family_id)}>
        <div className={styles.cardContent}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleSection}>
              <h3 className={styles.unionName}>{union.name}</h3>
              <span className={`${styles.statusBadge} ${st.cls}`}>{st.label}</span>
            </div>
            {union.description && (
              <p className={styles.unionDescription}>{union.description}</p>
            )}
          </div>
          <div className={styles.cardActions}>
            <button
              className={styles.detailsBtn}
              onClick={(e) => {
                e.stopPropagation();
                handleViewUnion(union.family_id);
              }}
            >
              <span>عرض التفاصيل</span>
              <ArrowLeft size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.loadingWrap}>
          <div className={styles.spinnerRing} />
          <p className={styles.loadingText}>جاري تحميل الاتحادات…</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      {/* ── Header ── */}
      <header className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>إدارة الاتحادات</h1>
          <p className={styles.pageSubtitle}>إدارة ومتابعة اتحادات الطلاب على مستوى الكلية</p>
        </div>
        <button className={styles.createBtn} onClick={handleCreateUnion}>
          <Plus size={20} />
          <span>إنشاء اتحاد جديد</span>
        </button>
      </header>

      {/* ── Content ── */}
      <main className={styles.contentArea}>
        {unions.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Users size={44} strokeWidth={1.2} />
            </div>
            <h3>لا توجد اتحادات بعد</h3>
            <p>لم يتم إنشاء أي اتحاد حتى الآن. ابدأ بإنشاء أول اتحاد.</p>
            <button className={styles.createBtn} onClick={handleCreateUnion}>
              <Plus size={20} />
              <span>إنشاء اتحاد جديد</span>
            </button>
          </div>
        ) : (
          <div className={styles.unionsGrid}>
            {unions.map((u) => (
              <UnionCard key={u.family_id} union={u} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
