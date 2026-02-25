"use client";

import React, { useMemo, useState } from "react";
import styles from "./styles/EventsPage.module.css";
import EventsGrid from "./component/EventsGrid";
import StatsGrid, { StatItem } from "./component/StatsGrid";
import { EventItem } from "./component/EventCard";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useParams } from "next/navigation";
export default function Page() {
  const router = useRouter();
  const goCreate = () => router.push("/uni-level-activities/create");
  const [events, setEvents] = useState<EventItem[]>([
    {
      id: 1,
      title: "مؤتمر الذكاء الاصطناعي",
      planName: "الخطة: خطة الأنشطة الثقافية والفنية",
      statusLabel: "نشط",
      statusVariant: "success",
      categoryLabel: "تقني",
      categoryVariant: "info",
      date: "2024-01-15",
      time: "10:00 ص",
      location: "قاعة الاحتفالات الكبرى",
      participantsText: "120/200 مشارك",
      priceText: "50 جنيه",
    },
    {
      id: 2,
      title: "معرض الفنون التشكيلية",
      planName: "الخطة: خطة الأنشطة الثقافية والفنية",
      statusLabel: "قريباً",
      statusVariant: "primary",
      categoryLabel: "ثقافي",
      categoryVariant: "purple",
      date: "2024-01-20",
      time: "2:00 م",
      location: "مركز الفنون",
      participantsText: "85/150 مشارك",
      priceText: "مجاني",
    },
    {
      id: 3,
      title: "دوري كرة القدم",
      planName: "الخطة: خطة الأنشطة الرياضية",
      statusLabel: "نشط",
      statusVariant: "success",
      categoryLabel: "رياضي",
      categoryVariant: "danger",
      date: "2024-03-01",
      time: "4:00 م",
      location: "ملاعب الجامعة الرئيسية",
      participantsText: "320/500 مشارك",
      priceText: "مجاني",
    },
  ]);

  const stats: StatItem[] = useMemo(
    () => [
      { title: "في انتظار الموافقة", value: "5", meta: "2 عاجل", icon: "clock", accent: "amber" },
      { title: "الفعاليات المكتملة", value: "45", meta: "+8 هذا الشهر", icon: "check", accent: "green" },
      { title: "الطلاب المسجلين", value: "2,847", meta: "+156 هذا الشهر", icon: "users", accent: "indigo" },
      { title: "الفعاليات النشطة", value: "12", meta: "+3 هذا الأسبوع", icon: "calendar", accent: "gold" },
    ],
    []
    );
  const params = useParams();
  const eventId = params?.id as string | undefined;
  const isEditMode = !!eventId;
  const onView = (id: number) => router.push(`/uni-level-activities/${id}`);
  const onEdit = (id: number) => router.push(`/uni-level-activities/create/${id}`);
  const onDelete = (id: number) => {
    if (confirm("هل تريد حذف الفعالية؟")) {
      setEvents((prev) => prev.filter((e) => e.id !== id));
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>

          <div>
            <h1 className={styles.pageTitle}>إدارة الفعاليات</h1>
            <p className={styles.pageSubtitle}>إنشاء وتعديل وإدارة فعاليات الجامعة</p>
          </div>
          
        <button className={styles.createBtnTop} onClick={goCreate}>
          <Plus size={18} />
          إنشاء فعالية جديدة
        </button>
       
        </div>

        {/* Stats */}
        <StatsGrid items={stats} />

        {/* Events Grid */}
        <div className={styles.eventsSection}>
          <EventsGrid
            items={events}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </div>
    </div>
  );
}
