"use client";
import React from "react";
import styles from "../styles/Cards.module.css";

/* ── Inline SVG icons ── */
const IconStar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l3 6 6 .5-4.5 3.5L20 20l-8-5-8 5 1.5-7L1 8.5 7 8z"/>
  </svg>
);

const IconShield = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const IconDoc = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
  </svg>
);

const IconSteps = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
  </svg>
);

const IconBell = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

export default function Cards() {
  return (
    <div className={styles.cardsContainer}>
      {/* ── Hero Header ── */}
      <div className={styles.heroHeader}>
        <h1 className={styles.heroTitle}>نظام التكافل الاجتماعي</h1>
        <div className={styles.heroSeparator} />
        <p className={styles.heroSubtitle}>
          تعرف على شروط ومتطلبات الحصول على دعم التكافل الاجتماعي بجامعة العاصمة
        </p>
      </div>

      {/* ── Content Grid ── */}
      <div className={styles.contentGrid}>

        {/* 1 — Overview */}
        <SectionCard icon={<IconStar />} title="نبذة عن نظام التكافل الاجتماعي">
          <p className={styles.sectionIntro}>
            يهدف نظام التكافل الاجتماعي في جامعة العاصمة إلى دعم الطلاب الذين يواجهون ظروفاً
            اقتصادية صعبة. يقدم النظام أنواعًا مختلفة من الدعم المالي والأكاديمي للطلاب المحتاجين،
            بما يضمن استمرارهم في التعليم وتحقيق أهدافهم الأكاديمية.
          </p>
        </SectionCard>

        {/* 2 — Conditions */}
        <SectionCard icon={<IconShield />} title="شروط الاستحقاق">
          <p className={styles.sectionIntro}>يجب توفر الشروط التالية للحصول على الدعم المالي:</p>
          <div className={styles.conditionsGrid}>
            {[
              { title: "الانتظام الأكاديمي", desc: "معدل تراكمي لا يقل عن 2.0" },
              { title: "الجنسية المصرية",    desc: "يجب أن يكون الطالب مصري الجنسية" },
              { title: "الدخل الشهري",       desc: "لا يتجاوز إجمالي دخل الأسرة 2000 جنيه لكل فرد" },
              { title: "وضع الأسرة",         desc: "وفاة الأب أو إعاقته أو وجود ظروف اقتصادية صعبة" },
            ].map((c) => (
              <div key={c.title} className={styles.conditionItem}>
                <div className={styles.conditionTitle}>{c.title}</div>
                <div className={styles.conditionDesc}>{c.desc}</div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* 3 — Documents */}
        <SectionCard icon={<IconDoc />} title="المستندات المطلوبة">
          <div className={styles.noticeBox}>
            يشترط للتقدم بطلب التكافل أن يتوجه الطالب إلى الكلية لاستلام المستندات
            اللازمة لإعداد الأوراق المطلوبة.
          </div>
          <div className={styles.docList}>
            {[
              { label: "بحث اجتماعي من وحدة التضامن الاجتماعي",      required: true },
              { label: "مفردات المرتب أو المعاش أو ما يفيد بالدخل",    required: true },
              { label: "صورة البطاقة الشخصية للوالد (أو ولي الأمر)",   required: true },
              { label: "صورة البطاقة الشخصية للطالب",                  required: true },
              { label: "حيازة زراعية لسكان الأقاليم",                  required: false },
              { label: "صورة بطاقة تكافل وكرامة",                      required: false },
            ].map((doc) => (
              <div key={doc.label} className={styles.docItem}>
                <span className={styles.docLabel}>{doc.label}</span>
                <span className={doc.required ? styles.badgeRequired : styles.badgeOptional}>
                  {doc.required ? "مطلوب" : "إن وُجدت"}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* 4 — Instructions */}
        <SectionCard icon={<IconSteps />} title="إرشادات التقديم">
          <ol className={styles.stepList}>
            {[
              { title: "استلام المستندات من الكلية",           desc: "التوجه إلى الكلية لاستلام المستندات اللازمة لإجراء البحث الاجتماعي." },
              { title: "إصدار البحث الاجتماعي",               desc: "التوجه إلى وحدة التضامن الاجتماعي أو مكتب التكافل الأقرب لمحل السكن." },
              { title: "تجهيز المستندات ورفعها إلكترونيًا",   desc: "رفع المستندات من خلال صفحة تقديم الطلب مع إدخال البيانات بدقة." },
              { title: "الموافقة المبدئية وتسليم الأوراق",     desc: "عند صدور موافقة مبدئية، يتعين التوجه إلى الكلية لتسليم الأوراق الورقية." },
              { title: "القرار النهائي",                        desc: "بعد مراجعة المستندات تُصدر الكلية القرار النهائي بالقبول أو الرفض." },
            ].map((step, i) => (
              <li key={i} className={styles.stepItem}>
                <span className={styles.stepNumber}>{i + 1}</span>
                <div className={styles.stepContent}>
                  <span className={styles.stepTitle}>{step.title}</span>
                  <p className={styles.stepDesc}>{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </SectionCard>

        {/* 5 — Tracking (full-width) */}
        <SectionCard icon={<IconBell />} title="تتبع طلبك ورقم المرجع" fullWidth>
          <div className={styles.noticeBox}>
            <strong>ملاحظة مهمة: </strong>
            يرجى متابعة حالة الطلب بشكل دوري، وفي حال ظهور الموافقة المبدئية،
            يتعين على الطالب التوجه إلى الكلية لتسليم الأوراق المطلوبة.
          </div>
          <div className={styles.trackingRow}>
            <div className={styles.trackingBox}>
              <p className={styles.trackingBoxTitle}>مراحل المعالجة:</p>
              <ul className={styles.bulletList}>
                {[
                  "منتظر: تم استلام الطلب وجار مراجعته من قِبل مسؤول الكلية.",
                  "موافقة مبدئية: يرجى التوجه إلى الكلية لتسليم الأوراق المطلوبة للمراجعة.",
                  "النتيجة النهائية: يكون القرار إما مقبول أو مرفوض.",
                ].map((item) => (
                  <li key={item} className={styles.bulletItem}>{item}</li>
                ))}
              </ul>
            </div>
            <div className={styles.trackingBox}>
              <p className={styles.trackingBoxTitle}>رقم الطلب:</p>
              <p className={styles.trackingDesc}>
                ستحصل على رقم الطلب عند تقديمه. احتفظ بهذا الرقم للمتابعة والاستعلام.
              </p>
              <p className={styles.trackingDescMute}>
                يمكنك إيجاد رقم الطلب من خلال قسم «طلباتي».
              </p>
            </div>
          </div>
        </SectionCard>

      </div>
    </div>
  );
}

/* ── Reusable Section Card ── */
function SectionCard({
  icon,
  title,
  children,
  fullWidth = false, // ← FIXED: was incorrectly defaulting to true
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className={`${styles.sectionCard}${fullWidth ? ` ${styles.fullWidth}` : ""}`}>
      <div className={styles.goldStripe} />
      <div className={styles.cardHeader}>
        <span className={styles.cardIcon}>{icon}</span>
        <h2 className={styles.cardTitle}>{title}</h2>
      </div>
      <div className={styles.cardBody}>{children}</div>
    </div>
  );
}