"use client";
import React from "react";
import { useLanguage } from "../context/LanguageContext";

const Paragraph: React.FC = () => {
  const { t, language } = useLanguage();

  const paragraphStyle: React.CSSProperties = {
    textAlign: language === "ar" ? "right" : "left",
    direction: language === "ar" ? "rtl" : "ltr",
    fontSize: "1.1rem",
    lineHeight: "1.8",
    color: "#333",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: "30px",
    borderRadius: "15px",
    maxWidth: "1000px",
    margin: "40px auto",
    boxShadow: "0px 4px 15px rgba(0,0,0,0.1)",
    fontFamily:
      language === "ar" ? "'Cairo', sans-serif" : "'Poppins', sans-serif",
  };

  const paragraphText: string =
    language === "ar"
      ? "نحن ملتزمون بتوفير بيئة تعليمية وثقافية متميزة تساهم في إعداد جيل من الشباب القادر على مواجهة تحديات المستقبل. من خلال برامجنا المتنوعة والأنشطة المبتكرة، نسعى لتنمية قدرات الطلاب وصقل مواهبهم في جميع المجالات."
      : "We are committed to providing an exceptional educational and cultural environment that prepares a generation of young people capable of facing future challenges. Through our diverse programs and innovative activities, we strive to develop students' abilities and refine their talents in all fields.";

  return (
    <section style={{ display: "flex", justifyContent: "center" }}>
      <p style={paragraphStyle}>{paragraphText}</p>
    </section>
  );
};

export default Paragraph;
