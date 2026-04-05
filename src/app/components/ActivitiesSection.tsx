"use client";
import React, { useEffect, useRef } from "react";

const activities = [
  {
    id: 1,
    title: "اجتماعية",
    desc: "فعاليات تواصل، احتفالات، رحلات ترفيهية، ومبادرات لتعزيز الروابط الاجتماعية",
    num: "01",
    tags: ["احتفالات", "رحلات", "تواصل"],
  },
  {
    id: 2,
    title: "رياضية",
    desc: "بطولات رياضية، تمارين جماعية، دورات تدريبية، وأندية رياضية في جميع الألعاب",
    num: "02",
    tags: ["كرة قدم", "سباحة", "كاراتيه"],
  },
  {
    id: 3,
    title: "ثقافية",
    desc: "محاضرات ثقافية، ندوات فكرية، ورش عمل أدبية، مسابقات ثقافية، ونوادي القراءة",
    num: "03",
    tags: ["ندوات", "محاضرات", "مسابقات"],
  },
  {
    id: 4,
    title: "علمية وتكنولوجية",
    desc: "مشاريع بحثية، مسابقات علمية، مؤتمرات طلابية، ورش تكنولوجيا وبرمجة",
    num: "04",
    tags: ["برمجة", "بحث", "ابتكار"],
  },
  {
    id: 5,
    title: "فنية",
    desc: "معارض فنية، عروض مسرحية، حفلات موسيقية، مسابقات إبداعية، ونوادي الفنون",
    num: "05",
    tags: ["مسرح", "موسيقى", "فنون"],
  },
  {
    id: 6,
    title: "تنمية بشرية",
    desc: "دورات تطوير الذات، مهارات القيادة، التخطيط المهني، ومهارات التواصل",
    num: "06",
    tags: ["قيادة", "تطوير", "تخطيط"],
  },
  {
    id: 7,
    title: "تطوعية وخدمة مجتمعية",
    desc: "مبادرات خيرية، جوالة، خدمة عامة، حملات توعية، ومشاريع تنموية",
    num: "07",
    tags: ["تطوع", "توعية", "جوالة"],
  },
  {
    id: 8,
    title: "رحلات ومعسكرات",
    desc: "معسكرات صيفية وشتوية، رحلات ترفيهية وتعليمية، ومغامرات خارجية",
    num: "08",
    tags: ["معسكرات", "مغامرة", "طبيعة"],
  },
  {
    id: 9,
    title: "نماذج محاكاة دولية",
    desc: "محاكاة الأمم المتحدة، مؤتمرات دولية، مسابقات المناظرات، والدبلوماسية الطلابية",
    num: "09",
    tags: ["الأمم المتحدة", "مناظرات", "دبلوماسية"],
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
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700;800;900&display=swap');

        .acts-root {
          font-family: 'IBM Plex Sans Arabic', sans-serif;
          direction: rtl;
          background: #f0f2f5;
          padding: clamp(4rem,8vw,6.5rem) clamp(1.2rem,5vw,4.5rem);
          overflow: hidden;
          position: relative;
        }

        /* Subtle background dots */
        .acts-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(0,0,0,0.055) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
        }

        /* ── HEADER ── */
        .acts-header {
          text-align: center;
          margin-bottom: clamp(2.8rem,5vw,4rem);
          position: relative;
        }

        .acts-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 11px;
          font-weight: 800;
          color: #555;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 1rem;
        }
        .acts-eyebrow::before, .acts-eyebrow::after {
          content: '';
          width: 36px; height: 1.5px;
          background: #aaa;
          border-radius: 2px;
        }

        .acts-title {
          font-size: clamp(32px,6vw,64px);
          font-weight: 900;
          color: #0f172a;
          margin: 0 0 0.8rem;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }

        .acts-sub {
          font-size: clamp(14px,1.5vw,16px);
          color: #64748b;
          max-width: 520px;
          margin: 0 auto;
          line-height: 1.9;
        }

        /* ── GRID ── */
        .acts-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: clamp(14px,2vw,22px);
          max-width: 1280px;
          margin: 0 auto;
        }

        /* ── CARD ── */
        .act-card {
          background: #fff;
          border-radius: 20px;
          padding: clamp(1.6rem,2.5vw,2.2rem) clamp(1.4rem,2.2vw,2rem);
          display: flex;
          flex-direction: column;
          gap: 0;
          position: relative;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04);
          transition: transform 0.38s cubic-bezier(0.34,1.56,0.64,1),
                      box-shadow 0.35s ease;
          cursor: default;
          text-align: right;
        }

        .act-card:hover {
          transform: translateY(-8px) scale(1.012);
          box-shadow: 0 24px 60px rgba(0,0,0,0.13), 0 0 0 1px rgba(0,0,0,0.07);
        }

        /* Top strip — black */
        .act-card-strip {
          position: absolute;
          top: 0; right: 0; left: 0;
          height: 4px;
          background: #1e293b;
          border-radius: 20px 20px 0 0;
          transform: scaleX(0.4);
          transform-origin: right center;
          transition: transform 0.5s cubic-bezier(0.22,1,0.36,1);
        }
        .act-card:hover .act-card-strip {
          transform: scaleX(1);
        }

        /* Badge — dark monochrome */
        .act-card-badge {
          width: 58px;
          height: 58px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 900;
          color: #fff;
          background: linear-gradient(135deg, #1e293b, #475569);
          margin-bottom: 1.1rem;
          box-shadow: 0 8px 24px rgba(0,0,0,0.18);
          transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1),
                      box-shadow 0.35s ease;
          letter-spacing: -0.5px;
        }
        .act-card:hover .act-card-badge {
          transform: scale(1.12) rotate(-4deg);
          box-shadow: 0 14px 36px rgba(0,0,0,0.25);
        }

        .act-card-title {
          font-size: clamp(16px,1.8vw,20px);
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 0.45rem;
          line-height: 1.25;
        }

        /* Rule — dark */
        .act-card-rule {
          height: 2.5px;
          border-radius: 2px;
          width: 28px;
          background: #1e293b;
          margin: 0 0 0.8rem;
          transition: width 0.4s cubic-bezier(0.22,1,0.36,1);
        }
        .act-card:hover .act-card-rule {
          width: 52px;
        }

        .act-card-desc {
          font-size: clamp(12px,1.1vw,13.5px);
          color: #64748b;
          line-height: 1.9;
          margin: 0 0 1.1rem;
          flex: 1;
        }

        /* Tags */
        .act-card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: auto;
        }

        .act-tag {
          font-size: 11px;
          font-weight: 600;
          padding: 4px 11px;
          border-radius: 999px;
          background: transparent;
          color: #555;
          border: 1px solid #ddd;
          transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease;
          letter-spacing: 0.3px;
        }
        .act-card:hover .act-tag {
          background: #1e293b;
          color: #fff;
          border-color: #1e293b;
        }

        /* ── ANIMATIONS ── */
        .anim-el {
          opacity: 0;
          transform: translateY(36px);
          transition:
            opacity 0.7s cubic-bezier(0.22,1,0.36,1),
            transform 0.7s cubic-bezier(0.22,1,0.36,1);
        }
        .anim-el.fade-only  { transform: none; }
        .anim-el.drop-in    { transform: translateY(-24px); }
        .anim-el.in-view    { opacity: 1; transform: none !important; }

        .d0  { transition-delay: 0.00s; }
        .d1  { transition-delay: 0.08s; }
        .d2  { transition-delay: 0.16s; }
        .d3  { transition-delay: 0.12s; }
        .d4  { transition-delay: 0.22s; }
        .d5  { transition-delay: 0.32s; }
        .d6  { transition-delay: 0.24s; }
        .d7  { transition-delay: 0.34s; }
        .d8  { transition-delay: 0.44s; }
        .d9  { transition-delay: 0.36s; }
        .d10 { transition-delay: 0.46s; }
        .d11 { transition-delay: 0.56s; }

        /* ── Responsive ── */
        @media (max-width: 960px) {
          .acts-grid { grid-template-columns: repeat(2,1fr); }
        }
        @media (max-width: 560px) {
          .acts-grid { grid-template-columns: 1fr; gap: 14px; }
          .acts-root { padding: 2.5rem 1.1rem; }
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

                {/* Top strip */}
                <div className="act-card-strip" />

                {/* Badge with number */}
                <div className="act-card-badge">{act.num}</div>

                {/* Title */}
                <h3 className="act-card-title">{act.title}</h3>

                {/* Rule */}
                <div className="act-card-rule" />

                {/* Desc */}
                <p className="act-card-desc">{act.desc}</p>

                {/* Tags */}
                <div className="act-card-tags">
                  {act.tags.map((tag) => (
                    <span key={tag} className="act-tag">{tag}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
};

export default ActivitiesSection;