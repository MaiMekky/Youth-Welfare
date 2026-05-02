"use client";
import React from "react";

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
    <div dir="rtl" style={styles.container}>
      {/* ── Hero Header ── */}
      <div style={styles.heroHeader}>
        <h1 style={styles.heroTitle}>نظام التكافل الاجتماعي</h1>
        <div style={styles.heroSeparator} />
        <p style={styles.heroSubtitle}>
          تعرف على شروط ومتطلبات الحصول على دعم التكافل الاجتماعي بجامعة حلوان
        </p>
      </div>

      {/* ── Content Grid ── */}
      <div style={styles.contentGrid}>

        {/* 1 — Overview */}
        <SectionCard icon={<IconStar />} title="نبذة عن نظام التكافل الاجتماعي">
          <p style={styles.sectionIntro}>
            يهدف نظام التكافل الاجتماعي في جامعة حلوان إلى دعم الطلاب الذين يواجهون ظروفاً
            اقتصادية صعبة. يقدم النظام أنواعًا مختلفة من الدعم المالي والأكاديمي للطلاب المحتاجين،
            بما يضمن استمرارهم في التعليم وتحقيق أهدافهم الأكاديمية.
          </p>
        </SectionCard>

        {/* 2 — Conditions */}
        <SectionCard icon={<IconShield />} title="شروط الاستحقاق">
          <p style={styles.sectionIntro}>يجب توفر الشروط التالية للحصول على الدعم المالي:</p>
          <div style={styles.conditionsGrid}>
            {[
              { title: "الانتظام الأكاديمي", desc: "معدل تراكمي لا يقل عن 2.0" },
              { title: "الجنسية المصرية",    desc: "يجب أن يكون الطالب مصري الجنسية" },
              { title: "الدخل الشهري",       desc: "لا يتجاوز إجمالي دخل الأسرة 700 جنيه لكل فرد" },
              { title: "وضع الأسرة",         desc: "وفاة الأب أو إعاقته أو وجود ظروف اقتصادية صعبة" },
            ].map((c) => (
              <div key={c.title} style={styles.conditionItem}>
                <div>
                  <div style={styles.conditionTitle}>{c.title}</div>
                  <div style={styles.conditionDesc}>{c.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* 3 — Documents */}
        <SectionCard icon={<IconDoc />} title="المستندات المطلوبة">
          <div style={styles.noticeBox}>
            يشترط للتقدم بطلب التكافل أن يتوجه الطالب إلى الكلية لاستلام المستندات
            اللازمة لإعداد الأوراق المطلوبة.
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
            {[
              { label: "بحث اجتماعي من وحدة التضامن الاجتماعي",      required: true },
              { label: "مفردات المرتب أو المعاش أو ما يفيد بالدخل",    required: true },
              { label: "صورة البطاقة الشخصية للوالد (أو ولي الأمر)",   required: true },
              { label: "صورة البطاقة الشخصية للطالب",                  required: true },
              { label: "حيازة زراعية لسكان الأقاليم",                  required: false },
              { label: "صورة بطاقة تكافل وكرامة",                      required: false },
            ].map((doc) => (
              <div key={doc.label} style={styles.docItem}>
                <span style={styles.docLabel}>{doc.label}</span>
                <span style={doc.required ? styles.badgeRequired : styles.badgeOptional}>
                  {doc.required ? "مطلوب" : "إن وُجدت"}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* 4 — Instructions */}
        <SectionCard icon={<IconSteps />} title="إرشادات التقديم">
          <ol style={styles.stepList}>
            {[
              { title: "استلام المستندات من الكلية",           desc: "التوجه إلى الكلية لاستلام المستندات اللازمة لإجراء البحث الاجتماعي." },
              { title: "إصدار البحث الاجتماعي",               desc: "التوجه إلى وحدة التضامن الاجتماعي أو مكتب التكافل الأقرب لمحل السكن." },
              { title: "تجهيز المستندات ورفعها إلكترونيًا",   desc: "رفع المستندات من خلال صفحة تقديم الطلب مع إدخال البيانات بدقة." },
              { title: "الموافقة المبدئية وتسليم الأوراق",     desc: "عند صدور موافقة مبدئية، يتعين التوجه إلى الكلية لتسليم الأوراق الورقية." },
              { title: "القرار النهائي",                        desc: "بعد مراجعة المستندات تُصدر الكلية القرار النهائي بالقبول أو الرفض." },
            ].map((step, i) => (
              <li key={i} style={styles.stepItem}>
                <span style={styles.stepNumber}>{i + 1}</span>
                <div style={styles.stepContent}>
                  <span style={styles.stepTitle}>{step.title}</span>
                  <p style={styles.stepDesc}>{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </SectionCard>

        {/* 5 — Tracking (full-width) */}
        <SectionCard icon={<IconBell />} title="تتبع طلبك ورقم المرجع" fullWidth>
          <div style={styles.noticeBox}>
            <strong>ملاحظة مهمة: </strong>
            يرجى متابعة حالة الطلب بشكل دوري، وفي حال ظهور الموافقة المبدئية،
            يتعين على الطالب التوجه إلى الكلية لتسليم الأوراق المطلوبة.
          </div>

          <div style={styles.trackingRow}>
            <div style={styles.trackingBox}>
              <p style={styles.trackingBoxTitle}>مراحل المعالجة:</p>
              <ul style={styles.bulletList}>
                {[
                  "منتظر: تم استلام الطلب وجار مراجعته من قِبل مسؤول الكلية.",
                  "موافقة مبدئية: يرجى التوجه إلى الكلية لتسليم الأوراق المطلوبة للمراجعة.",
                  "النتيجة النهائية: يكون القرار إما مقبول أو مرفوض.",
                ].map((item) => (
                  <li key={item} style={styles.bulletItem}>{item}</li>
                ))}
              </ul>
            </div>

            <div style={styles.trackingBox}>
              <p style={styles.trackingBoxTitle}>رقم الطلب:</p>
              <p style={styles.trackingDesc}>
                ستحصل على رقم الطلب عند تقديمه. احتفظ بهذا الرقم للمتابعة والاستعلام.
              </p>
              <p style={{ ...styles.trackingDesc, fontSize: 13, color: "#6B8299" }}>
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
  fullWidth = false,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div style={{ ...styles.sectionCard, ...(fullWidth ? styles.fullWidth : {}) }}>
      {/* Gold stripe */}
      <div style={styles.goldStripe} />
      <div style={styles.cardHeader}>
        <span style={styles.cardIcon}>{icon}</span>
        <h2 style={styles.cardTitle}>{title}</h2>
      </div>
      <div style={styles.cardBody}>{children}</div>
    </div>
  );
}

/* ── Inline Styles (mirrors RequestDetails.module.css tokens) ── */
const T = {
  navy:      "#1E3A5F",
  navyMid:   "#2D5F8A",
  navyLight: "#EBF3FB",
  gold:      "#C49B3A",
  goldDark:  "#A67F2C",
  goldPale:  "#FDF6E3",
  border:    "#E2ECF5",
  bg:        "#EDF2F8",
  text:      "#1A2E42",
  mute:      "#6B8299",
  radius:    10,
  shadow:    "0 2px 12px rgba(26,46,66,.08)",
  shadowLg:  "0 8px 32px rgba(26,46,66,.14)",
  font:      "'Cairo', sans-serif",
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    direction: "rtl",
    minHeight: "100vh",
    width: "100%",
    background: T.bg,
    fontFamily: T.font,
    display: "flex",
    flexDirection: "column",
    color: T.text,
  },

  /* Hero */
  heroHeader: {
    width: "100%",
    background: `linear-gradient(140deg, ${T.navy} 0%, ${T.navyMid} 100%)`,
    padding: "24px 30px",
    textAlign: "center",
    position: "relative",
    overflow: "hidden",
    borderRadius: "16px 16px 0 0",
    boxShadow: "0 4px 18px rgba(30,58,95,.22)",
    boxSizing: "border-box",
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 900,
    color: "#fff",
    margin: "0 0 4px",
    fontFamily: T.font,
    position: "relative",
    zIndex: 1,
  },
  heroSeparator: {
    width: 48,
    height: 3,
    background: T.gold,
    borderRadius: 3,
    margin: "12px auto",
    position: "relative",
    zIndex: 1,
  },
  heroSubtitle: {
    fontSize: 14,
    fontWeight: 500,
    color: "rgba(255,255,255,.65)",
    margin: 0,
    fontFamily: T.font,
    position: "relative",
    zIndex: 1,
  },

  /* Grid */
  contentGrid: {
    width: "100%",
    padding: "28px 32px",
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 20,
    flex: 1,
    boxSizing: "border-box",
  },

  /* Card */
  sectionCard: {
    background: "#fff",
    border: `1px solid ${T.border}`,
    borderRadius: T.radius,
    boxShadow: T.shadow,
    overflow: "hidden",
    position: "relative",
    transition: "all 0.22s ease",
  },
  fullWidth: {
    gridColumn: "1 / -1",
  },
  goldStripe: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 4,
    height: "100%",
    background: `linear-gradient(180deg, ${T.gold}, ${T.goldDark})`,
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "18px 22px 14px",
    borderBottom: `1px solid ${T.border}`,
  },
  cardIcon: {
    width: 38,
    height: 38,
    borderRadius: T.radius,
    background: T.navyLight,
    border: `1px solid ${T.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    color: T.navyMid,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 800,
    color: T.navy,
    margin: 0,
    fontFamily: T.font,
  },
  cardBody: {
    padding: "18px 22px",
    lineHeight: 1.7,
  },

  /* Text */
  sectionIntro: {
    fontSize: 15,
    fontWeight: 600,
    lineHeight: 1.8,
    color: T.text,
    margin: "0 0 14px",
    fontFamily: T.font,
  },

  /* Conditions */
  conditionsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  conditionItem: {
    background: T.bg,
    borderRadius: T.radius,
    padding: "14px 16px",
    border: `1px solid ${T.border}`,
    borderRight: `3px solid ${T.gold}`,
  },
  conditionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: T.navy,
    marginBottom: 4,
    fontFamily: T.font,
  },
  conditionDesc: {
    fontSize: 13,
    fontWeight: 500,
    color: T.mute,
    lineHeight: 1.5,
    fontFamily: T.font,
  },

  /* Notice box */
  noticeBox: {
    background: T.goldPale,
    border: `1.5px dashed rgba(196,155,58,.35)`,
    borderRadius: T.radius,
    padding: "12px 16px",
    fontSize: 14,
    fontWeight: 600,
    color: "#7A5A00",
    lineHeight: 1.7,
    marginBottom: 4,
    fontFamily: T.font,
  },

  /* Doc items */
  docItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "12px 14px",
    background: T.bg,
    borderRadius: T.radius,
    border: `1px solid ${T.border}`,
  },
  docLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: T.text,
    fontFamily: T.font,
    flex: 1,
  },
  badgeRequired: {
    background: `linear-gradient(180deg, #f6e6a8, #f1dc86)`,
    color: "#7A5A00",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    border: "1px solid rgba(124,91,4,.1)",
    whiteSpace: "nowrap",
    fontFamily: T.font,
  },
  badgeOptional: {
    background: "#EEF2F6",
    color: T.mute,
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    border: "1px solid rgba(148,163,184,.15)",
    whiteSpace: "nowrap",
    fontFamily: T.font,
  },

  /* Steps */
  stepList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  stepItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: 14,
    padding: "14px 16px",
    background: T.bg,
    borderRadius: T.radius,
    borderRight: `3px solid ${T.gold}`,
  },
  stepNumber: {
    background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
    color: "#fff",
    borderRadius: "50%",
    width: 30,
    height: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 13,
    fontFamily: T.font,
    flexShrink: 0,
    boxShadow: "0 2px 8px rgba(196,155,58,.35)",
  },
  stepContent: { flex: 1 },
  stepTitle: {
    fontWeight: 700,
    fontSize: 15,
    display: "block",
    color: T.navy,
    marginBottom: 3,
    fontFamily: T.font,
  },
  stepDesc: {
    margin: 0,
    fontSize: 13,
    fontWeight: 500,
    color: T.mute,
    lineHeight: 1.6,
    fontFamily: T.font,
  },

  /* Tracking */
  trackingRow: {
    display: "flex",
    gap: 16,
    marginTop: 14,
    flexWrap: "wrap",
  },
  trackingBox: {
    flex: 1,
    minWidth: 220,
    background: T.bg,
    borderRadius: T.radius,
    border: `1px solid ${T.border}`,
    padding: "14px 16px",
    boxSizing: "border-box",
  },
  trackingBoxTitle: {
    fontWeight: 700,
    fontSize: 14,
    color: T.navy,
    margin: "0 0 10px",
    fontFamily: T.font,
    paddingBottom: 8,
    borderBottom: `2px solid ${T.gold}`,
  },
  trackingDesc: {
    margin: "8px 0",
    fontSize: 14,
    fontWeight: 500,
    color: T.text,
    lineHeight: 1.6,
    fontFamily: T.font,
  },
  bulletList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  bulletItem: {
    fontSize: 14,
    fontWeight: 500,
    color: T.text,
    paddingRight: 16,
    position: "relative",
    lineHeight: 1.6,
    fontFamily: T.font,
  },

  /* Footer */
  actionFooter: {
    position: "sticky",
    bottom: 0,
    width: "100%",
    padding: "16px 32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    background: `linear-gradient(140deg, ${T.navy} 0%, ${T.navyMid} 100%)`,
    borderTop: `3px solid ${T.gold}`,
    boxShadow: "0 -6px 24px rgba(30,58,95,.18)",
    marginTop: "auto",
    boxSizing: "border-box",
  },
  btnBack: {
    padding: "13px 28px",
    borderRadius: T.radius,
    fontFamily: T.font,
    fontWeight: 800,
    fontSize: 16,
    cursor: "pointer",
    border: "1.5px solid rgba(255,255,255,.28)",
    background: "rgba(255,255,255,.12)",
    color: "#fff",
    minWidth: 140,
    transition: "all 0.22s ease",
  },
  btnSubmit: {
    padding: "13px 28px",
    borderRadius: T.radius,
    fontFamily: T.font,
    fontWeight: 800,
    fontSize: 16,
    cursor: "pointer",
    border: "none",
    background: `linear-gradient(135deg, ${T.gold} 0%, ${T.goldDark} 100%)`,
    color: "#fff",
    boxShadow: "0 4px 16px rgba(196,155,58,.4)",
    display: "flex",
    alignItems: "center",
    gap: 8,
    minWidth: 180,
    transition: "all 0.22s ease",
  },
};