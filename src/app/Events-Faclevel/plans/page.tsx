"use client";

import React, { useEffect, useState } from "react";
import styles from "./styles/PlansPage.module.css";
import PlansGrid from "./components/PlansGrid";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import CreatePlanModal from "./components/CreatePlanModal";
import Footer from "@/app/FacLevel/components/Footer";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";

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

const API_URL = `${getBaseUrl()}/api`;

export default function Page() {
  const router = useRouter();
  const goDetails = (id: number) => router.push(`/Events-Faclevel/plans/${id}`);

  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [openModal, setOpenModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<null | { id: number; name: string; term: number; dept?: number }>(null);

  const openCreate = () => {
    setEditingPlan(null);
    setOpenModal(true);
  };

  const openEdit = (p: PlanItem) => {
    setEditingPlan({ id: p.id, name: p.title, term: p.term, dept: p.dept });
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
      if (!token) {
        setPlans([]);
        setError("مفيش access token. برجاء تسجيل الدخول مرة اخري.");
        return;
      }

      const res = await authFetch(`${API_URL}/events/plans/list/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const text = await res.text();

      if (!res.ok) {
        setPlans([]);
        setError(`فشل تحميل الخطط (Status ${res.status})`);
        return;
      }

      const parsed = text ? JSON.parse(text) : [];
      const data: ApiPlan[] = Array.isArray(parsed) ? parsed : parsed?.results ?? [];

      if (!Array.isArray(data)) {
        setPlans([]);
        setError("الـ API رجّع شكل بيانات غير متوقع.");
        return;
      }

      setPlans(data.map(toPlanItem));
    } catch (e) {
      console.error(e);
      setPlans([]);
      setError("حصل خطأ أثناء تحميل الخطط");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.createBtnTop} onClick={openCreate}>
            <Plus size={18} />
            إنشاء خطة جديدة
          </button>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "64px 0", color: "#9ca3af", fontSize: "1rem", fontWeight: 600 }}>
            جاري تحميل الخطط...
          </div>
        )}

        {error && (
          <div style={{ textAlign: "center", padding: 16, color: "crimson" }}>{error}</div>
        )}

        {!loading && !error && plans.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📋</div>
            <p className={styles.emptyTitle}>لا توجد خطط أُنشئت حتى الآن</p>
            <p className={styles.emptySubtitle}>ابدأ بإنشاء خطتك الأولى من خلال الزر أعلاه</p>
          </div>
        ) : (
          <PlansGrid items={plans} onView={goDetails} onEdit={openEdit} />
        )}

        <CreatePlanModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          initialPlan={editingPlan}
          onSaved={fetchPlans}
        />
      </div>
      <Footer />
    </div>
  );
}
