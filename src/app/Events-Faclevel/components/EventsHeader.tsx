"use client";

import React from "react";
import styles from "../styles/EventsPage.module.css";
import { Plus } from "lucide-react";

export default function EventsHeader({
  title,
  subtitle,
  onCreate,
}: {
  title: string;
  subtitle: string;
  onCreate: () => void;
}) {
  return (
    <div className={styles.header}>
      <div className={styles.headerText}>
        <h1 className={styles.pageTitle}>{title}</h1>
        <p className={styles.pageSubtitle}>{subtitle}</p>
      </div>

      <button className={styles.createBtn} type="button" onClick={onCreate}>
        <Plus size={18} />
        إنشاء فعالية جديدة
      </button>
    </div>
  );
}
