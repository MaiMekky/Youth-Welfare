"use client";
import React, { useEffect, useRef } from "react";

const GoalsSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
          }
        });
      },
      { threshold: 0.1 }
    );
    const els = sectionRef.current?.querySelectorAll(".gs-anim");
    els?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const goals = [
    "تنمية القيم الروحية والأخلاقية والوعي الوطني بين الطلاب",
    "تدريب الطلاب على القيادة وإتاحة الفرصة لهم للتعبير",
    "بث روح الانتماء وتنمية القيادات الطبيعية وتفعيل دورها",
    "اكتشاف مواهب الطلاب وصقل مهاراتهم الإبداعية",
    "دعم الأسر والجمعيات التعاونية الطلابية ونشر أنشطتها",
    "تطوير الأنشطة وتشجيع المتفوقين وتنمية مهارات التواصل",
  ];

  return (
    <>
      <style>{`
        :root {
          --gold:      #c9a227;
          --gold-dark: #a8831a;
          --navy:      #1a2340;
          --text-body: #3a3f52;
          --bg:        #ffffff;
        }

        @keyframes gs-fadeSlideRight {
          from { opacity: 0; transform: translateX(52px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes gs-fadeSlideLeft {
          from { opacity: 0; transform: translateX(-60px) scale(1.03); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes gs-lineGrow {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes gs-dotPop {
          from { opacity: 0; transform: scale(0); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes gs-imgFadeIn {
          from { opacity: 0; transform: scale(1.04); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes gs-cornerDraw {
          from { stroke-dashoffset: 220; opacity: 0; }
          to   { stroke-dashoffset: 0;   opacity: 1; }
        }
        @keyframes gs-revealDown {
          from { clip-path: inset(0 0 100% 0); }
          to   { clip-path: inset(0 0 0% 0); }
        }

        /* ── Base anim state ── */
        .gs-anim { opacity: 0; }
        .gs-anim.in-view.gs-slide-right {
          animation: gs-fadeSlideRight 0.78s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        .gs-anim.in-view.gs-slide-left {
          animation: gs-fadeSlideLeft  0.88s cubic-bezier(0.22,1,0.36,1) forwards;
        }

        .gs-anim.d0  { animation-delay: 0.00s; }
        .gs-anim.d1  { animation-delay: 0.09s; }
        .gs-anim.d2  { animation-delay: 0.18s; }
        .gs-anim.d3  { animation-delay: 0.27s; }
        .gs-anim.d4  { animation-delay: 0.36s; }
        .gs-anim.d5  { animation-delay: 0.45s; }
        .gs-anim.d6  { animation-delay: 0.54s; }
        .gs-anim.d7  { animation-delay: 0.63s; }
        .gs-anim.d8  { animation-delay: 0.72s; }
        .gs-anim.d9  { animation-delay: 0.81s; }

        /* ── Section ── */
        .gs-section {
          background: var(--bg);
          direction: rtl;
          overflow: hidden;
          padding-top: clamp(4rem, 8vw, 7rem);
          padding-bottom: clamp(3rem, 6vw, 5rem);
          position: relative;
        }

        /* Top divider line between sections */
        .gs-section::before {
          content: '';
          display: block;
          width: 100px;
          height: 3px;
          background: linear-gradient(90deg, transparent, var(--gold), transparent);
          margin: 0 auto clamp(3rem, 5vw, 4.5rem);
          border-radius: 2px;
        }

        .gs-grid {
          display: grid;
          /* ✅ INVERTED layout: image on left, text on right */
          grid-template-columns: 46% 54%;
          min-height: 560px;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 clamp(1.5rem, 4vw, 3rem);
          gap: clamp(2rem, 4vw, 4rem);
        }

        /* ── Image side (LEFT) ── */
        .gs-image-side {
          position: relative;
          border-radius: 18px;
          overflow: hidden;
          aspect-ratio: 4 / 5;
          max-height: 520px;
          /* Fallback gradient shown while image loads or if missing */
          background: linear-gradient(135deg, #d6cfc0 0%, #bfb89e 100%);
          box-shadow:
            0 12px 48px rgba(26, 35, 64, 0.13),
            0 2px 8px rgba(26, 35, 64, 0.07);
        }

        .gs-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 20%;
          display: block;
          opacity: 0;
          transition: transform 7s ease;
        }
        .gs-image-side.in-view .gs-img {
          animation: gs-imgFadeIn 0.9s cubic-bezier(0.22,1,0.36,1) 0.2s forwards;
        }
        .gs-image-side:hover .gs-img {
          transform: scale(1.07) translateX(1%);
        }

        /* Gold corners */
        .gs-corner-tl {
          position: absolute;
          top: 16px; left: 16px;
          width: 60px; height: 60px;
          z-index: 4; pointer-events: none;
        }
        .gs-corner-br {
          position: absolute;
          bottom: 16px; right: 16px;
          width: 50px; height: 50px;
          z-index: 4; pointer-events: none;
        }
        .gs-cp {
          fill: none;
          stroke: var(--gold);
          stroke-width: 3.5;
          stroke-linecap: square;
          stroke-dasharray: 220;
          stroke-dashoffset: 220;
        }
        .gs-image-side.in-view .gs-cp {
          animation: gs-cornerDraw 1s ease 0.55s forwards;
        }

        /* Left-edge gold line */
        .gs-vline {
          position: absolute;
          top: 10%; left: 14px;
          width: 3px; height: 80%;
          background: var(--gold);
          border-radius: 2px;
          opacity: 0;
          z-index: 4;
        }
        .gs-image-side.in-view .gs-vline {
          animation: gs-revealDown 0.8s ease 0.6s forwards;
        }

        /* ── Text side (RIGHT) ── */
        .gs-text-side {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .gs-eyebrow {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 1.3rem;
        }
        .gs-eyebrow-text {
          font-size: 15px;
          font-weight: 600;
          color: var(--gold);
          letter-spacing: 0.4px;
        }
        .gs-eyebrow-line {
          width: 50px;
          height: 2px;
          background: var(--gold);
          border-radius: 2px;
          transform-origin: right center;
          transform: scaleX(0);
        }
        .gs-anim.in-view .gs-eyebrow-line {
          animation: gs-lineGrow 0.55s ease 0.15s forwards;
        }

        .gs-heading {
          font-size: clamp(28px, 3.6vw, 50px);
          font-weight: 900;
          color: var(--navy);
          margin: 0 0 0.5rem;
          line-height: 1.2;
        }
        .gs-heading-gold {
          font-size: clamp(24px, 3.1vw, 44px);
          font-weight: 900;
          color: var(--gold);
          font-style: italic;
          margin: 0 0 1.6rem;
          line-height: 1.2;
          display: block;
        }

        /* Horizontal rule */
        .gs-rule {
          width: 56px;
          height: 3px;
          background: linear-gradient(90deg, var(--gold), #e8c85a);
          border-radius: 2px;
          margin-bottom: 1.6rem;
        }

        /* Structured paragraph blocks */
        .gs-paras {
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
          margin-bottom: 1.8rem;
        }
        .gs-para {
          font-size: clamp(13px, 1.28vw, 15px);
          color: var(--text-body);
          line-height: 2;
          text-align: justify;
          margin: 0;
          padding-right: 14px;
          border-right: 2.5px solid transparent;
          transition: border-color 0.3s ease, color 0.3s ease;
        }
        .gs-para:hover {
          border-right-color: var(--gold);
          color: #1a2340;
        }

        /* Goal bullets 2-col grid */
        .gs-goals {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px 24px;
        }
        .gs-goal-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: clamp(12px, 1.1vw, 13.5px);
          color: var(--text-body);
          font-weight: 500;
          line-height: 1.65;
        }
        .gs-goal-dot {
          width: 8px;
          height: 8px;
          min-width: 8px;
          margin-top: 5px;
          border-radius: 50%;
          background: var(--gold);
          opacity: 0;
        }
        .gs-anim.in-view .gs-goal-dot {
          animation: gs-dotPop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .gs-grid { grid-template-columns: 1fr 1fr; }
          .gs-goals { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
          .gs-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .gs-image-side {
            aspect-ratio: 16 / 9;
            max-height: 300px;
            border-radius: 14px;
            /* On mobile image stays on top */
            order: -1;
          }
          .gs-goals { grid-template-columns: 1fr 1fr; }
          .gs-heading { font-size: clamp(26px, 7vw, 38px); }
        }

        @media (max-width: 480px) {
          .gs-goals { grid-template-columns: 1fr; }
          .gs-heading { font-size: clamp(22px, 7vw, 30px); }
          .gs-para { font-size: 13px; line-height: 1.9; }
        }
      `}</style>

      <section className="gs-section" ref={sectionRef}>
        <div className="gs-grid">

          {/* ── Left: Image Card (inverted from AboutSection) ── */}
          <div className="gs-anim gs-slide-left d0 gs-image-side">
            <img
              className="gs-img"
              src="/goal.png"
              alt="أهداف الإدارة العامة لرعاية الطلاب"
              loading="lazy"
            />

            {/* Top-left corner bracket */}
            <svg className="gs-corner-tl" viewBox="0 0 70 70">
              <path className="gs-cp" d="M 60 10 L 10 10 L 10 60" />
            </svg>

            {/* Bottom-right corner bracket */}
            <svg className="gs-corner-br" viewBox="0 0 56 56">
              <path className="gs-cp" d="M 10 46 L 46 46 L 46 10" />
            </svg>

            {/* Left-edge gold line */}
            <div className="gs-vline" />
          </div>

          {/* ── Right: Text ── */}
          <div className="gs-text-side">

            {/* Eyebrow */}
            <div className="gs-anim gs-slide-right d0 gs-eyebrow">
              <span className="gs-eyebrow-text">أهدافنا</span>
              <div className="gs-eyebrow-line" />
            </div>

            {/* Heading */}
            <h2 className="gs-anim gs-slide-right d1 gs-heading">
              أهداف الإدارة العامة
            </h2>
            <span className="gs-anim gs-slide-right d2 gs-heading-gold">
              لرعاية الطلاب
            </span>

            {/* Gold rule */}
            <div className="gs-anim gs-slide-right d3 gs-rule" />

            {/* Structured paragraphs */}
            <div className="gs-anim gs-slide-right d4 gs-paras">
              <p className="gs-para">
                تهدف الإدارة العامة لرعاية الطلاب إلى تنمية القيم الروحية والأخلاقية والوعي الوطني والقومي بين الطلاب، وتدريبهم على القيادة وإتاحة الفرصة لهم للتعبير عن آرائهم.
              </p>
              <p className="gs-para">
                بث روح الانتماء لخدمة أنفسهم وأسرهم والجامعة والمجتمع والوطن، وتنمية القيادات الطبيعية وتفعيل دورها في القيام بمهامها القيادية والعمل التطوعي.
              </p>
              <p className="gs-para">
                اكتشاف مواهب الطلاب وصقل مهاراتهم الإبداعية وتشجيعها، ودعم الأسر والجمعيات التعاونية الطلابية، وتطوير الأنشطة الرياضية والاجتماعية والثقافية والعلمية وتنمية مهارات الاتصال مع المجتمع الطلابي والهيئات والمؤسسات المجتمعية.
              </p>
            </div>

            {/* Goal bullets */}
            <ul className="gs-goals">
              {goals.map((goal, i) => (
                <li key={i} className={`gs-anim gs-slide-right d${5 + i} gs-goal-item`}>
                  <span className="gs-goal-dot" />
                  {goal}
                </li>
              ))}
            </ul>

          </div>
        </div>
      </section>
    </>
  );
};

export default GoalsSection;