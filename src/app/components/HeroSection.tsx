"use client";
import React, { useState } from "react";
import styles from "../Styles/components/HeroSection.module.css";
import LoginPage from "./LoginPage";
import SignupPage from "./SignUp";

const HeroSection: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [activeScreen, setActiveScreen] = useState<"login" | "signup">("login");

  const handleScrollToActivities = () => {
    const section = document.getElementById("activities");
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <style>{`
        /* ── Keyframes ── */

        @keyframes uniNameDrop {
          0%   { opacity: 0; transform: translateY(-48px) scaleY(0.82); }
          65%  { transform: translateY(8px) scaleY(1.03); }
          100% { opacity: 1; transform: translateY(0) scaleY(1); }
        }

        @keyframes separatorGrow {
          from { transform: scaleX(0); opacity: 0; }
          to   { transform: scaleX(1); opacity: 1; }
        }

        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes heroFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        @keyframes btnReveal {
          from { opacity: 0; transform: translateY(18px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes scrollBob {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50%       { transform: translateX(-50%) translateY(8px); }
        }

        /* ── Section ── */

        .hero-section {
          position: relative;
          min-height: 100dvh;
          background-size: cover;
          background-position: center;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          direction: rtl;
        }

        /* ── Dark overlay — centered layout ── */

        .hero-overlay {
          background: rgba(8, 13, 26, 0.70);
          flex: 1;
          min-height: 100dvh;
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;          /* center horizontally */
          text-align: center;           /* center text */
          padding: clamp(5rem, 10vw, 7rem) clamp(1.5rem, 5vw, 4rem) clamp(3rem, 5vw, 4rem);
          box-sizing: border-box;
          position: relative;
        }

        /* ── Content block ── */

        .hero-content {
          max-width: min(900px, 92vw);
          width: 100%;
          color: white;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* ── University name: huge, heavy, white ── */

        .hero-uni-name {
          font-size: clamp(64px, 12vw, 100px);
          font-weight: 900;
          color: #ffffff;
          margin: 0 0 4px 0;
          line-height: 1.0;
          letter-spacing: -1px;
          opacity: 0;
          animation: uniNameDrop 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.1s forwards;
        }

        /* ── Gold separator — centered ── */

        .hero-separator {
          width: 80px;
          height: 3px;
          background-color: #c9a227;
          border-radius: 3px;
          margin: 8px auto 18px auto;
          opacity: 0;
          transform-origin: center center;
          animation: separatorGrow 0.55s ease 0.7s forwards;
        }

        /* ── Gold subtitle ── */

        .hero-subtitle {
          font-size: clamp(26px, 5vw, 58px);
          font-weight: 700;
          color: #c9a227;
          margin: 0 0 18px 0;
          line-height: 1.2;
          opacity: 0;
          animation: slideUpFade 0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.85s forwards;
        }

        /* ── Description ── */

        .hero-desc {
          font-size: clamp(15px, 2.2vw, 20px);
          color: #dde1f0;
          line-height: 1.8;
          margin: 0 0 2.6rem 0;
          font-weight: 400;
          max-width: 600px;
          opacity: 0;
          animation: heroFadeIn 0.6s ease 1.1s forwards;
        }

        /* ── Buttons — row, centered ── */

        .hero-buttons {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          gap: 16px;
          align-items: center;
          justify-content: center;
        }

        /* Gold filled */
        .hero-btn-gold {
          background-color: #c9a227;
          color: #fff;
          border: none;
          border-radius: 50px;
          padding: clamp(0.75rem, 2vw, 0.9rem) clamp(2rem, 3.5vw, 2.8rem);
          font-size: clamp(0.95rem, 1.8vw, 1.1rem);
          font-weight: 700;
          cursor: pointer;
          transition: background 0.25s ease, transform 0.15s ease, box-shadow 0.25s ease;
          min-height: 50px;
          white-space: nowrap;
          opacity: 0;
          animation: btnReveal 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) 1.25s forwards;
          letter-spacing: 0.2px;
        }

        .hero-btn-gold:hover {
          background-color: #a8831a;
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(201, 162, 39, 0.4);
        }
        .hero-btn-gold:active { transform: scale(0.97); }

        /* White outline */
        .hero-btn-outline {
          background: transparent;
          color: #ffffff;
          border: 2px solid #ffffff;
          border-radius: 50px;
          padding: clamp(0.75rem, 2vw, 0.9rem) clamp(2rem, 3.5vw, 2.8rem);
          font-size: clamp(0.95rem, 1.8vw, 1.1rem);
          font-weight: 700;
          cursor: pointer;
          transition: background 0.25s ease, transform 0.15s ease, box-shadow 0.25s ease;
          min-height: 50px;
          white-space: nowrap;
          opacity: 0;
          animation: btnReveal 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) 1.4s forwards;
          letter-spacing: 0.2px;
        }

        .hero-btn-outline:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(255, 255, 255, 0.15);
        }
        .hero-btn-outline:active { transform: scale(0.97); }

        /* ── Scroll indicator ── */

        .hero-scroll {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          opacity: 0;
          animation: heroFadeIn 0.5s ease 2s forwards,
                     scrollBob 1.8s ease-in-out 2.5s infinite;
        }

        .hero-scroll-mouse {
          width: 26px;
          height: 42px;
          border: 2px solid rgba(255, 255, 255, 0.55);
          border-radius: 13px;
          position: relative;
        }

        .hero-scroll-dot {
          width: 4px;
          height: 8px;
          background: #c9a227;
          border-radius: 2px;
          position: absolute;
          top: 6px;
          left: 50%;
          transform: translateX(-50%);
        }

        /* ── Reduced motion ── */
        @media (prefers-reduced-motion: reduce) {
          .hero-uni-name,
          .hero-separator,
          .hero-subtitle,
          .hero-desc,
          .hero-btn-gold,
          .hero-btn-outline,
          .hero-scroll {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
          .hero-scroll { transform: translateX(-50%) !important; }
        }

        /* ── Tablet ── */
        @media (max-width: 1024px) {
          .hero-uni-name  { font-size: clamp(52px, 10vw, 100px); }
          .hero-subtitle  { font-size: clamp(24px, 4.5vw, 46px); }
        }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .hero-overlay {
            padding-top: clamp(12rem, 22vw, 12rem);
            justify-content: flex-start;
          }
          .hero-uni-name  { font-size: clamp(44px, 13vw, 72px); }
          .hero-subtitle  { font-size: clamp(22px, 6.5vw, 34px); }
          .hero-buttons {
            flex-direction: column;
            width: 100%;
            max-width: 300px;
          }
          .hero-btn-gold,
          .hero-btn-outline { width: 100%; text-align: center; }
        }

        @media (max-width: 480px) {
          .hero-uni-name  { font-size: clamp(36px, 11vw, 56px); }
          .hero-subtitle  { font-size: clamp(20px, 6vw, 28px); }
          .hero-desc      { font-size: clamp(13px, 3.5vw, 15px); }
        }
      `}</style>

      <section
        className="hero-section"
        style={{
          backgroundImage: 'url("/جامعة_حلوان.jpg")',
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="hero-overlay">
          <div className="hero-content">

            {/* جامعة العاصمة */}
            <h1 className="hero-uni-name">جامعة العاصمة</h1>

            {/* Gold divider */}
            <div className="hero-separator" />

            {/* نصنع قادة المستقبل */}
            <h2 className="hero-subtitle">نصنع قادة المستقبل</h2>

            {/* Description */}
            <p className="hero-desc">
              بوابة رعاية الطلاب حيث تبدأ رحلتك نحو التميز
            </p>

            {/* Buttons — gold first (right in RTL), then outline */}
            <div className="hero-buttons">
              <button
                className="hero-btn-gold"
                onClick={handleScrollToActivities}
              >
                استكشف الأنشطة
              </button>

              <button
                className="hero-btn-outline"
                onClick={() => {
                  setActiveScreen("login");
                  setShowModal(true);
                }}
              >
                تسجيل الدخول
              </button>
            </div>
          </div>

          {/* Scroll indicator
          <div
            className="hero-scroll"
            onClick={handleScrollToActivities}
            aria-label="Scroll down"
          >
            <div className="hero-scroll-mouse">
              <div className="hero-scroll-dot" />
            </div>
          </div> */}
        </div>

        {/* Modal */}
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
      </section>
    </>
  );
};

export default HeroSection;