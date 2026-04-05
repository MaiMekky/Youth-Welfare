"use client";
import React, { useEffect, useRef, useState } from "react";
import LoginPage from "./LoginPage";
import SignupPage from "./SignUp";
import styles from "../Styles/components/HeroSection.module.css";

const eligibility = [
  "معدل تراكمي لا يقل عن 2.0",
  "الجنسية المصرية",
  "دخل الأسرة لا يتجاوز 700 جنيه للفرد",
  "ظروف عائلية موثقة",
];

const documents = [
  { label: "بحث اجتماعي", required: true },
  { label: "مفردات دخل", required: true },
  { label: "بطاقة ولي الأمر", required: true },
  { label: "بطاقة الطالب", required: true },
  { label: "حيازة زراعية", required: false },
  { label: "بطاقة تكافل وكرامة", required: false },
];

const SocialSupportSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeScreen, setActiveScreen] = useState<"login" | "signup">("signup");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("in-view");
        });
      },
      { threshold: 0.08 }
    );
    const els = sectionRef.current?.querySelectorAll(".ss-anim");
    els?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Lock body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = showModal ? "" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showModal]);

  return (
    <>
      <style>{`
        :root {
          --gold: #c9a227;
          --navy: #1a2340;
          --text-body: #3a3f52;
        }

        @keyframes ss-up {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ss-left {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes ss-right {
          from { opacity: 0; transform: translateX(-40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes ss-scale {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes ss-lineGrow {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes ss-modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        .ss-anim { opacity: 0; }
        .ss-anim.in-view.ss-up    { animation: ss-up    0.7s cubic-bezier(0.22,1,0.36,1) forwards; }
        .ss-anim.in-view.ss-left  { animation: ss-left  0.75s cubic-bezier(0.22,1,0.36,1) forwards; }
        .ss-anim.in-view.ss-right { animation: ss-right 0.75s cubic-bezier(0.22,1,0.36,1) forwards; }
        .ss-anim.in-view.ss-scale { animation: ss-scale 0.7s cubic-bezier(0.22,1,0.36,1) forwards; }

        .ss-d0  { animation-delay: 0.00s; }
        .ss-d1  { animation-delay: 0.08s; }
        .ss-d2  { animation-delay: 0.16s; }
        .ss-d3  { animation-delay: 0.14s; }
        .ss-d4  { animation-delay: 0.22s; }
        .ss-d5  { animation-delay: 0.30s; }
        .ss-d6  { animation-delay: 0.28s; }
        .ss-d7  { animation-delay: 0.36s; }
        .ss-d8  { animation-delay: 0.44s; }
        .ss-d9  { animation-delay: 0.52s; }

        /* ── Section ── */
        .ss-section {
          background: #f5f6fa;
          direction: rtl;
          padding: clamp(4rem, 8vw, 6.5rem) clamp(1.2rem, 5vw, 3rem);
          overflow: hidden;
        }

        /* ── Header ── */
        .ss-header {
          text-align: center;
          margin-bottom: clamp(2rem, 4vw, 3rem);
        }

        .ss-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 700;
          color: var(--gold);
          letter-spacing: 2px;
          border: 1.5px solid var(--gold);
          border-radius: 999px;
          padding: 5px 18px;
          margin-bottom: 1.1rem;
        }

        .ss-title {
          font-size: clamp(28px, 5vw, 56px);
          font-weight: 900;
          color: var(--navy);
          margin: 0 0 0.6rem;
          line-height: 1.1;
        }

        .ss-subtitle {
          font-size: clamp(13px, 1.35vw, 15px);
          color: #64748b;
          max-width: 480px;
          margin: 0 auto;
          line-height: 1.85;
        }

        /* ── Cards grid ── */
        .ss-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(14px, 2vw, 22px);
          max-width: 1000px;
          margin: 0 auto clamp(2rem, 4vw, 3rem);
        }

        .ss-card {
          background: #fff;
          border-radius: 18px;
          padding: clamp(1.4rem, 2.5vw, 1.8rem);
          box-shadow: 0 2px 12px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04);
          transition: transform 0.38s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .ss-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 48px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05);
        }

        /* Gold top accent */
        .ss-card-accent {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: var(--gold);
          transform-origin: right center;
          transform: scaleX(0.3);
          transition: transform 0.5s cubic-bezier(0.22,1,0.36,1);
        }
        .ss-card:hover .ss-card-accent { transform: scaleX(1); }

        /* Card header */
        .ss-card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 1.2rem;
          padding-bottom: 0.9rem;
          border-bottom: 1.5px solid #f0f0f0;
        }
        .ss-card-title {
          font-size: clamp(15px, 1.6vw, 18px);
          font-weight: 800;
          color: var(--navy);
          margin: 0;
        }
        .ss-card-icon-box {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #fff8e8;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
        }
        .ss-card:hover .ss-card-icon-box { transform: rotate(-8deg) scale(1.1); }

        /* ── Eligibility list ── */
        .ss-elig-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .ss-elig-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: clamp(12.5px, 1.2vw, 14px);
          color: var(--text-body);
          font-weight: 500;
          padding: 8px 10px;
          border-radius: 10px;
          background: #f8f9fc;
          transition: background 0.25s ease, transform 0.25s ease;
        }
        .ss-elig-item:hover {
          background: #fff8e8;
          transform: translateX(-4px);
        }
        .ss-elig-dot {
          width: 7px;
          height: 7px;
          min-width: 7px;
          border-radius: 50%;
          background: var(--gold);
        }

        /* ── Documents list ── */
        .ss-doc-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .ss-doc-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          font-size: clamp(12.5px, 1.2vw, 14px);
          color: var(--text-body);
          font-weight: 500;
          padding: 8px 10px;
          border-radius: 10px;
          background: #f8f9fc;
          transition: background 0.25s ease, transform 0.25s ease;
        }
        .ss-doc-item:hover {
          background: #fff8e8;
          transform: translateX(-4px);
        }
        .ss-doc-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ss-doc-line {
          width: 3px;
          height: 16px;
          border-radius: 2px;
          background: var(--gold);
          flex-shrink: 0;
        }
        .ss-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 9px;
          border-radius: 999px;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .ss-badge-req {
          background: #fee2e2;
          color: #dc2626;
        }
        .ss-badge-opt {
          background: #e0f2fe;
          color: #0284c7;
        }

        /* ── CTA Banner ── */
        .ss-cta {
          max-width: 1000px;
          margin: 0 auto;
          background: var(--navy);
          border-radius: 18px;
          padding: clamp(1.8rem, 3vw, 2.4rem) clamp(2rem, 5vw, 3.5rem);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .ss-cta-text h3 {
          font-size: clamp(18px, 2.4vw, 26px);
          font-weight: 900;
          color: #fff;
          margin: 0 0 0.35rem;
          line-height: 1.2;
        }
        .ss-cta-text p {
          font-size: clamp(12px, 1.15vw, 14px);
          color: rgba(255,255,255,0.65);
          margin: 0;
          line-height: 1.7;
        }

        .ss-btn {
          background: var(--gold);
          color: #fff;
          font-size: clamp(13px, 1.3vw, 15px);
          font-weight: 800;
          border: none;
          border-radius: 12px;
          padding: 13px 32px;
          cursor: pointer;
          white-space: nowrap;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease, background 0.25s ease;
          box-shadow: 0 4px 20px rgba(201,162,39,0.35);
          font-family: inherit;
        }
        .ss-btn:hover {
          transform: translateY(-3px) scale(1.04);
          box-shadow: 0 8px 28px rgba(201,162,39,0.5);
          background: #d4ad2e;
        }
        .ss-btn:active { transform: scale(0.97); }

        /* Modal uses HeroSection styles */

        /* ── Responsive ── */
        @media (max-width: 700px) {
          .ss-cards { grid-template-columns: 1fr; }
          .ss-cta { flex-direction: column; text-align: center; }
          .ss-btn { width: 100%; }
        }
      `}</style>

      <section className="ss-section" ref={sectionRef} id="social-support">

        {/* Header */}
        <div className="ss-header">
          <div className="ss-anim ss-up ss-d0 ss-eyebrow">نظام التكافل الاجتماعي</div>
          <h2 className="ss-anim ss-up ss-d1 ss-title">الدعم الاجتماعي للطلاب</h2>
          <p className="ss-anim ss-up ss-d2 ss-subtitle">
            نوفر الدعم المالي والاجتماعي للطلاب المحتاجين لضمان فرص متساوية للتعليم
          </p>
        </div>

        {/* Cards */}
        <div className="ss-cards">

          {/* Eligibility */}
          <div className="ss-anim ss-right ss-d3 ss-card">
            <div className="ss-card-accent" />
            <div className="ss-card-header">
              <div className="ss-card-icon-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <h3 className="ss-card-title">شروط الاستحقاق</h3>
            </div>
            <ul className="ss-elig-list">
              {eligibility.map((item, i) => (
                <li key={i} className="ss-elig-item">
                  <span className="ss-elig-dot" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Documents */}
          <div className="ss-anim ss-left ss-d3 ss-card">
            <div className="ss-card-accent" />
            <div className="ss-card-header">
              <div className="ss-card-icon-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
              <h3 className="ss-card-title">المستندات المطلوبة</h3>
            </div>
            <ul className="ss-doc-list">
              {documents.map((doc, i) => (
                <li key={i} className="ss-doc-item">
                  <div className="ss-doc-left">
                    <div className="ss-doc-line" />
                    {doc.label}
                  </div>
                  <span className={`ss-badge ${doc.required ? "ss-badge-req" : "ss-badge-opt"}`}>
                    {doc.required ? "مطلوب" : "إن وُجد"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="ss-anim ss-scale ss-d6">
          <div className="ss-cta">
            <div className="ss-cta-text">
              <h3>التعليم حق للجميع</h3>
              <p>نؤمن بأن الظروف المادية لا يجب أن تكون عائقًا أمام تحقيق أحلامك الأكاديمية</p>
            </div>
            <button className="ss-btn" onClick={() => { setActiveScreen("signup"); setShowModal(true); }}>
              قدم طلبك الآن
            </button>
          </div>
        </div>

      </section>

      {/* Modal — same pattern as HeroSection */}
      {showModal && (
        <div className={styles.fullScreenOverlay}>
          <div className={styles.modalCard}>
            {activeScreen === "login" ? (
              <LoginPage
                onClose={() => setShowModal(false)}
                onSwitchToSignup={() => setActiveScreen("signup")}
              />
            ) : (
              <SignupPage
                onClose={() => setShowModal(false)}
                onSwitchToLogin={() => setActiveScreen("login")}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SocialSupportSection;