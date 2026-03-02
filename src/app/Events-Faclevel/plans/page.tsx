"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "./styles/PlansPage.module.css";
import PlansGrid from "./components/PlansGrid";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import CreatePlanModal from "./components/CreatePlanModal";
import Footer from "@/app/FacLevel/components/Footer";
import Header from "@/app/FacLevel/components/Header";

type ApiPlan = {
  plan_id: number;
  name: string;
  term: number;
  faculty: number | null;
  faculty_name: string | null;
  events_count: number;
  created_at: string;
  updated_at: string;
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
};

const API_URL = "http://localhost:8000/api";

export default function Page() {
  const router = useRouter();
  const goDetails = (id: number) => router.push(`/Events-Faclevel/plans/${id}`);


  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

    // داخل Page()
  const [openModal, setOpenModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<null | { id: number; name: string; term: number }>(null);

  // Create
  const openCreate = () => {
    setEditingPlan(null);
    setOpenModal(true);
  };

  // Edit
  const openEdit = (p: PlanItem) => {
    setEditingPlan({ id: p.id, name: p.title, term: p.term });
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
    };
  };

  async function fetchPlans() {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("access");
      if (!token) {
        setPlans([]);
        setError("مفيش access token. اعملي تسجيل دخول تاني.");
        return;
      }

      const res = await fetch(`${API_URL}/events/plans/list/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const text = await res.text();
      console.log("GET plans status:", res.status);
      console.log("GET plans raw body:", text);

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

      const mapped = data.map(toPlanItem);
      setPlans(mapped);
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
  }, []);

  // (اختياري) إنشاء خطة محلياً فقط (لحد ما تربطي POST)
  const onSubmitPlan = (payload: { title: string; year: string }) => {
    const newPlan: PlanItem = {
      id: Date.now(),
      title: payload.title,
      description: "خطة جديدة (مسودة)",
      statusLabel: "مسودة",
      facultyName: null,
      term: 1,
      eventsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPlans((prev) => [newPlan, ...prev]);
    setOpenModal(false);
  };

  return (
    <div className={styles.page}>
      <Header />
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

        {loading && (
          <div style={{ textAlign: "center", padding: 16 }}>جاري تحميل الخطط...</div>
        )}

        {error && (
          <div style={{ textAlign: "center", padding: 16, color: "crimson" }}>{error}</div>
        )}

        <PlansGrid items={plans} onView={goDetails} onEdit={openEdit} />

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