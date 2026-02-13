// Events/[id]/page.tsx
"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./Eventdetails.module.css";

type Status = "active" | "completed";
type TypeTag = "global" | "internal";

type EventDetails = {
  event_id: number;
  title: string;
  type: TypeTag;
  status: Status;
  description: string;

  department: string;
  faculty: string;
  createdBy: string;
  createdAt: string;

  startDate: string;
  endDate: string;
  location: string;
  studentLimit: number;

  cost: number;
  images?: string[];

  restrictions?: string;
  rewards?: string;
};

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M18 6 6 18M6 6l12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SectionIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7 3h7l5 5v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M14 3v4a1 1 0 0 0 1 1h4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M8 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8ZM17 12a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M2.5 22v-1a6.5 6.5 0 0 1 13 0v1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M14.2 22v-1a5 5 0 0 1 9.8 0v1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 22s7-5.2 7-12a7 7 0 1 0-14 0c0 6.8 7 12 7 12Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M12 12.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 5v14M5 12h14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Badge({ variant, children }: { variant: "active" | "completed" | "global" | "internal"; children: React.ReactNode }) {
  const cls =
    variant === "active"
      ? styles.badgeActive
      : variant === "completed"
      ? styles.badgeCompleted
      : variant === "global"
      ? styles.badgeGlobal
      : styles.badgeInternal;

  return <span className={`${styles.badge} ${cls}`}>{children}</span>;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className={styles.field}>
      <div className={styles.fieldLabel}>{label}</div>
      <div className={styles.fieldValue}>{value}</div>
    </div>
  );
}

export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = Number(params?.id);

  // بيانات تجريبية — بدّليها بـ fetch من API بعدين
  const events: EventDetails[] = [
    {
      event_id: 101,
      title: "مهرجان الثقافة السنوي",
      type: "global",
      status: "active",
      description: "احتفال بتنوّع الثقافات مع عروض وفقرات فنية ومعرض للكتب والفنون.",

      department: "ثقافي",
      faculty: "كلية الآداب",
      createdBy: "د. أحمد حسن",
      createdAt: "2024-10-01",

      startDate: "2024-03-15",
      endDate: "2024-03-17",
      location: "قاعة الاحتفالات الرئيسية",
      studentLimit: 500,

      cost: 15000,
      images: ["festival_2024.jpg"],

      restrictions: "متاح لجميع الطلاب، السن 18+",
      rewards: "شهادات وجوائز مالية للفائزين",
    },
    {
      event_id: 102,
      title: "بطولة كرة قدم بين الكليات",
      type: "internal",
      status: "active",
      description: "منافسات بين كليات مختلفة طوال الأسبوع داخل مجمع الملاعب.",

      department: "رياضي",
      faculty: "كلية التربية الرياضية",
      createdBy: "الكابتن محمد علي",
      createdAt: "2024-09-20",

      startDate: "2024-02-20",
      endDate: "2024-02-25",
      location: "مجمع الملاعب الرياضية",
      studentLimit: 200,

      cost: 8000,
      images: ["sports_2024.png"],
      restrictions: "الاشتراك للفرق المسجلة فقط",
      rewards: "كأس + ميداليات",
    },
  ];

  const event = useMemo(() => events.find((e) => e.event_id === eventId), [events, eventId]);

  return (
    <div className={styles.page} dir="rtl" lang="ar">
      <div className={styles.overlay}>
        <div className={styles.modal} role="dialog" aria-modal="true">
          <div className={styles.modalHeader}>
            <div>
              <h1 className={styles.title}>تفاصيل الفعالية</h1>
              <p className={styles.subtitle}>معلومات شاملة عن الفعالية بما في ذلك المتطلبات والمواصفات.</p>
            </div>

            <button className={styles.closeBtn} type="button" onClick={() => router.back()} aria-label="إغلاق">
              <XIcon className={styles.closeIcon} />
            </button>
          </div>

          {!event ? (
            <div className={styles.empty}>
              <div className={styles.emptyTitle}>لم يتم العثور على الفعالية</div>
              <div className={styles.emptyText}>تأكدي من رقم الفعالية في الرابط.</div>
            </div>
          ) : (
            <div className={styles.body}>
              {/* 1) Basic Information */}
              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardIcon}>
                    <SectionIcon className={styles.sectionIcon} />
                  </span>
                  <h2 className={styles.cardTitle}>المعلومات الأساسية</h2>
                </div>

                <div className={styles.grid}>
                  <Field label="رقم الفعالية" value={<span className={styles.idPill}>{event.event_id}</span>} />
                  <Field label="العنوان" value={event.title} />

                  <Field
                    label="النوع"
                    value={<Badge variant={event.type}>{event.type === "global" ? "عام" : "داخلي"}</Badge>}
                  />
                  <Field
                    label="الحالة"
                    value={<Badge variant={event.status}>{event.status === "active" ? "نشطة" : "مكتملة"}</Badge>}
                  />
                </div>

                <div className={styles.longField}>
                  <div className={styles.fieldLabel}>الوصف</div>
                  <div className={styles.longValue}>{event.description}</div>
                </div>
              </section>

              {/* 2) Organizational Information */}
              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardIcon}>
                    <UsersIcon className={styles.sectionIcon} />
                  </span>
                  <h2 className={styles.cardTitle}>معلومات تنظيمية</h2>
                </div>

                <div className={styles.grid}>
                  <Field label="القسم" value={event.department} />
                  <Field label="الكلية" value={event.faculty} />
                  <Field label="تم الإنشاء بواسطة" value={event.createdBy} />
                  <Field label="تاريخ الإنشاء" value={event.createdAt} />
                </div>
              </section>

              {/* 3) Event Details */}
              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardIcon}>
                    <PinIcon className={styles.sectionIcon} />
                  </span>
                  <h2 className={styles.cardTitle}>تفاصيل الفعالية</h2>
                </div>

                <div className={styles.grid}>
                  <Field label="تاريخ البدء" value={event.startDate} />
                  <Field label="تاريخ الانتهاء" value={event.endDate} />
                  <Field label="المكان" value={event.location} />
                  <Field label="حد الطلاب" value={`${event.studentLimit} طالب`} />
                  <Field label="التكلفة" value={`${event.cost.toLocaleString("ar-EG")} ج`} />
                  <Field
                    label="الصور"
                    value={
                      event.images?.length ? (
                        <div className={styles.files}>
                          {event.images.map((f) => (
                            <span key={f} className={styles.filePill}>
                              {f}
                            </span>
                          ))}
                        </div>
                      ) : (
                        "لا يوجد"
                      )
                    }
                  />
                </div>
              </section>

              {/* 4) Additional Information */}
              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardIcon}>
                    <PlusIcon className={styles.sectionIcon} />
                  </span>
                  <h2 className={styles.cardTitle}>معلومات إضافية</h2>
                </div>

                <div className={styles.gridTwo}>
                  <div className={styles.longField}>
                    <div className={styles.fieldLabel}>القيود</div>
                    <div className={styles.longValue}>{event.restrictions || "لا يوجد"}</div>
                  </div>

                  <div className={styles.longField}>
                    <div className={styles.fieldLabel}>المكافآت</div>
                    <div className={styles.longValue}>{event.rewards || "لا يوجد"}</div>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
