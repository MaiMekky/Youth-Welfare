// app/events/page.tsx
"use client";

import { useMemo, useState } from "react";
import styles from "../styles/EventManagment.module.css";
import { useRouter } from "next/navigation";

type Status = "active" | "completed";
type TypeTag = "global" | "internal";

type EventRow = {
  event_id: number;
  cost: number;
  capacity: number;
  startDate: string;
  endDate: string;
  location: string;
  status: Status;
  type: TypeTag;
  faculty: string;
  department: string;
  title: string;
  description: string;
  createdBy: string;
};

function PeopleIcon(props: { className?: string }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M16 11a4 4 0 1 0-3.2-6.4A5 5 0 1 1 8 16h8a5 5 0 0 1 5 5v1H3v-1a5 5 0 0 1 5-5h2"
        fill="currentColor"
        opacity="0.18"
      />
      <path
        d="M16 12a5 5 0 1 0-4.55-2.93A6 6 0 0 0 8 15h8a6 6 0 0 1 6 6v1H2v-1a6 6 0 0 1 6-6h2.35"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M16 3.6a3.4 3.4 0 1 1 0 6.8 3.4 3.4 0 0 1 0-6.8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function CheckDocIcon(props: { className?: string }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7 3h7l3 3v15a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
        fill="currentColor"
        opacity="0.18"
      />
      <path
        d="M14 3v4a1 1 0 0 0 1 1h4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M7 3h7l5 5v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="m8.2 14 2 2 5-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarIcon(props: { className?: string }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7 4h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4Z"
        fill="currentColor"
        opacity="0.18"
      />
      <path
        d="M8 2v4M16 2v4M3 9h18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M7 4h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BoltIcon(props: { className?: string }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M13 2 4 14h7l-1 8 10-14h-7l0-6Z"
        fill="currentColor"
        opacity="0.18"
      />
      <path
        d="M13 2 4 14h7l-1 8 10-14h-7l0-6Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon(props: { className?: string }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M16.5 16.5 21 21"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function EventsPage() {
  const data: EventRow[] = [
    {
      event_id: 101,
      cost: 15000,
      capacity: 500,
      startDate: "2024-03-17",
      endDate: "2024-03-15",
      location: "قاعة الاحتفالات الرئيسية",
      status: "active",
      type: "global",
      faculty: "كلية الآداب",
      department: "ثقافي",
      title: "مهرجان الثقافة السنوي",
      description: "عروض ثقافية وفنية ومعرض للكتب والفنون...",
      createdBy: "د. أحمد حسن",
    },
    {
      event_id: 102,
      cost: 8000,
      capacity: 200,
      startDate: "2024-02-25",
      endDate: "2024-02-20",
      location: "مجمع الملاعب الرياضية",
      status: "active",
      type: "internal",
      faculty: "كلية التربية الرياضية",
      department: "رياضي",
      title: "بطولة كرة قدم بين الكليات",
      description: "منافسات بين كليات مختلفة طوال الأسبوع...",
      createdBy: "الكابتن محمد علي",
    },
    {
      event_id: 103,
      cost: 5000,
      capacity: 50,
      startDate: "2024-01-12",
      endDate: "2024-01-10",
      location: "مبنى المعامل - معمل 205",
      status: "completed",
      type: "global",
      faculty: "كلية العلوم",
      department: "علمي",
      title: "ورشة الابتكار العلمي",
      description: "أبحاث ومنهجيات حديثة وتطبيقات عملية...",
      createdBy: "أ.د. سارة محمد",
    },
    {
      event_id: 104,
      cost: 2000,
      capacity: 100,
      startDate: "2024-04-05",
      endDate: "2024-04-05",
      location: "مركز خدمة المجتمع",
      status: "active",
      type: "internal",
      faculty: "كلية الخدمة الاجتماعية",
      department: "اجتماعي",
      title: "يوم خدمة المجتمع",
      description: "مبادرات تطوعية وأنشطة توعوية متنوعة...",
      createdBy: "د. فاطمة أحمد",
    },
    {
      event_id: 105,
      cost: 7500,
      capacity: 75,
      startDate: "2024-03-05",
      endDate: "2024-03-01",
      location: "قاعة العرض - مبنى A",
      status: "active",
      type: "global",
      faculty: "كلية الفنون الجميلة",
      department: "تقني",
      title: "معرض الفن الرقمي",
      description: "أعمال تستخدم تقنيات حديثة وتجارب تفاعلية...",
      createdBy: "الفنان نور حسن",
    },
    {
      event_id: 106,
      cost: 12000,
      capacity: 300,
      startDate: "2024-04-12",
      endDate: "2024-04-10",
      location: "مبنى G - القاعة الكبرى",
      status: "active",
      type: "global",
      faculty: "كلية الهندسة",
      department: "علمي",
      title: "معرض الابتكار الهندسي",
      description: "مشروعات وابتكارات طلابية وعروض عملية...",
      createdBy: "أ.د. عمر خالد",
    },
    {
      event_id: 107,
      cost: 18000,
      capacity: 150,
      startDate: "2024-01-27",
      endDate: "2024-01-25",
      location: "مدرج كلية الطب",
      status: "completed",
      type: "global",
      faculty: "كلية الطب",
      department: "علمي",
      title: "مؤتمر الأبحاث الطبية",
      description: "أحدث نتائج الأبحاث والنقاشات العلمية...",
      createdBy: "د. ليلى حسن",
    },
  ];

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | Status>("");
  const [typeFilter, setTypeFilter] = useState<"" | TypeTag>("");
  const [facultyFilter, setFacultyFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return data.filter((e) => {
      const matchesQuery =
        !query ||
        e.title.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query) ||
        e.location.toLowerCase().includes(query) ||
        e.createdBy.toLowerCase().includes(query) ||
        String(e.event_id).includes(query);

      const matchesStatus = !statusFilter || e.status === statusFilter;
      const matchesType = !typeFilter || e.type === typeFilter;
      const matchesFaculty = !facultyFilter || e.faculty === facultyFilter;
      const matchesDept = !deptFilter || e.department === deptFilter;

      return matchesQuery && matchesStatus && matchesType && matchesFaculty && matchesDept;
    });
  }, [q, statusFilter, typeFilter, facultyFilter, deptFilter]);

  const totalCapacity = useMemo(
    () => data.reduce((sum, e) => sum + e.capacity, 0),
    [data]
  );

  const completedCount = useMemo(
    () => data.filter((e) => e.status === "completed").length,
    [data]
  );

  const activeCount = useMemo(
    () => data.filter((e) => e.status === "active").length,
    [data]
  );

  const totalEvents = data.length;

  const faculties = useMemo(() => Array.from(new Set(data.map((e) => e.faculty))), [data]);
  const depts = useMemo(() => Array.from(new Set(data.map((e) => e.department))), [data]);
  const router = useRouter();

  const handleView = (eventId: number) => {
    router.push(`/SuperAdmin/Events/${eventId}`);
  };


  return (
    <div className={styles.page} dir="rtl" lang="ar">
      <div className={styles.container}>
        {/* Top Stats */}
        <section className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statIconWrap}>
              <PeopleIcon className={styles.statIcon} />
            </div>
            <div className={styles.statMeta}>
              <div className={styles.statLabel}>السعة الإجمالية</div>
              <div className={styles.statValue}>{totalCapacity}</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconWrap}>
              <CheckDocIcon className={styles.statIcon} />
            </div>
            <div className={styles.statMeta}>
              <div className={styles.statLabel}>الفعاليات المكتملة</div>
              <div className={styles.statValue}>{completedCount}</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconWrap}>
              <BoltIcon className={styles.statIcon} />
            </div>
            <div className={styles.statMeta}>
              <div className={styles.statLabel}>الفعاليات النشطة</div>
              <div className={styles.statValue}>{activeCount}</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconWrap}>
              <CalendarIcon className={styles.statIcon} />
            </div>
            <div className={styles.statMeta}>
              <div className={styles.statLabel}>إجمالي الفعاليات</div>
              <div className={styles.statValue}>{totalEvents}</div>
            </div>
          </div>
        </section>

        {/* Management Card (no graph) */}
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>إدارة الفعاليات</h2>

            <div className={styles.searchRow}>
                <div className={styles.searchWrapFull}>
                <SearchIcon className={styles.searchIcon} />
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className={styles.searchInput}
                    placeholder="ابحث باسم الفعالية، المكان، المُنشئ، الوصف أو رقم الفعالية"
                />
                </div>
            </div>
            </div>

          <div className={styles.filters}>
            <select
              className={styles.select}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="">كل الحالات</option>
              <option value="active">نشطة</option>
              <option value="completed">مكتملة</option>
            </select>

            <select
              className={styles.select}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
            >
              <option value="">كل الأنواع</option>
              <option value="global">عام</option>
              <option value="internal">داخلي</option>
            </select>

            <select
              className={styles.select}
              value={facultyFilter}
              onChange={(e) => setFacultyFilter(e.target.value)}
            >
              <option value="">كل الكليات</option>
              {faculties.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>

            <select
              className={styles.select}
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="">كل الأقسام</option>
              {depts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop Table */}
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                    <th className={styles.th}>رقم الفعالية</th>
                    <th className={styles.th}>تفاصيل الفعالية</th>
                    <th className={styles.th}>القسم</th>
                    <th className={styles.th}>الكلية</th>
                    <th className={styles.th}>النوع</th>
                    <th className={styles.th}>الحالة</th>
                    <th className={styles.th}>التاريخ والمكان</th>
                    <th className={styles.th}>السعة</th>
                    <th className={styles.th}>التكلفة</th>
                    <th className={styles.th}>إجراءات</th>
                </tr>
                </thead>

              <tbody>
                {filtered.map((e) => (
                 <tr key={e.event_id} className={styles.tr}>
                <td className={styles.td}>
                    <span className={styles.eventIdPill}>{e.event_id}</span>
                </td>

                <td className={styles.td}>
                    <div className={styles.detailsCell}>
                    <div className={styles.detailsTitle}>{e.title}</div>
                    <div className={styles.detailsDesc}>… {e.description}</div>
                    <div className={styles.detailsBy}>تم الإنشاء بواسطة: {e.createdBy}</div>
                    </div>
                </td>

                <td className={styles.td}>
                    <div className={styles.deptCell}>
                    <div className={styles.deptTop}>{e.department}</div>
                    <div className={styles.deptBottom}>{e.department}</div>
                    </div>
                </td>

                <td className={styles.td}>{e.faculty}</td>

                <td className={styles.td}>
                    <span className={`${styles.badge} ${e.type === "global" ? styles.badgeGlobal : styles.badgeInternal}`}>
                    {e.type === "global" ? "عام" : "داخلي"}
                    </span>
                </td>

                <td className={styles.td}>
                    <span className={`${styles.badge} ${e.status === "active" ? styles.badgeActive : styles.badgeCompleted}`}>
                    {e.status === "active" ? "نشطة" : "مكتملة"}
                    </span>
                </td>

                <td className={styles.td}>
                    <div className={styles.dateCell}>
                    <div className={styles.dateRange}>
                        {e.startDate} - {e.endDate}
                    </div>
                    <div className={styles.locationText}>… {e.location}</div>
                    </div>
                </td>

                <td className={styles.td}>
                    <div className={styles.capacityCell}>
                    <div className={styles.capacityValue}>{e.capacity}</div>
                    <div className={styles.capacityHint}>أقصى عدد طلاب</div>
                    </div>
                </td>

                <td className={styles.td}>{e.cost.toLocaleString("ar-EG")} ج</td>

                <td className={styles.td}>
                    <button className={styles.viewBtn} onClick={() => handleView(e.event_id)} type="button">
                    عرض التفاصيل
                    <span className={styles.btnIcon}>{/* الايقونة بتاعتك */}</span>
                    </button>
                </td>
                </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className={styles.mobileList}>
            {filtered.map((e) => (
              <article key={e.event_id} className={styles.mobileCard}>
                <div className={styles.mobileTop}>
                  <div className={styles.mobileTitle}>{e.title}</div>
                  <span className={styles.eventIdPill}>#{e.event_id}</span>
                </div>

                <div className={styles.mobileMeta}>
                  <span
                    className={`${styles.badge} ${
                      e.status === "active" ? styles.badgeActive : styles.badgeCompleted
                    }`}
                  >
                    {e.status === "active" ? "نشطة" : "مكتملة"}
                  </span>
                  <span
                    className={`${styles.badge} ${
                      e.type === "global" ? styles.badgeGlobal : styles.badgeInternal
                    }`}
                  >
                    {e.type === "global" ? "عام" : "داخلي"}
                  </span>
                  <span className={styles.mobileChip}>{e.faculty}</span>
                  <span className={styles.mobileChip}>{e.department}</span>
                </div>

                <div className={styles.mobileRow}>
                  <div className={styles.mobileLabel}>التاريخ</div>
                  <div className={styles.mobileValue}>
                    {e.startDate} - {e.endDate}
                  </div>
                </div>

                <div className={styles.mobileRow}>
                  <div className={styles.mobileLabel}>المكان</div>
                  <div className={styles.mobileValue}>… {e.location}</div>
                </div>

                <div className={styles.mobileRow}>
                  <div className={styles.mobileLabel}>السعة</div>
                  <div className={styles.mobileValue}>{e.capacity} (أقصى عدد طلاب)</div>
                </div>

                <div className={styles.mobileRow}>
                  <div className={styles.mobileLabel}>التكلفة</div>
                  <div className={styles.mobileValue}>{e.cost.toLocaleString("ar-EG")} ج</div>
                </div>

                <div className={styles.mobileDesc}>… {e.description}</div>
                <div className={styles.mobileBy}>تم الإنشاء بواسطة: {e.createdBy}</div>

                <button
                  className={styles.viewBtnMobile}
                  onClick={() => handleView(e.event_id)}
                  type="button"
                >
                  عرض التفاصيل
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
