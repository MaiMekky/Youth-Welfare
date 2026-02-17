"use client";

import React, { useMemo, useState } from "react";
import styles from "./FacEvents.module.css";
import {
  CalendarDays,
  Building2,
  Users,
  ClipboardList,
  Filter,
  Eye,
} from "lucide-react";
import { useRouter } from "next/navigation";

type EventRow = {
  id: number;
  title: string;
  college: string;
  owner: string;
  type: "تقني" | "ثقافي" | "رياضي" | "فني";
  status: "نشط" | "قريباً" | "مكتمل";
  date: string; // yyyy-mm-dd
  place: string;
  cost: string;
  participants: string; // 45/60
};

const TYPE_BADGE: Record<EventRow["type"], string> = {
  تقني: "badgeBlue",
  ثقافي: "badgePurple",
  رياضي: "badgeRed",
  فني: "badgeIndigo",
};

const STATUS_BADGE: Record<EventRow["status"], string> = {
  نشط: "statusOk",
  قريباً: "statusAmber",
  مكتمل: "statusBlue",
};

export default function Page() {
  const router = useRouter();

  const [filters, setFilters] = useState({
    year: "2024",
    plan: "الكل",
    status: "الكل",
    type: "الكل",
    college: "الكل",
  });

  const [rows] = useState<EventRow[]>([
    {
      id: 1,
      title: "ورشة البرمجة المتقدمة",
      college: "كلية الهندسة",
      owner: "د. محمد أحمد",
      type: "تقني",
      status: "نشط",
      date: "2024-02-15",
      place: "معمل الحاسبات - مبنى الهندسة",
      cost: "مجاني",
      participants: "45/60",
    },
    {
      id: 2,
      title: "معرض التخرج السنوي",
      college: "كلية الفنون الجميلة",
      owner: "د. سارة حسن",
      type: "ثقافي",
      status: "قريباً",
      date: "2024-03-20",
      place: "قاعة المعارض - كلية الفنون",
      cost: "مجاني",
      participants: "120/200",
    },
    {
      id: 3,
      title: "بطولة كرة السلة",
      college: "كلية التربية الرياضية",
      owner: "أ/ كريم محمود",
      type: "رياضي",
      status: "مكتمل",
      date: "2024-01-28",
      place: "الصالة المغطاة",
      cost: "مجاني",
      participants: "180/180",
    },
    {
      id: 4,
      title: "ورشة رسم وتشكيليات",
      college: "كلية الفنون الجميلة",
      owner: "أ/ منة الله",
      type: "فني",
      status: "نشط",
      date: "2024-02-10",
      place: "مرسم 2 - كلية الفنون",
      cost: "50 جنيه",
      participants: "30/50",
    },
    {
      id: 5,
      title: "ندوة الذكاء الاصطناعي",
      college: "كلية الحاسبات والمعلومات",
      owner: "د. أحمد علي",
      type: "تقني",
      status: "قريباً",
      date: "2024-04-05",
      place: "قاعة المؤتمرات",
      cost: "100 جنيه",
      participants: "220/300",
    },
  ]);

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const yearOk = filters.year === "الكل" ? true : r.date.startsWith(filters.year);
      const statusOk = filters.status === "الكل" ? true : r.status === filters.status;
      const typeOk = filters.type === "الكل" ? true : r.type === filters.type;
      const collegeOk = filters.college === "الكل" ? true : r.college === filters.college;
      // plan لسه dummy
      const planOk = true;
      return yearOk && statusOk && typeOk && collegeOk && planOk;
    });
  }, [rows, filters]);

  const stats = useMemo(() => {
    const totalColleges = new Set(rows.map((r) => r.college)).size;
    const totalEvents = rows.length;

    const activeEvents = rows.filter((r) => r.status === "نشط").length;

    const participantsSum = rows.reduce((acc, r) => {
      // "45/60" => 45
      const left = (r.participants.split("/")[0] || "0").trim();
      const n = Number(left.replaceAll(",", ""));
      return acc + (Number.isNaN(n) ? 0 : n);
    }, 0);

    return {
      totalColleges,
      participantsSum,
      activeEvents,
      totalEvents,
    };
  }, [rows]);

  const uniqueColleges = useMemo(() => {
    const set = Array.from(new Set(rows.map((r) => r.college)));
    return ["الكل", ...set];
  }, [rows]);

  const onView = (id: number) => {
    // لو عندك صفحة تفاصيل للجامعة نفسها
    router.push(`/uni-level-activities/${id}`);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerText}>
            <h1 className={styles.pageTitle}>مراقبة فعاليات الكليات</h1>
            <p className={styles.pageSubtitle}>عرض وإدارة الفعاليات التي أنشأتها الكليات</p>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.statGold}`}>
            <div className={styles.statIcon}><Building2 size={22} /></div>
            <div className={styles.statText}>
              <div className={styles.statLabel}>عدد الكليات</div>
              <div className={styles.statValue}>{stats.totalColleges}</div>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.statPurple}`}>
            <div className={styles.statIcon}><Users size={22} /></div>
            <div className={styles.statText}>
              <div className={styles.statLabel}>إجمالي المشاركين</div>
              <div className={styles.statValue}>{stats.participantsSum}</div>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.statGreen}`}>
            <div className={styles.statIcon}><ClipboardList size={22} /></div>
            <div className={styles.statText}>
              <div className={styles.statLabel}>الفعاليات النشطة</div>
              <div className={styles.statValue}>{stats.activeEvents}</div>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.statBlue}`}>
            <div className={styles.statIcon}><CalendarDays size={22} /></div>
            <div className={styles.statText}>
              <div className={styles.statLabel}>إجمالي الفعاليات</div>
              <div className={styles.statValue}>{stats.totalEvents}</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <section className={styles.filtersCard}>
          <div className={styles.filtersHead}>
            <div className={styles.filtersTitle}>
              <Filter size={18} />
              تصفية الفعاليات
            </div>
          </div>

          <div className={styles.filtersGrid}>
            <div className={styles.field}>
              <label className={styles.label}>الكلية</label>
              <select
                className={styles.select}
                value={filters.college}
                onChange={(e) => setFilters((p) => ({ ...p, college: e.target.value }))}
              >
                {uniqueColleges.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>نوع الفعالية</label>
              <select
                className={styles.select}
                value={filters.type}
                onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value }))}
              >
                <option value="الكل">الكل</option>
                <option value="تقني">تقني</option>
                <option value="ثقافي">ثقافي</option>
                <option value="رياضي">رياضي</option>
                <option value="فني">فني</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>الحالة</label>
              <select
                className={styles.select}
                value={filters.status}
                onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
              >
                <option value="الكل">الكل</option>
                <option value="نشط">نشط</option>
                <option value="قريباً">قريباً</option>
                <option value="مكتمل">مكتمل</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>الخطة</label>
              <select
                className={styles.select}
                value={filters.plan}
                onChange={(e) => setFilters((p) => ({ ...p, plan: e.target.value }))}
              >
                <option value="الكل">الكل</option>
                <option value="خطة 2024">خطة 2024</option>
                <option value="خطة 2025">خطة 2025</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>العام</label>
              <select
                className={styles.select}
                value={filters.year}
                onChange={(e) => setFilters((p) => ({ ...p, year: e.target.value }))}
              >
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="الكل">الكل</option>
              </select>
            </div>
          </div>
        </section>

        {/* Table */}
        <section className={styles.tableBlock}>
          <div className={styles.tableHead}>
            <div className={styles.tableTitle}>
              الفعاليات <span className={styles.count}>({filteredRows.length})</span>
            </div>
          </div>

          <div className={styles.tableWrap}>
            <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                    <th>اسم الفعالية</th>
                    <th>الكلية</th>
                    <th>مسؤول الكلية</th>
                    <th>النوع</th>
                    <th>الحالة</th>
                    <th>التاريخ</th>
                    <th>المكان</th>
                    <th>التكلفة</th>
                    <th>المشاركون</th>
                    <th>الإجراءات</th>
                </tr>
                </thead>


              <tbody>
                    {filteredRows.map((r) => (
                        <tr key={r.id}>
                        {/* اسم الفعالية */}
                        <td className={styles.cellTitle}>{r.title}</td>

                        {/* الكلية */}
                        <td>{r.college}</td>

                        {/* مسؤول */}
                        <td>{r.owner}</td>

                        {/* النوع */}
                        <td>
                            <span className={styles[TYPE_BADGE[r.type] as keyof typeof styles]}>
                            {r.type}
                            </span>
                        </td>

                        {/* الحالة */}
                        <td>
                            <span className={styles[STATUS_BADGE[r.status] as keyof typeof styles]}>
                            {r.status}
                            </span>
                        </td>

                        {/* التاريخ */}
                        <td dir="ltr">{r.date}</td>

                        {/* المكان */}
                        <td>{r.place}</td>

                        {/* التكلفة */}
                        <td className={styles.cellValue}>{r.cost}</td>

                        {/* المشاركون */}
                        <td className={styles.cellValue}>{r.participants}</td>

                        {/* الإجراءات */}
                        <td>
                            <div className={styles.rowActions}>
                            <button
                                className={styles.actionBtn}
                                type="button"
                                onClick={() => onView(r.id)}
                            >
                                <Eye size={16} />
                                عرض
                            </button>
                            </div>

                            {/* Mobile card */}
                            <div className={styles.mobileCard}>
                            <div className={styles.mobileTitle}>{r.title}</div>

                            <div className={styles.mobileBadges}>
                                <span className={styles[TYPE_BADGE[r.type] as keyof typeof styles]}>
                                {r.type}
                                </span>
                                <span className={styles[STATUS_BADGE[r.status] as keyof typeof styles]}>
                                {r.status}
                                </span>
                            </div>

                            <div className={styles.mobileGrid}>
                                <div><span className={styles.k}>الكلية:</span> {r.college}</div>
                                <div><span className={styles.k}>مسؤول:</span> {r.owner}</div>
                                <div><span className={styles.k}>التاريخ:</span> <span dir="ltr">{r.date}</span></div>
                                <div><span className={styles.k}>المكان:</span> {r.place}</div>
                                <div><span className={styles.k}>التكلفة:</span> {r.cost}</div>
                                <div><span className={styles.k}>المشاركون:</span> {r.participants}</div>
                            </div>

                            <div className={styles.mobileActions}>
                                <button className={styles.actionBtn} type="button" onClick={() => onView(r.id)}>
                                <Eye size={16} />
                                عرض
                                </button>
                            </div>
                            </div>
                        </td>
                        </tr>
                    ))}
                    </tbody>
            </table>
          </div>
        </div>
        </section>
      </div>
    </div>
  );
}
