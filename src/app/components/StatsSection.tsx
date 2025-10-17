"use client";
import React, { useEffect, useState } from "react";
import styles from "../Styles/components/StatsSection.module.css";

interface StatItem {
  icon: string;
  value: string;
  label: string;
  desc: string;
}

const StatsSection: React.FC = () => {
  const [stats, setStats] = useState<StatItem[]>([]);

  useEffect(() => {
    setStats([
      { icon: "📚", value: "+25", label: "نادي طلابي", desc: "في مختلف المجالات" },
      { icon: "🏅", value: "+50", label: "جائزة وتكريم", desc: "للطلاب المتميزين" },
      { icon: "📅", value: "+200", label: "فعالية سنوية", desc: "متنوعة ومتخصصة" },
      { icon: "👨‍🎓", value: "+15,000", label: "طالب مسجل", desc: "في جميع الأنشطة والبرامج" },
    ]);
  }, []);

  return (
    <section className={styles.statsSection}>
      <div className={styles.statsOverlay}>
        <div className={styles.statsContainer}>
          {stats.map((item, index) => (
            <div className={styles.statCard} key={index}>
              <div className={styles.statIcon}>{item.icon}</div>
              <div className={styles.statValue}>{item.value}</div>
              <div className={styles.statLabel}>{item.label}</div>
              <div className={styles.statDesc}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
    
  );
};

export default StatsSection;
