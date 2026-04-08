"use client";

import React, { useEffect, useState } from "react";
import styles from "./styles/PlansPage.module.css";
import PlansGrid from "./components/PlansGrid";
import { useRouter } from "next/navigation";
import { Plus, ClipboardList } from "lucide-react";
import CreatePlanModal from "./components/CreatePlanModal";
import { authFetch } from "@/utils/globalFetch";

type ApiPlan = {
  plan_id: number;
  name: string;
  term: number;
  faculty: number | null;
  faculty_name: string | null;
  events_count: number;
  created_at: string;
  updated_at: string;
  dept: number;
};

export type PlanItem = {
  id: number;
  title: string;
  description: string;
  statusLabel: "نشطة" | "مسودة";
  facultyName: string | null;
  term: number;
  eventsCount: number;
  createdAt: string;
  updatedAt: string;
  dept?: number;
};

const API_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/api`;

export default function Page() {
  const router = useRouter();
  const goDetails = (id: number) => router.push(`/uni-level-activities/plans/${id}`);

  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<null | { id: number; name: string; term: number; dept_id?: number }>(null);

  const openCreate = () => { setEditingPlan(null); setOpenModal(true); };
  const openEdit   = (p: PlanItem) => {
    setEditingPlan({ id: p.id, name: p.title, term: p.term, dept_id: p.dept });
    setOpenModal(true);
  };

  const toPlanItem = (p: ApiPlan): PlanItem => {
    const hasEvents = (p.events_count ?? 0) > 0;
    return {
      id: p.plan_id,
      title: p.name,
      description: p.faculty_name ? `خطة خاصة بـ ${p.faculty_name}` : "خطة عامة على مستوى الجامعة",
      statusLabel: hasEvents ? "نشطة" : "مسودة",
      facultyName: p.faculty_name,
      term: p.term,
      eventsCount: p.events_count ?? 0,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      dept: p.dept,
    };
  };

  async function fetchPlans() {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("access");
      if (!token) { setPlans([]); setError("مفيش access token. برجاء تسجيل الدخول مرة اخري."); return; }

      const res = await authFetch(`${API_URL}/events/plans/list/`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });

      const text = await res.text();
      if (!res.ok) { setPlans([]); setError(`فشل تحميل الخطط (Status ${res.status})`); return; }

      const parsed = text ? JSON.parse(text) : [];
      const data: ApiPlan[] = Array.isArray(parsed) ? parsed : parsed?.results ?? [];
      if (!Array.isArray(data)) { setPlans([]); setError("الـ API رجّع شكل بيانات غير متوقع."); return; }

      setPlans(data.map(toPlanItem));
    } catch (e) {
      console.error(e);
      setPlans([]);
      setError("حصل خطأ أثناء تحميل الخطط");
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchPlans(); }, []);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerText}>
            <h1 className={styles.pageTitle}>إدارة الخطط</h1>
            <p className={styles.pageSubtitle}>إنشاء وإدارة خطط الأنشطة</p>
          </div>
          <button className={styles.createBtnTop} onClick={openCreate}>
            <Plus size={18} />
            إنشاء خطة جديدة
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className={styles.loadingWrap}>
            <div className={styles.spinner} />
            <p className={styles.loadingText}>جاري تحميل الخطط...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className={styles.errorBanner}>{error}</div>
        )}

        {/* Empty state */}
        {!loading && !error && plans.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <ClipboardList size={52} strokeWidth={1.4} />
            </div>
            <h3 className={styles.emptyTitle}>لا توجد خطط حتى الآن</h3>
            <p className={styles.emptyDesc}>
              لم يتم إنشاء أي خطط بعد. ابدأ بإضافة خطة جديدة لربط الفعاليات بها.
            </p>
            <button className={styles.emptyBtn} onClick={openCreate}>
              <Plus size={16} />
              إنشاء أول خطة
            </button>
          </div>
        )}

        {/* Plans grid */}
        {!loading && !error && plans.length > 0 && (
          <PlansGrid items={plans} onView={goDetails} onEdit={openEdit} />
        )}

        <CreatePlanModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          initialPlan={editingPlan}
          onSaved={fetchPlans}
        />
      </div>
    </div>
  );
}