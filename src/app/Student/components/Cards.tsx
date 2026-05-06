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
    <>
      {/* ── Responsive CSS injected once ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');

        * { box-sizing: border-box; }

        .cards-container {
          direction: rtl;
          min-height: 100vh;
          width: 100%;
          background: #EDF2F8;
          font-family: 'Cairo', sans-serif;
          display: flex;
          flex-direction: column;
          color: #1A2E42;
        }

        /* ── Hero ── */
        .hero-header {
          width: 100%;
          background: linear-gradient(140deg, #1E3A5F 0%, #2D5F8A 100%);
          padding: clamp(16px, 4vw, 28px) clamp(16px, 5vw, 32px);
          text-align: center;
          position: relative;
          overflow: hidden;
          border-radius: 16px 16px 0 0;
          box-shadow: 0 4px 18px rgba(30,58,95,.22);
        }
        .hero-title {
          font-size: clamp(18px, 4vw, 26px);
          font-weight: 900;
          color: #fff;
          margin: 0 0 4px;
          font-family: 'Cairo', sans-serif;
          position: relative;
          z-index: 1;
        }
        .hero-separator {
          width: 48px;
          height: 3px;
          background: #C49B3A;
          border-radius: 3px;
          margin: 10px auto;
          position: relative;
          z-index: 1;
        }
        .hero-subtitle {
          font-size: clamp(12px, 2.5vw, 14px);
          font-weight: 500;
          color: rgba(255,255,255,.65);
          margin: 0;
          font-family: 'Cairo', sans-serif;
          position: relative;
          z-index: 1;
        }

        /* ── Grid ── */
        .content-grid {
          width: 100%;
          padding: clamp(16px, 4vw, 28px) clamp(12px, 4vw, 32px);
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: clamp(12px, 2vw, 20px);
          flex: 1;
        }

        @media (max-width: 640px) {
          .content-grid {
            grid-template-columns: 1fr;
          }
          .full-width {
            grid-column: 1 !important;
          }
          .conditions-grid {
            grid-template-columns: 1fr !important;
          }
          .tracking-row {
            flex-direction: column !important;
          }
        }

        @media (min-width: 641px) and (max-width: 900px) {
          .content-grid {
            grid-template-columns: 1fr;
          }
          .full-width {
            grid-column: 1 !important;
          }
        }

        /* ── Card ── */
        .section-card {
          background: #fff;
          border: 1px solid #E2ECF5;
          border-radius: 10px;
          box-shadow: 0 2px 12px rgba(26,46,66,.08);
          overflow: hidden;
          position: relative;
          transition: all 0.22s ease;
        }
        .full-width {
          grid-column: 1 / -1;
        }
        .gold-stripe {
          position: absolute;
          top: 0;
          right: 0;
          width: 4px;
          height: 100%;
          background: linear-gradient(180deg, #C49B3A, #A67F2C);
        }
        .card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: clamp(14px, 2.5vw, 18px) clamp(14px, 3vw, 22px) clamp(10px, 2vw, 14px);
          border-bottom: 1px solid #E2ECF5;
        }
        .card-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: #EBF3FB;
          border: 1px solid #E2ECF5;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #2D5F8A;
        }
        .card-title {
          font-size: clamp(13px, 2.5vw, 15px);
          font-weight: 800;
          color: #1E3A5F;
          margin: 0;
          font-family: 'Cairo', sans-serif;
        }
        .card-body {
          padding: clamp(14px, 2.5vw, 18px) clamp(14px, 3vw, 22px);
          line-height: 1.7;
        }

        /* ── Section intro text ── */
        .section-intro {
          font-size: clamp(13px, 2vw, 15px);
          font-weight: 600;
          line-height: 1.8;
          color: #1A2E42;
          margin: 0 0 14px;
          font-family: 'Cairo', sans-serif;
        }

        /* ── Conditions ── */
        .conditions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .condition-item {
          background: #EDF2F8;
          border-radius: 10px;
          padding: clamp(10px, 2vw, 14px) clamp(12px, 2vw, 16px);
          border: 1px solid #E2ECF5;
          border-right: 3px solid #C49B3A;
        }
        .condition-title {
          font-size: clamp(12px, 2vw, 14px);
          font-weight: 700;
          color: #1E3A5F;
          margin-bottom: 4px;
          font-family: 'Cairo', sans-serif;
        }
        .condition-desc {
          font-size: clamp(11px, 1.8vw, 13px);
          font-weight: 500;
          color: #6B8299;
          line-height: 1.5;
          font-family: 'Cairo', sans-serif;
        }

        /* ── Notice box ── */
        .notice-box {
          background: #FDF6E3;
          border: 1.5px dashed rgba(196,155,58,.35);
          border-radius: 10px;
          padding: clamp(10px, 2vw, 12px) clamp(12px, 2vw, 16px);
          font-size: clamp(12px, 2vw, 14px);
          font-weight: 600;
          color: #7A5A00;
          line-height: 1.7;
          margin-bottom: 4px;
          font-family: 'Cairo', sans-serif;
        }

        /* ── Doc items ── */
        .doc-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 14px;
        }
        .doc-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: clamp(10px, 2vw, 12px) clamp(12px, 2vw, 14px);
          background: #EDF2F8;
          border-radius: 10px;
          border: 1px solid #E2ECF5;
          flex-wrap: wrap;
        }
        .doc-label {
          font-size: clamp(12px, 2vw, 14px);
          font-weight: 600;
          color: #1A2E42;
          font-family: 'Cairo', sans-serif;
          flex: 1;
          min-width: 160px;
        }
        .badge-required {
          background: linear-gradient(180deg, #f6e6a8, #f1dc86);
          color: #7A5A00;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          border: 1px solid rgba(124,91,4,.1);
          white-space: nowrap;
          font-family: 'Cairo', sans-serif;
          flex-shrink: 0;
        }
        .badge-optional {
          background: #EEF2F6;
          color: #6B8299;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid rgba(148,163,184,.15);
          white-space: nowrap;
          font-family: 'Cairo', sans-serif;
          flex-shrink: 0;
        }

        /* ── Steps ── */
        .step-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .step-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: clamp(10px, 2vw, 14px) clamp(12px, 2vw, 16px);
          background: #EDF2F8;
          border-radius: 10px;
          border-right: 3px solid #C49B3A;
        }
        .step-number {
          background: linear-gradient(135deg, #C49B3A, #A67F2C);
          color: #fff;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          min-width: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 13px;
          font-family: 'Cairo', sans-serif;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(196,155,58,.35);
        }
        .step-content { flex: 1; }
        .step-title {
          font-weight: 700;
          font-size: clamp(13px, 2vw, 15px);
          display: block;
          color: #1E3A5F;
          margin-bottom: 3px;
          font-family: 'Cairo', sans-serif;
        }
        .step-desc {
          margin: 0;
          font-size: clamp(11px, 1.8vw, 13px);
          font-weight: 500;
          color: #6B8299;
          line-height: 1.6;
          font-family: 'Cairo', sans-serif;
        }

        /* ── Tracking ── */
        .tracking-row {
          display: flex;
          gap: 16px;
          margin-top: 14px;
          flex-wrap: wrap;
        }
        .tracking-box {
          flex: 1;
          min-width: 200px;
          background: #EDF2F8;
          border-radius: 10px;
          border: 1px solid #E2ECF5;
          padding: clamp(12px, 2vw, 14px) clamp(12px, 2vw, 16px);
        }
        .tracking-box-title {
          font-weight: 700;
          font-size: clamp(13px, 2vw, 14px);
          color: #1E3A5F;
          margin: 0 0 10px;
          font-family: 'Cairo', sans-serif;
          padding-bottom: 8px;
          border-bottom: 2px solid #C49B3A;
        }
        .tracking-desc {
          margin: 8px 0;
          font-size: clamp(12px, 2vw, 14px);
          font-weight: 500;
          color: #1A2E42;
          line-height: 1.6;
          font-family: 'Cairo', sans-serif;
        }
        .tracking-desc-mute {
          margin: 8px 0;
          font-size: 13px;
          font-weight: 500;
          color: #6B8299;
          line-height: 1.6;
          font-family: 'Cairo', sans-serif;
        }
        .bullet-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .bullet-item {
          font-size: clamp(12px, 2vw, 14px);
          font-weight: 500;
          color: #1A2E42;
          padding-right: 16px;
          position: relative;
          line-height: 1.6;
          font-family: 'Cairo', sans-serif;
        }
        .bullet-item::before {
          content: '•';
          position: absolute;
          right: 0;
          color: #C49B3A;
          font-weight: 900;
        }
      `}</style>

      <div className="cards-container">
        {/* ── Hero Header ── */}
        <div className="hero-header">
          <h1 className="hero-title">نظام التكافل الاجتماعي</h1>
          <div className="hero-separator" />
          <p className="hero-subtitle">
            تعرف على شروط ومتطلبات الحصول على دعم التكافل الاجتماعي بجامعة العاصمة
          </p>
        </div>

        {/* ── Content Grid ── */}
        <div className="content-grid">

          {/* 1 — Overview */}
          <SectionCard icon={<IconStar />} title="نبذة عن نظام التكافل الاجتماعي">
            <p className="section-intro">
              يهدف نظام التكافل الاجتماعي في جامعة العاصمة إلى دعم الطلاب الذين يواجهون ظروفاً
              اقتصادية صعبة. يقدم النظام أنواعًا مختلفة من الدعم المالي والأكاديمي للطلاب المحتاجين،
              بما يضمن استمرارهم في التعليم وتحقيق أهدافهم الأكاديمية.
            </p>
          </SectionCard>

          {/* 2 — Conditions */}
          <SectionCard icon={<IconShield />} title="شروط الاستحقاق">
            <p className="section-intro">يجب توفر الشروط التالية للحصول على الدعم المالي:</p>
            <div className="conditions-grid">
              {[
                { title: "الانتظام الأكاديمي", desc: "معدل تراكمي لا يقل عن 2.0" },
                { title: "الجنسية المصرية",    desc: "يجب أن يكون الطالب مصري الجنسية" },
                { title: "الدخل الشهري",       desc: "لا يتجاوز إجمالي دخل الأسرة 2000 جنيه لكل فرد" },
                { title: "وضع الأسرة",         desc: "وفاة الأب أو إعاقته أو وجود ظروف اقتصادية صعبة" },
              ].map((c) => (
                <div key={c.title} className="condition-item">
                  <div className="condition-title">{c.title}</div>
                  <div className="condition-desc">{c.desc}</div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* 3 — Documents */}
          <SectionCard icon={<IconDoc />} title="المستندات المطلوبة">
            <div className="notice-box">
              يشترط للتقدم بطلب التكافل أن يتوجه الطالب إلى الكلية لاستلام المستندات
              اللازمة لإعداد الأوراق المطلوبة.
            </div>
            <div className="doc-list">
              {[
                { label: "بحث اجتماعي من وحدة التضامن الاجتماعي",      required: true },
                { label: "مفردات المرتب أو المعاش أو ما يفيد بالدخل",    required: true },
                { label: "صورة البطاقة الشخصية للوالد (أو ولي الأمر)",   required: true },
                { label: "صورة البطاقة الشخصية للطالب",                  required: true },
                { label: "حيازة زراعية لسكان الأقاليم",                  required: false },
                { label: "صورة بطاقة تكافل وكرامة",                      required: false },
              ].map((doc) => (
                <div key={doc.label} className="doc-item">
                  <span className="doc-label">{doc.label}</span>
                  <span className={doc.required ? "badge-required" : "badge-optional"}>
                    {doc.required ? "مطلوب" : "إن وُجدت"}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* 4 — Instructions */}
          <SectionCard icon={<IconSteps />} title="إرشادات التقديم">
            <ol className="step-list">
              {[
                { title: "استلام المستندات من الكلية",           desc: "التوجه إلى الكلية لاستلام المستندات اللازمة لإجراء البحث الاجتماعي." },
                { title: "إصدار البحث الاجتماعي",               desc: "التوجه إلى وحدة التضامن الاجتماعي أو مكتب التكافل الأقرب لمحل السكن." },
                { title: "تجهيز المستندات ورفعها إلكترونيًا",   desc: "رفع المستندات من خلال صفحة تقديم الطلب مع إدخال البيانات بدقة." },
                { title: "الموافقة المبدئية وتسليم الأوراق",     desc: "عند صدور موافقة مبدئية، يتعين التوجه إلى الكلية لتسليم الأوراق الورقية." },
                { title: "القرار النهائي",                        desc: "بعد مراجعة المستندات تُصدر الكلية القرار النهائي بالقبول أو الرفض." },
              ].map((step, i) => (
                <li key={i} className="step-item">
                  <span className="step-number">{i + 1}</span>
                  <div className="step-content">
                    <span className="step-title">{step.title}</span>
                    <p className="step-desc">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </SectionCard>

          {/* 5 — Tracking (full-width) */}
          <SectionCard icon={<IconBell />} title="تتبع طلبك ورقم المرجع" fullWidth>
            <div className="notice-box">
              <strong>ملاحظة مهمة: </strong>
              يرجى متابعة حالة الطلب بشكل دوري، وفي حال ظهور الموافقة المبدئية،
              يتعين على الطالب التوجه إلى الكلية لتسليم الأوراق المطلوبة.
            </div>
            <div className="tracking-row">
              <div className="tracking-box">
                <p className="tracking-box-title">مراحل المعالجة:</p>
                <ul className="bullet-list">
                  {[
                    "منتظر: تم استلام الطلب وجار مراجعته من قِبل مسؤول الكلية.",
                    "موافقة مبدئية: يرجى التوجه إلى الكلية لتسليم الأوراق المطلوبة للمراجعة.",
                    "النتيجة النهائية: يكون القرار إما مقبول أو مرفوض.",
                  ].map((item) => (
                    <li key={item} className="bullet-item">{item}</li>
                  ))}
                </ul>
              </div>
              <div className="tracking-box">
                <p className="tracking-box-title">رقم الطلب:</p>
                <p className="tracking-desc">
                  ستحصل على رقم الطلب عند تقديمه. احتفظ بهذا الرقم للمتابعة والاستعلام.
                </p>
                <p className="tracking-desc-mute">
                  يمكنك إيجاد رقم الطلب من خلال قسم «طلباتي».
                </p>
              </div>
            </div>
          </SectionCard>

        </div>
      </div>
    </>
  );
}

/* ── Reusable Section Card ── */
function SectionCard({
  icon,
  title,
  children,
  fullWidth = true,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className={`section-card${fullWidth ? " full-width" : ""}`}>
      <div className="gold-stripe" />
      <div className="card-header">
        <span className="card-icon">{icon}</span>
        <h2 className="card-title">{title}</h2>
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}