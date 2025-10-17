"use client";

import React, { useState, useEffect } from "react";
import styles from "../Styles/components/Statistics.module.css";

interface StatItem {
  icon: string;
  value: string;
  label: string;
  desc: string;
  id: number;
}

const Statistics: React.FC = () => {
  const [stats, setStats] = useState<StatItem[]>([]);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    setStats([
      { icon: "📚", value: "187", label: "نشاط فعال", desc: "+ نشاط جديد", id: 1 },
      { icon: "👨‍🎓", value: "15,247", label: "طالب مسجل", desc: "من العام الماضي", id: 2 },
      { icon: "📅", value: "28", label: "فعالية قادمة", desc: "خلال الشهر القادم", id: 3 },
      { icon: "🏅", value: "156", label: "جائزة حققناها", desc: "45+ جائزة هذا العام", id: 4 },
    ]);
  }, []);

  const statCardStyle: React.CSSProperties = {
    backgroundColor: "white",
    padding: "1.5rem 1rem",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    transition: "all 0.3s ease",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "180px",
  };

  const statCardHoverStyle: React.CSSProperties = {
    ...statCardStyle,
    transform: "translateY(-5px)",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
  };

  const iconStyle: React.CSSProperties = {
    fontSize: "2.5rem",
    marginBottom: "0.8rem",
  };

  const numberStyle: React.CSSProperties = {
    fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: "0.3rem",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "clamp(1rem, 1.5vw, 1.1rem)",
    color: "#7f8c8d",
    marginBottom: "0.3rem",
    fontWeight: "600",
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: "0.9rem",
    color: "#3498db",
    fontWeight: "500",
  };

  return (
    <section className={styles.statisticsSection} dir="rtl">
      {/* === Header outside the container === */}
      <div className={styles.header}>
        <h1 className={styles.title}>إحصائيات الجامعة</h1>
        <p className={styles.subtitle}>أرقام تعكس نشاط وحيوية مجتمعنا الجامعي</p>
      </div>

      {/* === Container card with title + 4 stats === */}
      <div className={styles.containerCard}>
        <h2 className={styles.innerTitle}>إحصائيات سريعة</h2>

        <div className={styles.statsGrid}>
          {stats.map((stat) => (
            <div
              key={stat.id}
              style={hoveredCard === stat.id ? statCardHoverStyle : statCardStyle}
              onMouseEnter={() => setHoveredCard(stat.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div style={iconStyle}>{stat.icon}</div>
              <div style={numberStyle}>{stat.value}</div>
              <div style={labelStyle}>{stat.label}</div>
              <div style={descriptionStyle}>{stat.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Statistics;
