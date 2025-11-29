"use client";

import React from "react";
import styles from "../styles/Activities.module.css";

interface ActivityCardProps {
  title: string;
  subtitle: string;
  description: string;
  date: string;
  time: string;
  location: string;
  participants: string;
  type: "علمي" | "ثقافي" | "رياضي";
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  title,
  subtitle,
  description,
  date,
  time,
  location,
  participants,
  type,
}) => {
  return (
    <div className={styles.eventCard}>
      <div className={styles.eventHeader}>
        <div className={styles.eventTitleSection}>
          <h2 className={styles.eventTitle}>{title}</h2>
          {type && <span className={`${styles.eventType} ${styles[type]}`}>{type}</span>}
        </div>
        <div className={styles.eventMeta}>
          <span className={styles.eventOrganizer}>{subtitle}</span>
        </div>
      </div>

      <p className={styles.eventDescription}>{description}</p>

      <div className={styles.eventDetails}>
        <div className={styles.detailItem}>
          <span className={styles.icon}>📅</span>
          <span>{date}</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.icon}>🕐</span>
          <span>{time}</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.icon}>📍</span>
          <span>{location}</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.icon}>👥</span>
          <span>{participants}</span>
        </div>
      </div>

      <div className={styles.eventActions}>
        <button className={styles.btnApprove}>اعتماد الفعالية</button>
        <button className={styles.btnReject}>رفض الفعالية</button>
      </div>
    </div>
  );
};

export default ActivityCard;
