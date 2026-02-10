"use client";
import React, { useState } from "react";
import LoginPage from "./LoginPage";
import SignupPage from "./SignUp";
import { useLanguage } from "../context/LanguageContext";

const VisionSection: React.FC = () => {
  const { language } = useLanguage();

  // ✅ Local state for modal
  const [showModal, setShowModal] = useState(false);
  const [activeScreen, setActiveScreen] = useState<"login" | "signup">("signup");

  const sectionStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: language === "ar" ? "row-reverse" : "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "clamp(1.5rem, 4vw, 2.5rem)",
    padding: "clamp(2rem, 6vw, 4.375rem) clamp(1rem, 4vw, 1.875rem)",
    background: "#f8f9fb",
    direction: language === "ar" ? "rtl" : "ltr",
  };

  const cardStyle: React.CSSProperties = {
    flex: "1 1 min(350px, 100%)",
    background: "linear-gradient(135deg, #27285D, #B38E19)",
    color: "white",
    borderRadius: "20px",
    padding: "clamp(1.5rem, 4vw, 2.5rem) clamp(1.25rem, 3vw, 2.1875rem)",
    boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
    textAlign: language === "ar" ? "right" : "left",
    fontFamily: language === "ar" ? "'Cairo', sans-serif" : "'Poppins', sans-serif",
    maxWidth: "min(420px, 100%)",
    minHeight: "min(280px, auto)",
    width: "100%",
  };

  const textContainerStyle: React.CSSProperties = {
    flex: "1 1 min(450px, 100%)",
    maxWidth: "min(650px, 100%)",
    width: "100%",
    color: "#333",
    fontFamily: language === "ar" ? "'Cairo', sans-serif" : "'Poppins', sans-serif",
    textAlign: language === "ar" ? "right" : "left",
  };

  const headingStyle: React.CSSProperties = {
    fontSize: "clamp(1.5rem, 3vw, 2rem)",
    fontWeight: "700",
    color: "#27285D",
    marginBottom: "1.25rem",
  };

  const subHeadingStyle: React.CSSProperties = {
    fontSize: "clamp(1.125rem, 2.5vw, 1.4rem)",
    fontWeight: "600",
    color: "#27285D",
    marginTop: "1.25rem",
    marginBottom: "0.625rem",
  };

  const paragraphStyle: React.CSSProperties = {
    fontSize: "clamp(0.9375rem, 2vw, 1.05rem)",
    lineHeight: "1.8",
    color: "#444",
  };

  const buttonStyle: React.CSSProperties = {
    marginTop: "25px",
    padding: "12px 24px",
    backgroundColor: "#fff",
    color: "#27285D",
    fontWeight: "600",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    transition: "all 0.3s ease",
  };

  const buttonHoverStyle: React.CSSProperties = {
    backgroundColor: "#e6e6e6",
  };

  const [hover, setHover] = useState(false);

  // Language content
  const visionTitle = language === "ar" ? "رؤيتنا ورسالتنا" : "Our Vision & Mission";
  const visionSubTitle = language === "ar" ? "رؤيتنا" : "Our Vision";
  const visionText =
    language === "ar"
      ? "أن نكون الجهة الرائدة في رعاية الشباب الجامعي وتنمية قدراتهم ومهاراتهم ليكونوا قادة المستقبل."
      : "To be the leading entity in nurturing university youth and developing their skills and abilities to become future leaders.";
  const missionSubTitle = language === "ar" ? "رسالتنا" : "Our Mission";
  const missionText =
    language === "ar"
      ? "توفير برامج وأنشطة متميزة تساهم في الارتقاء بالمستوى الثقافي والعلمي والرياضي للطلاب."
      : "Providing outstanding programs and activities that enhance the cultural, scientific, and athletic levels of students.";
  const cardTitle = language === "ar" ? "انضم إلينا اليوم" : "Join Us Today";
  const cardText =
    language === "ar"
      ? "ابدأ رحلتك معنا واكتشف الفرص اللامحدودة للنمو والتطور في بيئة جامعية محفزة ومبدعة."
      : "Start your journey with us and discover limitless opportunities for growth and creativity in an inspiring university environment.";
  const buttonText = language === "ar" ? "سجل الآن" : "Register Now";

  return (
    <section style={sectionStyle}>
      {/* Left Card Box */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: "1.8rem", marginBottom: "15px" }}>{cardTitle}</h2>
        <p style={{ fontSize: "1.05rem", lineHeight: "1.7" }}>{cardText}</p>
        <button
          style={hover ? { ...buttonStyle, ...buttonHoverStyle } : buttonStyle}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onClick={() => {
            setActiveScreen("signup"); // open signup
            setShowModal(true);
          }}
        >
          {buttonText}
        </button>
      </div>

      {/* Right Text Section */}
      <div style={textContainerStyle}>
        <h2 style={headingStyle}>{visionTitle}</h2>
        <h3 style={subHeadingStyle}>{visionSubTitle}</h3>
        <p style={paragraphStyle}>{visionText}</p>
        <h3 style={subHeadingStyle}>{missionSubTitle}</h3>
        <p style={paragraphStyle}>{missionText}</p>
      </div>

      {/* ✅ Modal Popup */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              // backgroundColor: "#fff",
              borderRadius: "15px",
              padding: "30px",
              maxWidth: "500px",
              width: "90%",
            }}
          >
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
  );
};

export default VisionSection;