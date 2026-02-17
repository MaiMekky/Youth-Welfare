"use client";

import React, { useMemo, useState } from "react";
import styles from "./PlanDetails.module.css";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  FileText,
  Lightbulb,
  Users,
  MapPin,
  DollarSign,
  Clock,
  Eye,
  Plus,
} from "lucide-react";

type ProposedRow = {
  id: number;
  title: string;
  category: string;
  place: string;
  date: string;
  expected: string;
  cost: string;
};

type LinkedEventRow = {
  id: number;
  title: string;
  date: string;
  status: "مكتمل" | "نشط" | "قريباً";
  participants: string;
};

export default function PlanDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id ?? "");

  const plan = useMemo(
    () => ({
      id,
      title: "خطة الأنشطة الرياضية",
      subtitle: "معلومات شاملة عن الخطة والفعاليات المقترحة والفعلية",
      status: "نشطة",
      year: "2024",
      description:
        "برنامج رياضي متكامل يشمل جميع الألعاب والبطولات على مستوى الجامعة",
      activeEvents: 10,
      proposedEvents: 20,
      completedEvents: 4,
    }),
    [id]
  );

  const [proposed, setProposed] = useState<ProposedRow[]>([
    {
      id: 11,
      title: "دوري كرة القدم",
      category: "رياضي",
      place: "ملاعب الجامعة الرئيسية",
      date: "2024-03-01",
      expected: "500 طالب",
      cost: "20,000 جنيه",
    },
    {
      id: 12,
      title: "بطولة كرة السلة",
      category: "رياضي",
      place: "صالة الألعاب المغطاة",
      date: "2024-04-15",
      expected: "300 طالب",
      cost: "15,000 جنيه",
    },
  ]);

  const [linkedEvents] = useState<LinkedEventRow[]>([
    {
      id: 201,
      title: "ماراثون الجامعة",
      date: "2024-02-20",
      status: "مكتمل",
      participants: "450 مشارك",
    },
  ]);

  const total = Math.max(plan.activeEvents + plan.proposedEvents, 0);
  const completed = Math.max(plan.completedEvents, 0);

  const progress = useMemo(() => {
    if (!total) return 0;
    return Math.min(100, Math.round((completed / total) * 100));
  }, [total, completed]);

const onAddProposed = () => {
  router.push(`/uni-level-activities/plans/${id}/propsed/create`);
};

const onConvertToEvent = (rowId: number) => {
  const row = proposed.find((x) => x.id === rowId);
  if (!row) return;

  sessionStorage.setItem(
    "convert_proposed_payload",
    JSON.stringify({
      planId: id,
      row,
    })
  );

 router.push(`/uni-level-activities/plans/${id}/propsed/create?mode=convert`);

};


  const onViewProposed = (rowId: number) => {
    alert(`عرض تفاصيل المقترح #${rowId} (مؤقتاً)`);
  };

  const onViewLinkedEvent = (eventId: number) => {
    router.push(`/uni-level-activities/${eventId}`);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Top bar */}
        <div className={styles.topBar}>
          <div className={styles.headText}>
            <h1 className={styles.pageTitle}>تفاصيل الخطة</h1>
            <p className={styles.pageSubtitle}>{plan.subtitle}</p>
          </div>

          <button className={styles.backBtn} onClick={() => router.back()}>
            <ArrowRight size={18} />
            العودة للخطط
          </button>
        </div>

        {/* Hero */}
        <div className={styles.hero}>
          <div className={styles.heroTitle}>{plan.title}</div>
        </div>

        {/* Stats */}
        <div className={styles.statsRow}>
          <div className={`${styles.statCard} ${styles.statAmber}`}>
            <div className={styles.statIcon}>
              <Lightbulb size={20} />
            </div>
            <div className={styles.statText}>
              <div className={styles.statLabel}>الفعاليات المقترحة</div>
              <div className={styles.statValue}>{plan.proposedEvents}</div>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.statGreen}`}>
            <div className={styles.statIcon}>
              <CheckCircle2 size={20} />
            </div>
            <div className={styles.statText}>
              <div className={styles.statLabel}>الفعاليات المكتملة</div>
              <div className={styles.statValue}>{plan.completedEvents}</div>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.statIndigo}`}>
            <div className={styles.statIcon}>
              <FileText size={20} />
            </div>
            <div className={styles.statText}>
              <div className={styles.statLabel}>الفعاليات الفعلية</div>
              <div className={styles.statValue}>{plan.activeEvents}</div>
            </div>
          </div>
        </div>

        {/* Info grid */}
        <section className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>
              <FileText size={16} /> عنوان الخطة
            </div>
            <div className={styles.infoValue}>{plan.title}</div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>
              <CalendarDays size={16} /> العام
            </div>
            <div className={styles.infoValue} dir="ltr">
              {plan.year}
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>
              <CheckCircle2 size={16} /> الحالة
            </div>
            <div className={styles.badgeSuccess}>{plan.status}</div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>
              <Users size={16} /> نسبة الإنجاز
            </div>
            <div className={styles.infoValue}>{progress}%</div>
          </div>

          <div className={`${styles.infoCard} ${styles.infoWide}`}>
            <div className={styles.infoLabel}>
              <FileText size={16} /> وصف الخطة
            </div>
            <div className={styles.infoValue}>{plan.description}</div>
          </div>
        </section>

        {/* Proposed events table */}
        <section className={styles.tableBlock}>
          <div className={styles.tableHead}>
            <div className={styles.tableTitle}>
              تفاصيل الفعاليات المقترحة{" "}
              <span className={styles.count}>({proposed.length})</span>
            </div>

            <button className={styles.miniChipBtn} type="button" onClick={onAddProposed}>
              <Plus size={14} />
              إضافة فعالية مقترحة
            </button>
          </div>

            {/* Hint: Proposed */}
            <div className={styles.hintInfo}>
            <div className={styles.hintIcon}>
                <Lightbulb size={18} />
            </div>
            <p className={styles.hintText}>
                الفعاليات المقترحة هي تفاصيل مبدئية للتخطيط ولا تظهر للطلاب، يمكن تحويلها لفعالية لاحقاً.
            </p>
            </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                    <th>العنوان</th>
                    <th>التصنيف</th>
                    <th>المكان المقترح</th>
                    <th>التاريخ المقترح</th>
                    <th>العدد المتوقع</th>
                    <th>التكلفة التقديرية</th>
                    <th>الإجراءات</th>
                </tr>
                </thead>

                <tbody>
                {proposed.map((r) => (
                    <tr key={r.id}>
                    <td>{r.title}</td>
                    <td>{r.category}</td>
                    <td>{r.place}</td>
                    <td dir="ltr">{r.date}</td>
                    <td className={styles.cellValue}>{r.expected}</td>
                    <td className={styles.cellValue}>{r.cost}</td>

                    <td>
                        <div className={styles.rowActions}>
                        <button
                            className={styles.actionBtn}
                            type="button"
                            onClick={() => onConvertToEvent(r.id)}
                        >
                            <Plus size={16} />
                            إضافة للفعالية
                        </button>
                        </div>
                    </td>
                    </tr>
                ))}
                </tbody>

            </table>
          </div>
        </section>

        {/* Linked events table */}
        <section className={styles.tableBlock}>
          <div className={styles.tableHead}>
            <div className={styles.tableTitle}>
              الفعاليات الفعلية المرتبطة بالخطة{" "}
              <span className={styles.count}>({linkedEvents.length})</span>
            </div>
          </div>

        {/* Hint: Linked */}
        <div className={styles.hintSuccess}>
        <div className={styles.hintIcon}>
            <CheckCircle2 size={18} />
        </div>
        <p className={styles.hintText}>
            الفعاليات الفعلية هي الفعاليات المنفذة والمنشورة للطلاب للتسجيل فيها.
        </p>
        </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
             <thead>
                <tr>
                    <th>اسم الفعالية</th>
                    <th>التاريخ</th>
                    <th>الحالة</th>
                    <th>المشاركون</th>
                    <th>الإجراءات</th>
                </tr>
                </thead>

                <tbody>
                {linkedEvents.map((e) => (
                    <tr key={e.id}>
                    <td>{e.title}</td>
                    <td dir="ltr">{e.date}</td>

                    <td>
                        <span
                        className={
                            e.status === "مكتمل"
                            ? styles.statusOk
                            : e.status === "نشط"
                            ? styles.statusBlue
                            : styles.statusAmber
                        }
                        >
                        {e.status}
                        </span>
                    </td>

                    <td className={styles.cellValue}>{e.participants}</td>

                    <td>
                        <div className={styles.rowActions}>
                        <button
                            className={styles.actionBtn}
                            type="button"
                            // onClick={() => onViewLinkedEvent(e.id)}
                        >
                            <Eye size={16} />
                            عرض
                        </button>
                        </div>
                    </td>
                    </tr>
                ))}
                </tbody>

            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
