"use client";
import React, { useEffect, useRef } from "react";

const steps = [
  {
    num: "01",
    title: "استلام الأوراق من الكلية",
    desc: "احصل على نماذج التقديم الرسمية من مكتب رعاية الشباب بكليتك",
    side: "right",
  },
  {
    num: "02",
    title: "استخراج البحث الاجتماعي",
    desc: "قم بزيارة مكتب الشؤون الاجتماعية لإعداد البحث الاجتماعي الخاص بك",
    side: "left",
  },
  {
    num: "03",
    title: "تجهيز المستندات",
    desc: "اجمع جميع المستندات المطلوبة وتأكد من اكتمالها",
    side: "right",
  },
  {
    num: "04",
    title: "رفع الطلب إلكترونياً",
    desc: "قم بتسجيل الدخول وإدخال بياناتك ورفع المستندات عبر البوابة",
    side: "left",
  },
  {
    num: "05",
    title: "مراجعة وتسليم ورقي",
    desc: "انتظر المراجعة وقدم المستندات الأصلية لمكتب رعاية الشباب",
    side: "right",
  },
  {
    num: "06",
    title: "القرار النهائي",
    desc: "استلم القرار النهائي بقبول أو رفض طلب الدعم",
    side: "left",
  },
];

const ApplicationStepsSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("in-view");
        });
      },
      { threshold: 0.12 }
    );
    sectionRef.current
      ?.querySelectorAll(".as-anim")
      .forEach((el) => cardObserver.observe(el));

    const lineEl = sectionRef.current?.querySelector(".as-line-fill");
    if (lineEl) {
      const lineObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) (e.target as HTMLElement).classList.add("line-grow");
          });
        },
        { threshold: 0.05 }
      );
      lineObserver.observe(lineEl);
    }

    return () => {
      cardObserver.disconnect();
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes as-up {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes as-fromRight {
          from { opacity: 0; transform: translateX(70px) scale(0.96); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes as-fromLeft {
          from { opacity: 0; transform: translateX(-70px) scale(0.96); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes as-dotPop {
          0%   { opacity: 0; transform: scale(0); }
          70%  { transform: scale(1.35); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes as-glowPulse {
          0%, 100% { opacity: 0.45; }
          50%       { opacity: 1; }
        }

        /* ── base hidden state ── */
        .as-anim { opacity: 0; }
        .as-anim.in-view.as-up         { animation: as-up       0.65s cubic-bezier(0.22,1,0.36,1) forwards; }
        .as-anim.in-view.as-from-right { animation: as-fromRight 0.75s cubic-bezier(0.22,1,0.36,1) forwards; }
        .as-anim.in-view.as-from-left  { animation: as-fromLeft  0.75s cubic-bezier(0.22,1,0.36,1) forwards; }
        .as-anim.in-view.as-dot-anim   { animation: as-dotPop   0.55s cubic-bezier(0.34,1.56,0.64,1) forwards; }

        .as-d0 { animation-delay: 0.00s; }
        .as-d1 { animation-delay: 0.10s; }
        .as-d2 { animation-delay: 0.18s; }
        .as-d3 { animation-delay: 0.12s; }
        .as-d4 { animation-delay: 0.20s; }
        .as-d5 { animation-delay: 0.28s; }

        /* ══════════════════════════════
           Section — UNTOUCHED
        ══════════════════════════════ */
        .as-section {
          background: #f5f6fa;
          direction: rtl;
          padding: clamp(4rem, 8vw, 6.5rem) clamp(1rem, 5vw, 3rem);
          overflow: hidden;
        }

        /* ══════════════════════════════
           Header — ALL UNTOUCHED
        ══════════════════════════════ */
        .as-header {
          text-align: center;
          margin-bottom: clamp(2.5rem, 5vw, 4rem);
        }
        .as-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 700;
          color: #c9a227;
          letter-spacing: 2px;
          border: 1.5px solid #c9a227;
          border-radius: 999px;
          padding: 4px 16px;
          margin-bottom: 1rem;
        }
        .as-title {
          font-size: clamp(26px, 4.5vw, 52px);
          font-weight: 900;
          color: #1a2340;
          margin: 0 0 0.6rem;
          line-height: 1.15;
        }
        .as-subtitle {
          font-size: clamp(13px, 1.35vw, 15px);
          color: #64748b;
          max-width: 460px;
          margin: 0 auto;
          line-height: 1.85;
        }

        /* ══════════════════════════════
           Timeline
        ══════════════════════════════ */
        .as-timeline {
          position: relative;
          max-width: 1100px;
          margin: 0 auto;
          padding: 0.5rem 0;
        }

        /* vertical center line */
        .as-line-track {
          position: absolute;
          top: 0; bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 2px;
          background: #dde0eb;
          z-index: 0;
        }
        .as-line-fill {
          position: absolute;
          top: 0; left: 0;
          width: 100%;
          background: linear-gradient(180deg, #c9a227 0%, #e8c85a 100%);
          height: 100%;
          transform-origin: top center;
          transform: scaleY(0);
          transition: transform 2s cubic-bezier(0.22,1,0.36,1) 0.3s;
        }
        .as-line-fill.line-grow { transform: scaleY(1); }

        /* ── Step row ── */
        .as-step {
          display: grid;
          grid-template-columns: 1fr 64px 1fr;
          align-items: center;
          margin-bottom: clamp(2rem, 3.5vw, 2.8rem);
          position: relative;
          z-index: 1;
        }

        /* dot column */
        .as-dot-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          position: relative;
          z-index: 2;
        }
        .as-dot-inner {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #c9a227;
          border: 3.5px solid #f5f6fa;
          box-shadow: 0 0 0 2.5px #c9a227, 0 0 18px 5px rgba(201,162,39,0.4);
          flex-shrink: 0;
        }

        /* ══════════════════════════════
           Card — cinematic dark navy
        ══════════════════════════════ */
        .as-card {
          background: #131d33;
          border-radius: 22px;
          padding: clamp(1.6rem, 2.8vw, 2.4rem);
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(201,162,39,0.15);
          box-shadow:
            0 10px 48px rgba(0,0,0,0.32),
            inset 0 1px 0 rgba(255,255,255,0.04);
          transition:
            transform 0.4s cubic-bezier(0.34,1.56,0.64,1),
            box-shadow 0.35s ease,
            border-color 0.35s ease;
          min-height: 180px;
          display: flex;
          flex-direction: column;
          gap: 1.4rem;
        }
        .as-card:hover {
          transform: translateY(-8px) scale(1.015);
          box-shadow:
            0 28px 70px rgba(0,0,0,0.42),
            0 0 0 1.5px rgba(201,162,39,0.5),
            inset 0 1px 0 rgba(255,255,255,0.07);
          border-color: rgba(201,162,39,0.5);
        }

        /* ambient gold glow — top corner matching screenshot */
        .as-card::before {
          content: '';
          position: absolute;
          top: -50px;
          right: -50px;
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(201,162,39,0.16) 0%, transparent 65%);
          pointer-events: none;
          animation: as-glowPulse 4s ease-in-out infinite;
        }

        /* subtle left-edge gold bar */
        .as-card-accent {
          position: absolute;
          top: 20%; bottom: 20%;
          left: 0;
          width: 3px;
          background: linear-gradient(180deg, transparent, #c9a227 40%, #e8c85a 60%, transparent);
          border-radius: 0 2px 2px 0;
          opacity: 0.6;
          transition: opacity 0.3s ease, top 0.3s ease, bottom 0.3s ease;
        }
        .as-card:hover .as-card-accent {
          top: 10%; bottom: 10%;
          opacity: 1;
        }

        /* connector: card edge → dot */
        .as-connector {
          position: absolute;
          top: 50%;
          width: 40px;
          height: 1px;
          z-index: 1;
          transform: translateY(-50%);
        }
        .as-card-right .as-connector {
          left: -40px;
          background: linear-gradient(270deg, rgba(201,162,39,0.6), transparent);
        }
        .as-card-left .as-connector {
          right: -40px;
          background: linear-gradient(90deg, rgba(201,162,39,0.6), transparent);
        }

        /* card top row: badge */
        .as-card-top {
          display: flex;
          justify-content: flex-start;
        }

        /* Gold badge */
        .as-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: linear-gradient(135deg, #c9a227, #f0d560);
          color: #1a2340;
          font-size: 17px;
          font-weight: 900;
          letter-spacing: -0.5px;
          flex-shrink: 0;
          box-shadow: 0 4px 20px rgba(201,162,39,0.45);
        }

        /* card body: title + desc */
        .as-card-title {
          font-size: clamp(16px, 1.8vw, 22px);
          font-weight: 900;
          color: #ffffff;
          margin: 0 0 0.5rem;
          line-height: 1.3;
        }
        .as-card-desc {
          font-size: clamp(12.5px, 1.1vw, 14px);
          color: #7a96be;
          line-height: 1.9;
          margin: 0;
        }

        /* ── Grid placement ── */
        .as-step-right .as-card-right { grid-column: 1; }
        .as-step-right .as-dot-wrap   { grid-column: 2; }
        .as-step-right .as-empty      { grid-column: 3; }

        .as-step-left .as-empty      { grid-column: 1; }
        .as-step-left .as-dot-wrap   { grid-column: 2; }
        .as-step-left .as-card-left  { grid-column: 3; }

        /* ── MOBILE ── */
        @media (max-width: 640px) {
          .as-line-track { left: 20px; transform: none; }
          .as-step {
            grid-template-columns: 40px 1fr;
            margin-bottom: 1.6rem;
          }
          .as-step-right .as-card-right,
          .as-step-left  .as-card-left { grid-column: 2; grid-row: 1; }
          .as-step-right .as-dot-wrap,
          .as-step-left  .as-dot-wrap  { grid-column: 1; grid-row: 1; }
          .as-step-right .as-empty,
          .as-step-left  .as-empty     { display: none; }
          .as-connector { display: none; }
          .as-anim.in-view.as-from-right,
          .as-anim.in-view.as-from-left {
            animation: as-up 0.65s cubic-bezier(0.22,1,0.36,1) forwards;
          }
        }
      `}</style>

      <section className="as-section" ref={sectionRef} id="application-steps">

        {/* ── Header: ZERO changes ── */}
        <div className="as-header">
          <div className="as-anim as-up as-d0 as-eyebrow">خطوات التقديم</div>
          <h2 className="as-anim as-up as-d1 as-title">كيف تتقدم للحصول على الدعم؟</h2>
          <p className="as-anim as-up as-d2 as-subtitle">
            اتبع هذه الخطوات للتقديم على نظام التكافل الاجتماعي
          </p>
        </div>

        {/* ── Timeline ── */}
        <div className="as-timeline">
          <div className="as-line-track">
            <div className="as-line-fill" />
          </div>

          {steps.map((step, i) => {
            const isRight = step.side === "right";
            const animDir = isRight ? "as-from-right" : "as-from-left";
            const delay = `as-d${i % 6}`;

            const card = (side: "right" | "left") => (
              <div className={`as-anim ${animDir} ${delay} as-card as-card-${side}`}>
                <div className="as-card-accent" />
                <div className="as-connector" />
                <div className="as-card-top">
                  <div className="as-badge">{step.num}</div>
                </div>
                <div>
                  <h3 className="as-card-title">{step.title}</h3>
                  <p className="as-card-desc">{step.desc}</p>
                </div>
              </div>
            );

            const dot = (
              <div className="as-dot-wrap">
                <div className={`as-anim as-dot-anim ${delay}`}>
                  <div className="as-dot-inner" />
                </div>
              </div>
            );

            return (
              <div
                key={step.num}
                className={`as-step ${isRight ? "as-step-right" : "as-step-left"}`}
              >
                {isRight ? (
                  <>{card("right")}{dot}<div className="as-empty" /></>
                ) : (
                  <><div className="as-empty" />{dot}{card("left")}</>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
};

export default ApplicationStepsSection;