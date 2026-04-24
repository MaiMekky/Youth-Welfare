"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import styles from "../Styles/components/HeroSection.module.css";
import LoginPage from "./LoginPage";
import SignupPage from "./SignUp";

const images = [
  "/جامعة_حلوان.jpg",
  "/IMG-20250515-WA0010.jpg",
  "/1649330041hkSEye2WOH.jpeg",
];

const SLIDE_DURATION = 3000;
const SWIPE_THRESHOLD = 60;

const HeroSection: React.FC = () => {
  const [showModal, setShowModal]       = useState(false);
  const [activeScreen, setActiveScreen] = useState<"login" | "signup">("login");
  const [current, setCurrent]           = useState(0);
  const [next, setNext]                 = useState<number | null>(null);
  const [turning, setTurning]           = useState(false);
  const [direction, setDirection]       = useState<"left" | "right">("left");

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dragStart   = useRef<number | null>(null);
  const isDragging  = useRef(false);

  const goTo = useCallback((targetIndex: number, dir: "left" | "right") => {
    if (turning) return;
    const target = (targetIndex + images.length) % images.length;
    if (target === current) return;
    setNext(target);
    setDirection(dir);
    setTurning(true);
    setTimeout(() => {
      setCurrent(target);
      setNext(null);
      setTurning(false);
    }, 700);
  }, [turning, current]);

  const startTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      goTo(current + 1, "left");
    }, SLIDE_DURATION);
  }, [current, goTo]);

  useEffect(() => {
    startTimer();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [startTimer]);

  const stopTimer = () => { if (intervalRef.current) clearInterval(intervalRef.current); };

const onPointerDown = (e: React.PointerEvent) => {
  if (showModal) return;
  if ((e.target as HTMLElement).closest("button, a, input, label, select, textarea")) return;
  dragStart.current = e.clientX;
  isDragging.current = false;
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
};

const onPointerMove = (e: React.PointerEvent) => {
  if (showModal || dragStart.current === null) return;
  if (Math.abs(e.clientX - dragStart.current) > 8) isDragging.current = true;
};

const onPointerUp = (e: React.PointerEvent) => {
  if (showModal || dragStart.current === null) return;
  const delta = e.clientX - dragStart.current;
  dragStart.current = null;
  if (!isDragging.current) return;
  stopTimer();
  if (Math.abs(delta) >= SWIPE_THRESHOLD) {
    delta > 0 ? goTo(current - 1, "right") : goTo(current + 1, "left");
  }
};

  const handleScrollToActivities = () => {
    document.getElementById("activities")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <style>{`
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

        /* ── Push-slide animations ── */

        /* Current slides OUT to the right (going forward/left) */
        @keyframes pushOutRight {
          from { transform: translateX(0); }
          to   { transform: translateX(100%); }
        }
        /* Current slides OUT to the left (going back/right) */
        @keyframes pushOutLeft {
          from { transform: translateX(0); }
          to   { transform: translateX(-100%); }
        }
        /* Next slides IN from the left (going forward) */
        @keyframes pushInLeft {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
        /* Next slides IN from the right (going back) */
        @keyframes pushInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }

        .hero-section {
          position: relative;
          min-height: 100dvh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          direction: rtl;
          cursor: grab;
          user-select: none;
        }
        .hero-section:active { cursor: grabbing; }

        .hero-slide-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          will-change: transform;
        }

        /* Static — visible, no animation */
        .slide-static {
          z-index: 1;
          transform: translateX(0);
        }

        /* Current exits right (forward) */
        .slide-out-right {
          z-index: 2;
          animation: pushOutRight 0.7s cubic-bezier(0.77, 0, 0.18, 1) forwards;
        }
        /* Current exits left (backward) */
        .slide-out-left {
          z-index: 2;
          animation: pushOutLeft 0.7s cubic-bezier(0.77, 0, 0.18, 1) forwards;
        }
        /* Next enters from left (forward) */
        .slide-in-left {
          z-index: 1;
          animation: pushInLeft 0.7s cubic-bezier(0.77, 0, 0.18, 1) forwards;
        }
        /* Next enters from right (backward) */
        .slide-in-right {
          z-index: 1;
          animation: pushInRight 0.7s cubic-bezier(0.77, 0, 0.18, 1) forwards;
        }
        /* Hidden slides */
        .slide-idle {
          z-index: 0;
          transform: translateX(100%);
        }

        .hero-overlay {
          background: rgba(8, 13, 26, 0.68);
          flex: 1;
          min-height: 100dvh;
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: clamp(5rem, 10vw, 7rem) clamp(1.5rem, 5vw, 4rem) clamp(3rem, 5vw, 4rem);
          box-sizing: border-box;
          position: relative;
          z-index: 3;
          pointer-events: none;
        }

        .hero-content {
          max-width: min(900px, 92vw);
          width: 100%;
          color: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          pointer-events: all;
        }

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
        .hero-separator {
          width: 80px; height: 3px;
          background-color: #c9a227;
          border-radius: 3px;
          margin: 8px auto 18px auto;
          opacity: 0;
          transform-origin: center center;
          animation: separatorGrow 0.55s ease 0.7s forwards;
        }
        .hero-subtitle {
          font-size: clamp(26px, 5vw, 58px);
          font-weight: 700;
          color: #c9a227;
          margin: 0 0 18px 0;
          line-height: 1.2;
          opacity: 0;
          animation: slideUpFade 0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.85s forwards;
        }
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
        .hero-buttons {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          gap: 16px;
          align-items: center;
          justify-content: center;
        }
        .hero-btn-gold {
          background-color: #c9a227; color: #fff; border: none;
          border-radius: 50px;
          padding: clamp(0.75rem,2vw,0.9rem) clamp(2rem,3.5vw,2.8rem);
          font-size: clamp(0.95rem,1.8vw,1.1rem);
          font-weight: 700; cursor: pointer;
          transition: background 0.25s, transform 0.15s, box-shadow 0.25s;
          min-height: 50px; white-space: nowrap;
          opacity: 0;
          animation: btnReveal 0.55s cubic-bezier(0.34,1.56,0.64,1) 1.25s forwards;
        }
        .hero-btn-gold:hover { background-color:#a8831a; transform:translateY(-3px); box-shadow:0 8px 24px rgba(201,162,39,0.4); }
        .hero-btn-gold:active { transform:scale(0.97); }

        .hero-btn-outline {
          background: transparent; color: #fff;
          border: 2px solid #fff; border-radius: 50px;
          padding: clamp(0.75rem,2vw,0.9rem) clamp(2rem,3.5vw,2.8rem);
          font-size: clamp(0.95rem,1.8vw,1.1rem);
          font-weight: 700; cursor: pointer;
          transition: background 0.25s, transform 0.15s, box-shadow 0.25s;
          min-height: 50px; white-space: nowrap;
          opacity: 0;
          animation: btnReveal 0.55s cubic-bezier(0.34,1.56,0.64,1) 1.4s forwards;
        }
        .hero-btn-outline:hover { background:rgba(255,255,255,0.15); transform:translateY(-3px); box-shadow:0 8px 24px rgba(255,255,255,0.15); }
        .hero-btn-outline:active { transform:scale(0.97); }

        /* ── Dots ── */
        .hero-dots {
          position: absolute;
          bottom: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          z-index: 4;
          pointer-events: all;
        }
        .hero-dot {
          width: 32px;
          height: 4px;
          border-radius: 2px;
          background: rgba(255,255,255,0.35);
          border: none;
          cursor: pointer;
          padding: 0;
          transition: background 0.25s, transform 0.2s;
        }
        .hero-dot.active {
          background: #c9a227;
          transform: scaleX(1.2);
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-uni-name,.hero-separator,.hero-subtitle,.hero-desc,.hero-btn-gold,.hero-btn-outline {
            animation: none !important; opacity: 1 !important; transform: none !important;
          }
          .hero-slide-bg { animation: none !important; }
          .slide-static  { transform: translateX(0) !important; }
        }
        @media (max-width: 1024px) {
          .hero-uni-name { font-size: clamp(52px,10vw,100px); }
          .hero-subtitle { font-size: clamp(24px,4.5vw,46px); }
        }
        @media (max-width: 768px) {
          .hero-overlay { padding-top: clamp(12rem,22vw,12rem); justify-content: flex-start; }
          .hero-uni-name { font-size: clamp(44px,13vw,72px); }
          .hero-subtitle { font-size: clamp(22px,6.5vw,34px); }
          .hero-buttons  { flex-direction: column; width: 100%; max-width: 300px; }
          .hero-btn-gold,.hero-btn-outline { width: 100%; text-align: center; }
        }
        @media (max-width: 480px) {
          .hero-uni-name { font-size: clamp(36px,11vw,56px); }
          .hero-subtitle { font-size: clamp(20px,6vw,28px); }
          .hero-desc     { font-size: clamp(13px,3.5vw,15px); }
        }
      `}</style>

      <section
        className="hero-section"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onMouseEnter={stopTimer}
        onMouseLeave={startTimer}
      >
        {images.map((src, i) => {
          let cls = "hero-slide-bg slide-idle";

         if (turning) {
          if (i === current) {
            // Current exits: forward → left, backward → right
            cls = `hero-slide-bg ${direction === "left" ? "slide-out-left" : "slide-out-right"}`;
          } else if (i === next) {
            // Next enters: forward → from right, backward → from left
            cls = `hero-slide-bg ${direction === "left" ? "slide-in-right" : "slide-in-left"}`;
          }
          } else {
            if (i === current) cls = "hero-slide-bg slide-static";
          }

          return (
            <div
              key={src}
              className={cls}
              style={{ backgroundImage: `url("${src}")` }}
            />
          );
        })}

        <div className="hero-overlay">
          <div className="hero-content">
            <h1 className="hero-uni-name">جامعة العاصمة</h1>
            <div className="hero-separator" />
            <h2 className="hero-subtitle">نصنع قادة المستقبل</h2>
            <p className="hero-desc">بوابة رعاية الطلاب حيث تبدأ رحلتك نحو التميز</p>
            <div className="hero-buttons">
              <button className="hero-btn-gold" onClick={handleScrollToActivities}>
                استكشف الأنشطة
              </button>
              <button
                className="hero-btn-outline"
                onClick={() => { setActiveScreen("login"); setShowModal(true); }}
              >
                تسجيل الدخول
              </button>
            </div>
          </div>
        </div>

        {/* Bar-style dots like capu.edu.eg */}
        <div className="hero-dots">
          {[...images].reverse().map((_, reversedI) => {
            const i = images.length - 1 - reversedI;
            return (
              <button
                key={i}
                className={`hero-dot${i === current ? " active" : ""}`}
                onClick={() => { stopTimer(); goTo(i, i > current ? "left" : "right"); }}
                aria-label={`Go to slide ${i + 1}`}
              />
            );
          })}
        </div>

        {showModal && (
          <div className={styles.fullScreenOverlay}>
            <div className={styles.modalCard}>
              {activeScreen === "login" ? (
                <LoginPage onClose={() => setShowModal(false)} onSwitchToSignup={() => setActiveScreen("signup")} />
              ) : (
                <SignupPage onClose={() => setShowModal(false)} onSwitchToLogin={() => setActiveScreen("login")} />
              )}
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default HeroSection;