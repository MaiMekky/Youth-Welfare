"use client";
import React, { useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────
//  HOW TO MAKE YOUR IMAGE WORK (Next.js / React)
//  ---------------------------------------------------------------
//  The path  D:\Git\Youth-Welfare\...  is a Windows local path —
//  browsers can never load it directly.
//
//  Do this ONE time:
//    1. Copy  IMG-20251014-WA0015.jpg
//         →  <your-project>/public/about-students.jpg
//    2. That's it. The src="/about-students.jpg" below will work.
// ─────────────────────────────────────────────────────────────────

const AboutSection: React.FC = () => {
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
    const els = sectionRef.current?.querySelectorAll(".anim");
    els?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const bullets = [
    "برامج تطوير مهارات متقدمة",
    "أنشطة طلابية متنوعة وحيوية",
    "فرص قيادية وتنظيمية فريدة",
    "شبكة دعم اجتماعي شاملة",
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

        @keyframes fadeSlideLeft {
          from { opacity:0; transform:translateX(-52px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes fadeSlideRight {
          from { opacity:0; transform:translateX(80px) scale(1.03); }
          to   { opacity:1; transform:translateX(0)    scale(1); }
        }
        @keyframes lineGrow {
          from { transform:scaleX(0); }
          to   { transform:scaleX(1); }
        }
        @keyframes dotPop {
          from { opacity:0; transform:scale(0); }
          to   { opacity:1; transform:scale(1); }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(22px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes cornerDraw {
          from { stroke-dashoffset:220; opacity:0; }
          to   { stroke-dashoffset:0;   opacity:1; }
        }
        @keyframes shimmerPass {
          0%   { transform:translateX(-100%); }
          100% { transform:translateX(250%); }
        }
        @keyframes revealDown {
          from { clip-path: inset(0 0 100% 0); }
          to   { clip-path: inset(0 0 0%   0); }
        }

        .anim { opacity:0; }

        .anim.in-view.slide-left  { animation: fadeSlideLeft  0.78s cubic-bezier(0.22,1,0.36,1) forwards; }
        .anim.in-view.slide-right { animation: fadeSlideRight 0.88s cubic-bezier(0.22,1,0.36,1) forwards; }
        .anim.in-view.fade-up     { animation: fadeUp         0.65s cubic-bezier(0.22,1,0.36,1) forwards; }

        .anim.d0  { animation-delay:0.00s; }
        .anim.d1  { animation-delay:0.09s; }
        .anim.d2  { animation-delay:0.18s; }
        .anim.d3  { animation-delay:0.27s; }
        .anim.d4  { animation-delay:0.36s; }
        .anim.d5  { animation-delay:0.45s; }
        .anim.d6  { animation-delay:0.54s; }
        .anim.d7  { animation-delay:0.63s; }
        .anim.d8  { animation-delay:0.72s; }
        .anim.d9  { animation-delay:0.81s; }

        /* ── Section ── */
        .about-section {
          background: var(--bg);
          direction: rtl;
          overflow: hidden;
          padding: 0;
        }

        .about-grid {
          display: grid;
          grid-template-columns: 54% 46%;
          min-height: 640px;
          align-items: stretch;
        }

        /* ── Left text ── */
        .about-left {
          padding: clamp(3.5rem,6vw,5.5rem) clamp(2.5rem,5vw,5rem) clamp(3.5rem,6vw,5.5rem) clamp(2rem,4vw,4rem);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .about-eyebrow {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 1.3rem;
        }
        .about-eyebrow-text {
          font-size: 15px;
          font-weight: 600;
          color: var(--gold);
          letter-spacing: 0.4px;
        }
        .about-eyebrow-line {
          width: 50px;
          height: 2px;
          background: var(--gold);
          border-radius: 2px;
          transform-origin: right center;
          transform: scaleX(0);
        }
        .anim.in-view .about-eyebrow-line {
          animation: lineGrow 0.55s ease 0.15s forwards;
        }

        .about-heading-wrap { margin-bottom: 1.5rem; }

        .about-h1 {
          font-size: clamp(36px, 4.8vw, 60px);
          font-weight: 900;
          color: var(--navy);
          margin: 0;
          line-height: 1.1;
          display: block;
        }
        .about-h1-gold {
          font-size: clamp(32px, 4.3vw, 54px);
          font-weight: 900;
          color: var(--gold);
          font-style: italic;
          margin: 0;
          line-height: 1.2;
          display: block;
        }

        .about-para {
          font-size: clamp(13.5px, 1.35vw, 15.5px);
          color: var(--text-body);
          line-height: 2;
          margin: 0 0 1.1rem 0;
          max-width: 540px;
          text-align: justify;
        }

        .about-bullets {
          list-style: none;
          margin: 0.5rem 0 0 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 13px;
        }
        .about-bullet {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: clamp(13px, 1.3vw, 15px);
          color: var(--text-body);
          font-weight: 500;
        }
        .about-bullet-dot {
          width: 10px;
          height: 10px;
          min-width: 10px;
          border-radius: 50%;
          background: var(--gold);
          opacity: 0;
        }
        .anim.in-view .about-bullet-dot {
          animation: dotPop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }

        /* ── Right image ── */
        .about-right {
          position: relative;
          overflow: hidden;
          /* warm neutral fallback */
          background: linear-gradient(135deg, #d6cfc0 0%, #bfb89e 100%);
        }

        /* Diagonal cut on the left edge so image bleeds into text area slightly */
        .about-img-mask {
          position: absolute;
          inset: 0;
          overflow: hidden;
          clip-path: polygon(6% 0%, 100% 0%, 100% 100%, 0% 100%);
        }

        .about-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 18%;
          display: block;
          transition: transform 7s ease;
        }

        /* Ken-Burns pan on hover */
        .about-right:hover .about-img {
          transform: scale(1.07) translateX(-1%);
        }

        /* One-time shimmer sweep */
        .about-img-shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            105deg,
            transparent 0%,
            rgba(255,255,255,0.22) 45%,
            rgba(255,255,255,0.22) 55%,
            transparent 100%
          );
          width: 40%;
          transform: translateX(-100%);
          pointer-events: none;
          z-index: 3;
        }
        .about-right.in-view .about-img-shimmer {
          animation: shimmerPass 1s ease 0.7s forwards;
        }

        /* Gold top-left corner bracket */
        .about-corner-tl {
          position: absolute;
          top: 22px;
          left: calc(6% + 16px);
          width: 70px;
          height: 70px;
          z-index: 4;
          pointer-events: none;
        }
        /* Gold bottom-right corner bracket */
        .about-corner-br {
          position: absolute;
          bottom: 22px;
          right: 22px;
          width: 56px;
          height: 56px;
          z-index: 4;
          pointer-events: none;
        }

        .cp {
          fill: none;
          stroke: var(--gold);
          stroke-width: 3.5;
          stroke-linecap: square;
          stroke-dasharray: 220;
          stroke-dashoffset: 220;
        }

        .about-right.in-view .cp {
          animation: cornerDraw 1s ease 0.55s forwards;
        }

        /* Thin gold vertical line */
        .about-vline {
          position: absolute;
          top: 10%;
          right: 22px;
          width: 3px;
          height: 80%;
          background: var(--gold);
          border-radius: 2px;
          opacity: 0;
          z-index: 4;
        }
        .about-right.in-view .about-vline {
          animation: revealDown 0.8s ease 0.6s forwards;
        }

        /* ── Tablet ── */
        @media (max-width: 1024px) {
          .about-grid { grid-template-columns: 1fr 1fr; }
          .about-h1      { font-size: clamp(30px,4vw,48px); }
          .about-h1-gold { font-size: clamp(26px,3.5vw,42px); }
        }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .about-grid { grid-template-columns: 1fr; }
          .about-right {
            order: -1;
            min-height: 310px;
            max-height: 420px;
          }
          .about-img-mask { clip-path: polygon(0% 0%, 100% 0%, 100% 92%, 0% 100%); }
          .about-left { padding: 2.5rem 1.5rem 3rem; }
          .about-h1      { font-size: clamp(28px,8vw,46px); }
          .about-h1-gold { font-size: clamp(24px,7vw,40px); }
          .about-para    { max-width: 100%; }
        }

        @media (max-width: 480px) {
          .about-h1      { font-size: clamp(24px,7.5vw,36px); }
          .about-h1-gold { font-size: clamp(20px,7vw,30px); }
          .about-para    { font-size: 13px; line-height: 1.9; }
          .about-bullet  { font-size: 13px; }
        }
      `}</style>

      <section className="about-section" ref={sectionRef}>
        <div className="about-grid">

          {/* ── Left: Text ── */}
          <div className="about-left">

            <div className="anim slide-left d0 about-eyebrow">
              <span className="about-eyebrow-text">رؤيتنا</span>
              <div className="about-eyebrow-line" />
            </div>

            <div className="about-heading-wrap">
              <span className="anim slide-left d1 about-h1">نخلق تجربة جامعية</span>
              <span className="anim slide-left d2 about-h1-gold">لا تُنسى</span>
            </div>

            <p className="anim slide-left d3 about-para">
              في جامعة العاصمة، نؤمن بأن التعليم يتجاوز حدود الفصول الدراسية. تعتبر الأنشطة جزءًا لا يتجزأ من العملية التعليمية، حيث تكسب الطالب السمات الشخصية المتكاملة والخبرات الميدانية والتفاعل المبكر مع فئات المجتمع.
            </p>

            <p className="anim slide-left d4 about-para">
              نوفر بيئة شاملة تمكّن الطلاب من اكتشاف مواهبهم وتطوير مهاراتهم وبناء شخصياتهم القيادية، وذلك انطلاقًا من توجيهات تطوير التعليم العالي وتنمية القيادات الشبابية — عبر برنامج تطوير الأداء للإدارة العامة لرعاية الطلاب والأقسام التابعة لها بالكليات.
            </p>

            <ul className="about-bullets">
              {bullets.map((item, i) => (
                <li key={i} className={`anim slide-left d${5 + i} about-bullet`}>
                  <span className="about-bullet-dot" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* ── Right: Image ── */}
          <div className="anim slide-right d0 about-right">

            {/* Diagonal-clipped image wrapper */}
            <div className="about-img-mask">
              {/*
                ✅ Put your image in:  public/about-students.jpg
                   Then this src will work in Next.js automatically.
              */}
              <img
                className="about-img"
                src="/about-students.png"
                alt="طلاب جامعة العاصمة"
                loading="lazy"
              />
            </div>

            {/* Shimmer sweep */}
            <div className="about-img-shimmer" />

            {/* Top-left gold corner */}
            <svg className="about-corner-tl" viewBox="0 0 70 70">
              <path className="cp" d="M 60 10 L 10 10 L 10 60" />
            </svg>

            {/* Bottom-right gold corner */}
            <svg className="about-corner-br" viewBox="0 0 56 56">
              <path className="cp" d="M 10 46 L 46 46 L 46 10" />
            </svg>

            {/* Thin right-edge gold line */}
            <div className="about-vline" />
          </div>

        </div>
      </section>
    </>
  );
};

export default AboutSection;