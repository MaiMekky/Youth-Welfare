"use client";

import React, { useState, useMemo } from "react";
import Header from "@/app/FacLevel/components/Header";
import Footer from "@/app/FacLevel/components/Footer";
import styles from "./styles/EventsPage.module.css";
import EventsHeader from "./components/EventsHeader";
import Tabs from "./components/Tabs";
import StatsGrid, { Stats } from "./components/StatsGrid";
import EventsGrid from "./components/EventsGrid";
import { useRouter } from "next/navigation";
export type EventRow = {
  id: number;
  title: string;
  plan: string;
  type: "تقني" | "ثقافي" | "رياضي" | "فني";
  status: "نشط" | "قريباً" | "مكتمل" | "في انتظار الموافقة";
  date: string; // YYYY-MM-DD
  time: string; // 10:00 ص
  place: string;
  participants: string; // 120/200
  cost: string; // مجاني / 50 جنيه
  scope: "internal" | "public";
};

const SAMPLE: EventRow[] = [
  {
    id: 1,
    title: "مؤتمر الذكاء الاصطناعي",
    plan: "خطة الأنشطة الثقافية والفنية",
    type: "تقني",
    status: "نشط",
    date: "2024-01-15",
    time: "10:00 ص",
    place: "قاعة الاحتفالات الكبرى",
    participants: "120/200",
    cost: "50 جنيه",
    scope: "public",
  },
  {
    id: 2,
    title: "معرض الفنون التشكيلية",
    plan: "خطة الأنشطة الثقافية والفنية",
    type: "ثقافي",
    status: "قريباً",
    date: "2024-01-20",
    time: "2:00 م",
    place: "مركز الفنون",
    participants: "85/150",
    cost: "مجاني",
    scope: "internal",
  },
  {
    id: 3,
    title: "دوري كرة القدم",
    plan: "خطة الأنشطة الرياضية",
    type: "رياضي",
    status: "نشط",
    date: "2024-03-01",
    time: "4:00 م",
    place: "ملعب الجامعة الرئيسية",
    participants: "320/500",
    cost: "مجاني",
    scope: "public",
  },
  {
    id: 4,
    title: "ورشة البرمجة المتقدمة",
    plan: "خطة الأنشطة التقنية",
    type: "تقني",
    status: "مكتمل",
    date: "2024-02-15",
    time: "12:00 م",
    place: "معمل الحاسبات - مبنى الهندسة",
    participants: "45/60",
    cost: "مجاني",
    scope: "internal",
  },
  {
    id: 5,
    title: "فعالية بانتظار الموافقة",
    plan: "خطة الأنشطة العامة",
    type: "فني",
    status: "في انتظار الموافقة",
    date: "2024-04-05",
    time: "11:00 ص",
    place: "قاعة المعارض",
    participants: "—",
    cost: "—",
    scope: "public",
  },
];

type TabKey = "internal" | "public";

export default function EventsFaclevelPage() {
  const [tab, setTab] = useState<TabKey>("internal");

  const rows = useMemo(() => SAMPLE.filter((e) => e.scope === tab), [tab]);

  const stats: Stats = useMemo(() => {
    const total = rows.length;

    const active = rows.filter((e) => e.status === "نشط").length;
    const completed = rows.filter((e) => e.status === "مكتمل").length;
    const pending = rows.filter((e) => e.status === "في انتظار الموافقة").length;

   
    // تقدير “الطلاب المسجلين” من نص 120/200
    const registered = rows.reduce((acc, e) => {
      const m = e.participants.match(/^(\d+)\s*\/\s*(\d+)$/);
      if (!m) return acc;
      return acc + Number(m[1] || 0);
    }, 0);

    return {
      activeEvents: active,
      registeredStudents: registered,
      completedEvents: completed,
      pendingApproval: pending,
      totalEvents: total,
    };
  }, [rows]);

  const onCreate = () => {
  router.push("/Events-Faclevel/create");
  };
  const router = useRouter();
  const onView = (id: number) => {
    router.push(`/Events-Faclevel/${id}`);
  };

  const onDelete = (id: number) => {
    alert(`حذف الفعالية #${id}`);
  };
  return (
    <div className="page-wrapper">
      <Header />
        <div className={styles.page}>
      <div className={styles.container}>
        <EventsHeader
          title="إدارة الفعاليات"
          subtitle="إنشاء، تعديل وإدارة فعاليات الجامعة"
          onCreate={onCreate}
        />

        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { key: "internal", label: "الفعاليات الداخلية" },
            { key: "public", label: "الفعاليات العامة" },
          ]}
        />

        <StatsGrid stats={stats} />

        <EventsGrid
            rows={rows}
            onView={onView}
            onDelete={onDelete}
            canDelete={tab === "internal"} 
          />

      </div>
    </div> 
     
      <Footer />
    </div>
  );
}
