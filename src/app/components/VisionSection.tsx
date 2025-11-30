"use client";
import React from "react";
import { useLanguage } from "../context/LanguageContext";

const VisionSection: React.FC = () => {
  const { language } = useLanguage();

  const sectionStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: language === "ar" ? "row-reverse" : "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "40px",
    padding: "70px 30px",
    background: "#f8f9fb",
    direction: language === "ar" ? "rtl" : "ltr",
  };

  const cardStyle: React.CSSProperties = {
    flex: "1 1 350px",
    background: "linear-gradient(135deg, #27285D, #B38E19)",
    color: "white",
    borderRadius: "20px",
    padding: "40px 35px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
    textAlign: language === "ar" ? "right" : "left",
    fontFamily: language === "ar" ? "'Cairo', sans-serif" : "'Poppins', sans-serif",
    maxWidth: "420px",
    minHeight: "280px",
  };

  const textContainerStyle: React.CSSProperties = {
    flex: "1 1 450px",
    maxWidth: "650px",
    color: "#333",
    fontFamily: language === "ar" ? "'Cairo', sans-serif" : "'Poppins', sans-serif",
    textAlign: language === "ar" ? "right" : "left",
  };

  const headingStyle: React.CSSProperties = {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#27285D",
    marginBottom: "20px",
  };

  const subHeadingStyle: React.CSSProperties = {
    fontSize: "1.4rem",
    fontWeight: "600",
    color: "#27285D",
    marginTop: "20px",
    marginBottom: "10px",
  };

  const paragraphStyle: React.CSSProperties = {
    fontSize: "1.05rem",
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

  const [hover, setHover] = React.useState(false);

  // Language content
  const visionTitle =
    language === "ar" ? "رؤيتنا ورسالتنا" : "Our Vision & Mission";
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
    </section>
  );
};

export default VisionSection;
