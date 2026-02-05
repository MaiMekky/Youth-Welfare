"use client";

import React from "react";

export default function MainPage() {
  return (
    <div style={{ 
      padding: "40px 20px", 
      textAlign: "center",
      minHeight: "60vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <h1 style={{ 
        fontSize: "2.5rem", 
        color: "#2C3A5F",
        marginBottom: "20px"
      }}>
        مرحباً بك في بوابة رعاية الشباب
      </h1>
      <p style={{ 
        fontSize: "1.2rem", 
        color: "#64748b",
        maxWidth: "600px",
        lineHeight: "1.8"
      }}>
        يمكنك الوصول إلى جميع الخدمات والأنشطة المتاحة من خلال القائمة العلوية
      </p>
    </div>
  );
}

