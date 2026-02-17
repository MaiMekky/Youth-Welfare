"use client";

import React, { useState } from "react";
import styles from "./styles/PlansPage.module.css";
import PlansGrid from "./components/PlansGrid";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import CreatePlanModal from "./components/CreatePlanModal";

export type PlanItem = {
  id: number;
  title: string;
  description: string;
  yearLabel: string;
  statusLabel: "نشطة" | "مسودة";
  activeEvents: number;
  proposedEvents: number;
  completedEvents: number;
};

export default function Page() {
  const router = useRouter();
  const goDetails = (id: number) => router.push(`/uni-level-activities/plans/${id}`);

  const [openCreate, setOpenCreate] = useState(false);

  const [plans, setPlans] = useState<PlanItem[]>([
    {
      id: 1,
      title: "خطة الأنشطة الرياضية",
      description: "برنامج رياضي متكامل يشمل جميع الألعاب والبطولات على مستوى الجامعة",
      yearLabel: "العام: 2024",
      statusLabel: "نشطة",
      activeEvents: 10,
      proposedEvents: 20,
      completedEvents: 4,
    },
    {
      id: 2,
      title: "خطة الأنشطة الثقافية والفنية",
      description: "خطة شاملة للأنشطة الثقافية والفنية على مستوى الجامعة للعام الدراسي",
      yearLabel: "العام: 2024",
      statusLabel: "نشطة",
      activeEvents: 8,
      proposedEvents: 15,
      completedEvents: 5,
    },
    {
      id: 3,
      title: "خطة الأنشطة الاجتماعية والتطوعية",
      description: "مبادرات اجتماعية وتطوعية لخدمة المجتمع وتنمية روح المسؤولية لدى الطلاب",
      yearLabel: "العام: 2024",
      statusLabel: "مسودة",
      activeEvents: 0,
      proposedEvents: 12,
      completedEvents: 0,
    },
  ]);

  const onSubmitPlan = (payload: { title: string; year: string }) => {
    const newPlan: PlanItem = {
      id: Date.now(),
      title: payload.title,
      description: "—",
      yearLabel: `العام: ${payload.year}`,
      statusLabel: "مسودة",
      activeEvents: 0,
      proposedEvents: 0,
      completedEvents: 0,
    };
    setPlans((prev) => [newPlan, ...prev]);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerText}>
            <h1 className={styles.pageTitle}>إدارة الخطط</h1>
            <p className={styles.pageSubtitle}>إنشاء وإدارة خطط الأنشطة السنوية</p>
          </div>

          <button className={styles.createBtnTop} onClick={() => setOpenCreate(true)}>
            <Plus size={18} />
            إنشاء خطة جديدة
          </button>
        </div>

        <PlansGrid items={plans} onView={goDetails} />

        <CreatePlanModal
          open={openCreate}
          onClose={() => setOpenCreate(false)}
          onSubmitPlan={onSubmitPlan}
        />
      </div>
    </div>
  );
}
