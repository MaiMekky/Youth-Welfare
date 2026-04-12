"use client";
import React, { useEffect, useRef } from "react";


const activities = [
  {
    id: 1,
    title: "اجتماعية",
    desc: "فعاليات تواصل، احتفالات، رحلات ترفيهية، ومبادرات لتعزيز الروابط الاجتماعية",
    num: "01",
    color: "#4f8ef7",
    bg: "#eef3ff",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    id: 2,
    title: "رياضية",
    desc: "بطولات رياضية، تمارين جماعية، دورات تدريبية، وأندية رياضية في جميع الألعاب",
    num: "02",
    color: "#f7724f",
    bg: "#fff1ee",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
        <circle cx="12" cy="12" r="10"/>
        <path d="M4.93 4.93l4.24 4.24"/>
        <path d="M14.83 9.17l4.24-4.24"/>
        <path d="M14.83 14.83l4.24 4.24"/>
        <path d="M9.17 14.83l-4.24 4.24"/>
        <circle cx="12" cy="12" r="4"/>
      </svg>
    ),
  },
  {
    id: 3,
    title: "ثقافية",
    desc: "محاضرات ثقافية، ندوات فكرية، ورش عمل أدبية، مسابقات ثقافية، ونوادي القراءة",
    num: "03",
    color: "#a259f7",
    bg: "#f3eeff",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
  },
  {
    id: 4,
    title: "علمية وتكنولوجية",
    desc: "مشاريع بحثية، مسابقات علمية، مؤتمرات طلابية، ورش تكنولوجيا وبرمجة",
    num: "04",
    color: "#22c97a",
    bg: "#edfaf4",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11m0 0H3m6 0h12m0 0V5m0 11v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5m16 0H3"/>
      </svg>
    ),
  },
  {
    id: 5,
    title: "فنية",
    desc: "معارض فنية، عروض مسرحية، حفلات موسيقية، مسابقات إبداعية، ونوادي الفنون",
    num: "05",
    color: "#f7c94f",
    bg: "#fffbee",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
      </svg>
    ),
  },
  {
    id: 6,
    title: "تنمية بشرية",
    desc: "دورات تطوير الذات، مهارات القيادة، التخطيط المهني، ومهارات التواصل",
    num: "06",
    color: "#f74f8e",
    bg: "#fff0f6",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
        <polyline points="16 7 22 7 22 13"/>
      </svg>
    ),
  },
  {
    id: 7,
    title: "تطوعية وخدمة مجتمعية",
    desc: "مبادرات خيرية، جوالة، خدمة عامة، حملات توعية، ومشاريع تنموية",
    num: "07",
    color: "#4fc9f7",
    bg: "#eef9ff",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
  },
  {
    id: 8,
    title: "رحلات ومعسكرات",
    desc: "معسكرات صيفية وشتوية، رحلات ترفيهية وتعليمية، ومغامرات خارجية",
    num: "08",
    color: "#f7a44f",
    bg: "#fff6ee",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
        <path d="M3 17l4-8 4 4 3-6 4 10"/>
        <path d="M21 21H3"/>
        <circle cx="18" cy="5" r="2"/>
      </svg>
    ),
  },
  {
    id: 9,
    title: "نماذج محاكاة دولية",
    desc: "محاكاة الأمم المتحدة، مؤتمرات دولية، مسابقات المناظرات، والدبلوماسية الطلابية",
    num: "09",
    color: "#7f59f7",
    bg: "#f0eeff",
   icon: (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
),
  },
];

const ActivitiesSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = sectionRef.current?.querySelectorAll(".anim-el");
    if (!els) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("in-view");
        });
      },
      { threshold: 0.06, rootMargin: "0px 0px -30px 0px" }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700;800;900&display=swap');

        .acts-root {
          font-family: 'Cairo', sans-serif;
          direction: rtl;
          background: #f5f6fa;
          padding: clamp(4rem, 8vw, 6.5rem) clamp(1.2rem, 5vw, 4.5rem);
          overflow: hidden;
          position: relative;
        }

        /* ── HEADER ── */
        .acts-header {
          text-align: center;
          margin-bottom: clamp(2.5rem, 5vw, 4rem);
        }

        .acts-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  color: #c9a227;
  letter-spacing: 1px;
  border: 1.5px solid #c9a227;
  border-radius: 999px;
  padding: 6px 20px;
  margin-bottom: 1rem;
  background: transparent;
}
.acts-eyebrow::before, .acts-eyebrow::after { content: none; }

        .acts-title {
          font-size: clamp(30px, 5.5vw, 58px);
          font-weight: 900;
          color: #0f172a;
          margin: 0 0 0.8rem;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }

        .acts-sub {
          font-size: clamp(14px, 1.4vw, 16px);
          color: #64748b;
          max-width: 500px;
          margin: 0 auto;
          line-height: 1.9;
        }

        /* ── GRID ── */
        .acts-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: clamp(14px, 2vw, 20px);
          max-width: 1260px;
          margin: 0 auto;
        }

        /* ── CARD ── */
        .act-card {
          background: #fff;
          border-radius: 20px;
          padding: clamp(1.5rem, 2.4vw, 2rem) clamp(1.3rem, 2vw, 1.8rem);
          display: flex;
          flex-direction: column;
          gap: 0;
          position: relative;
          overflow: hidden;
          box-shadow:
            0 1px 3px rgba(0,0,0,0.05),
            0 4px 16px rgba(0,0,0,0.06);
          transition:
            transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
            box-shadow 0.35s ease;
          cursor: default;
          text-align: right;
          border: 1px solid rgba(0,0,0,0.04);
        }

        .act-card:hover {
          transform: translateY(-7px) scale(1.013);
          box-shadow:
            0 2px 4px rgba(0,0,0,0.04),
            0 20px 52px rgba(0,0,0,0.11);
        }

        /* Colored top accent bar */
        .act-card-accent {
          position: absolute;
          top: 0; right: 0; left: 0;
          height: 3.5px;
          border-radius: 20px 20px 0 0;
          transform: scaleX(0.3);
          transform-origin: right center;
          transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .act-card:hover .act-card-accent {
          transform: scaleX(1);
        }

        /* Icon container */
        .act-icon-wrap {
          width: 62px;
          height: 62px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.1rem;
          transition:
            transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
            box-shadow 0.35s ease;
          flex-shrink: 0;
        }
        .act-card:hover .act-icon-wrap {
          transform: scale(1.1) rotate(-4deg);
          box-shadow: 0 12px 30px rgba(0,0,0,0.15);
        }

        .act-card-title {
          font-size: clamp(15px, 1.7vw, 19px);
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 0.5rem;
          line-height: 1.25;
        }

        /* Colored rule under title */
        .act-card-rule {
          height: 2.5px;
          border-radius: 2px;
          width: 26px;
          margin: 0 0 0.85rem;
          transition: width 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .act-card:hover .act-card-rule {
          width: 48px;
        }

        .act-card-desc {
          font-size: clamp(12px, 1.05vw, 13.5px);
          color: #64748b;
          line-height: 1.9;
          margin: 0;
          flex: 1;
        }

        /* ── ANIMATIONS ── */
        .anim-el {
          opacity: 0;
          transform: translateY(32px);
          transition:
            opacity  0.65s cubic-bezier(0.22, 1, 0.36, 1),
            transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .anim-el.fade-only { transform: none; }
        .anim-el.drop-in   { transform: translateY(-20px); }
        .anim-el.in-view   { opacity: 1 !important; transform: none !important; }

        .d0  { transition-delay: 0.00s; }
        .d1  { transition-delay: 0.07s; }
        .d2  { transition-delay: 0.14s; }
        .d3  { transition-delay: 0.10s; }
        .d4  { transition-delay: 0.18s; }
        .d5  { transition-delay: 0.26s; }
        .d6  { transition-delay: 0.20s; }
        .d7  { transition-delay: 0.28s; }
        .d8  { transition-delay: 0.36s; }
        .d9  { transition-delay: 0.30s; }
        .d10 { transition-delay: 0.38s; }
        .d11 { transition-delay: 0.46s; }

        /* ── Responsive ── */
        @media (max-width: 960px) {
          .acts-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 560px) {
          .acts-grid { grid-template-columns: 1fr; gap: 12px; }
          .acts-root { padding: 2.5rem 1.1rem; }
          .act-icon-wrap { width: 52px; height: 52px; border-radius: 14px; }
        }
      `}</style>

      <section className="acts-root" ref={sectionRef} id="activities">

        {/* Header */}
        <div className="acts-header">
          <div className="anim-el fade-only d0 acts-eyebrow">الأنشطة الطلابية</div>
          <h2 className="anim-el drop-in d1 acts-title">استكشف عالم الأنشطة</h2>
          <p className="anim-el fade-only d2 acts-sub">
            تنوع غير محدود من الأنشطة والفعاليات لتطوير مهاراتك واكتشاف شغفك الحقيقي
          </p>
        </div>

        {/* Grid */}
        <div className="acts-grid">
          {activities.map((act, i) => {
            const col = Math.floor(i / 3);
            const row = i % 3;
            const delayClass = `d${col * 3 + row}`;
            return (
              <div key={act.id} className={`anim-el ${delayClass} act-card`}>

                {/* Top colored accent */}
                <div
                  className="act-card-accent"
                  style={{ background: act.color }}
                />

                {/* Colored icon box */}
                <div
                  className="act-icon-wrap"
                  style={{
                    background: act.bg,
                    color: act.color,
                  }}
                >
                  {act.icon}
                </div>

                {/* Title */}
                <h3 className="act-card-title">{act.title}</h3>

                {/* Colored rule */}
                <div
                  className="act-card-rule"
                  style={{ background: act.color }}
                />

                {/* Description */}
                <p className="act-card-desc">{act.desc}</p>

              </div>
            );
          })}
        </div>
      </section>
    </>
  );
};

export default ActivitiesSection;