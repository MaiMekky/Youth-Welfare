"use client";
import React, { useState } from "react";
import styles from "../Styles/components/HeroSection.module.css";
import StatsSection from "./StatsSection";
import LoginPage from "./LoginPage";
import SignupPage from "./SignUp";

const HeroSection: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [activeScreen, setActiveScreen] = useState<"login" | "signup">("login");

  const handleScrollToActivities = () => {
    const section = document.getElementById("activities");
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  const handleScrollToFooter = () => {
    const footer = document.getElementById("footer");
    if (footer) footer.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      className={styles.hero}
      style={{ 
        backgroundImage: 'url("/bgImg.png")',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className={styles.overlay}>
        <div className={styles.heroContent}>
          <h1 className={styles.universityName}>جامعة العاصمة</h1>
          <div className={styles.separator}></div>
          <h1 className={styles.mainTitle}>مرحباً بكم في بوابة رعاية الطلاب</h1>
          <p className={styles.description}>
            بوابتكم إلى عالم من الفرص والإبداع في بيئة جامعية متميزة.
          </p>

          <div className={styles.buttons}>
            {/* 🟦 Scroll to Activities Button */}
            <button
              className={`${styles.btn} ${styles.primary}`}
              onClick={handleScrollToActivities}
            >
              استكشف الأنشطة
            </button>

            {/* 🟦 Open Login Popup */}
            <button
              className={`${styles.btn} ${styles.secondary}`}
              onClick={() => {
                setActiveScreen("login");
                setShowModal(true);
              }}
            >
              تسجيل الدخول
            </button>

            {/* 🟦 Scroll to Footer Instead of Signup */}
            <button
              className={`${styles.btn} ${styles.outline}`}
              onClick={handleScrollToFooter}
            >
              تواصل معنا
            </button>
          </div>
        </div>

        <div className={styles.statsWrapper}>
          <StatsSection />
        </div>

        {/* ✅ Popup Overlay */}
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
      </div>
    </section>
  );
};

export default HeroSection;
