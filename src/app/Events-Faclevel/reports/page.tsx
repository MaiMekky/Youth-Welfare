"use client";

import React, { useMemo, useState } from "react";
import styles from "./Reports.module.css";
import Header from "@/app/FacLevel/components/Header";
import Footer from "@/app/FacLevel/components/Footer";
import Tabs from "@/app/Events-Faclevel/components/Tabs";
import {
  Download,
  Trophy,
  Star,
  Target,
  Users,
  Eye,
} from "lucide-react";

type TabKey = "achievements" | "events";

type AwardRow = {
  id: number;
  title: string;
  type: "شهادة" | "جائزة";
  recipient: string;
  eventName: string;
  date: string;
  status: "مسلمة" | "قيد التسليم";
};

type EventReportRow = {
  id: number;
  name: string;
  type: string;
  participants: number;
  completion: number; // %
  rating: number; // 0-5
  date: string;
};

export default function ReportsPage() {
  const [tab, setTab] = useState<TabKey>("achievements");

  const stats = useMemo(
    () => ({
      totalParticipants: 105,
      completedEvents: { done: 1, total: 3 },
      avgRating: 4.8,
      awarded: 3,
    }),
    []
  );

  const awardRows: AwardRow[] = [
    {
      id: 1,
      title: "شهادة تميز في البرمجة",
      type: "شهادة",
      recipient: "أحمد محمد علي",
      eventName: "مسابقة البرمجة السنوية",
      date: "2024-01-25",
      status: "مسلمة",
    },
  ];

  const eventRows: EventReportRow[] = [
    {
      id: 1,
      name: "ندوة حول التكنولوجيا الحديثة",
      type: "ندوة",
      participants: 45,
      completion: 98,
      rating: 4.8,
      date: "2024-01-15",
    },
  ];

  const tabs = [
    { key: "achievements" as const, label: "الإنجازات والشهادات" },
    { key: "events" as const, label: "تقارير الفعاليات" },
  ];

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.container}>
        {/* Header Row: النص يمين + الزرار شمال */}
        <div className={styles.header}>
          <div className={styles.headerText}>
            <h1 className={styles.pageTitle}>الإنجازات والتقارير</h1>
            <p className={styles.pageSubtitle}>متابعة الإنجازات وتقارير الأداء</p>
          </div>

          <button className={styles.createBtn} type="button">
            <Download size={18} />
            تصدير التقرير الشامل
          </button>
        </div>

        {/* Stats */}
        <div className={styles.statsRow}>
          <div className={`${styles.statCard} ${styles.statBlue}`}>
            <div className={styles.statIcon}>
              <Users size={20} />
            </div>
            <div className={styles.statText}>
              <div className={styles.statLabel}>إجمالي المشاركين</div>
              <div className={styles.statValue}>{stats.totalParticipants}</div>
              <div className={styles.statHint}>في جميع الفعاليات</div>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.statIndigo}`}>
            <div className={styles.statIcon}>
              <Target size={20} />
            </div>
            <div className={styles.statText}>
              <div className={styles.statLabel}>الفعاليات المكتملة</div>
              <div className={styles.statValue}>{stats.completedEvents.done}</div>
              <div className={styles.statHint}>
                من إجمالي {stats.completedEvents.total} فعاليات
              </div>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.statAmber}`}>
            <div className={styles.statIcon}>
              <Star size={20} />
            </div>
            <div className={styles.statText}>
              <div className={styles.statLabel}>متوسط الرضا</div>
              <div className={styles.statValue}>{stats.avgRating}</div>
              <div className={styles.statHint}>من 5.0 نقاط</div>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.statGreen}`}>
            <div className={styles.statIcon}>
              <Trophy size={20} />
            </div>
            <div className={styles.statText}>
              <div className={styles.statLabel}>الإنجازات الممنوحة</div>
              <div className={styles.statValue}>{stats.awarded}</div>
              <div className={styles.statHint}>شهادات وجوائز</div>
            </div>
          </div>
        </div>

        {/* Tabs (نفس component بتاعك) */}
        <Tabs<TabKey> value={tab} onChange={setTab} items={tabs} />

        {/* Content */}
        {tab === "achievements" ? (
          <section className={styles.tableCard}>
            <div className={styles.sectionHead}>
              <div className={styles.sectionTitle}>الشهادات والجوائز الممنوحة</div>
              <div className={styles.sectionSub}>
                قائمة بجميع الشهادات والجوائز التي تم منحها للطلاب
              </div>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>العنوان</th>
                    <th>النوع</th>
                    <th>المستفيد</th>
                    <th>الفعالية</th>
                    <th>التاريخ</th>
                    <th>الحالة</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {awardRows.map((r) => (
                    <tr key={r.id}>
                      <td className={styles.cellTitle}>
                        <div className={styles.titleMain}>{r.title}</div>
                        <div className={styles.titleSub}>شهادة للفائز الأول</div>
                      </td>
                      <td>
                        <span className={styles.pill}>{r.type}</span>
                      </td>
                      <td>{r.recipient}</td>
                      <td>{r.eventName}</td>
                      <td dir="ltr">{r.date}</td>
                      <td>
                        <span className={r.status === "مسلمة" ? styles.statusOk : styles.statusPending}>
                          {r.status}
                        </span>
                      </td>
                      <td>
                        <div className={styles.rowActions}>
                          <button className={styles.btnGhost} type="button">
                            <Eye size={16} />
                            عرض
                          </button>
                          <button className={styles.btnPrimary} type="button">
                            <Download size={16} />
                            تحميل
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <section className={styles.tableCard}>
            <div className={styles.sectionHead}>
              <div className={styles.sectionTitle}>تقارير أداء الفعاليات</div>
              <div className={styles.sectionSub}>تقارير مفصلة حول أداء ونتائج الفعاليات المنظمة</div>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>اسم الفعالية</th>
                    <th>النوع</th>
                    <th>المشاركون</th>
                    <th>معدل الإكمال</th>
                    <th>تقييم الرضا</th>
                    <th>التاريخ</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {eventRows.map((r) => (
                    <tr key={r.id}>
                      <td className={styles.cellTitle}>
                        <div className={styles.titleMain}>{r.name}</div>
                        <div className={styles.titleSub}>ملخص سريع عن نتائج الفعالية</div>
                      </td>
                      <td>
                        <span className={styles.pill}>{r.type}</span>
                      </td>
                      <td>{r.participants}</td>
                      <td>
                        <div className={styles.progressCell}>
                          <div className={styles.progressTrack}>
                            <div className={styles.progressFill} style={{ width: `${r.completion}%` }} />
                          </div>
                          <span className={styles.progressValue}>{r.completion}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={styles.rating}>
                          <Star size={16} />
                          {r.rating}
                        </span>
                      </td>
                      <td dir="ltr">{r.date}</td>
                      <td>
                        <div className={styles.rowActions}>
                          <button className={styles.btnGhost} type="button">
                            <Eye size={16} />
                            التفاصيل
                          </button>
                          <button className={styles.btnPrimary} type="button">
                            <Download size={16} />
                            تصدير
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
}
