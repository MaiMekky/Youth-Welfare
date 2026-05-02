"use client";
import React from "react";
import styles from "../styles/ClanCard.module.css";
import { Shield, Users, Calendar, Edit2, Building2, Star } from "lucide-react";
import type { Clan } from "../page";

interface Props {
  clan: Clan;
  onEditClick: () => void;
}

function formatDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ClanCard({ clan, onEditClick }: Props) {
  const isActive = clan.status === "نشط";

  return (
    <div className={styles.card}>
      {/* ── Decorative background orbs ── */}
      <div className={styles.orbTop} />
      <div className={styles.orbBottom} />

      {/* ── Header Band ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.iconWrap}>
            <Shield size={26} strokeWidth={1.8} />
          </div>
          <div className={styles.titleStack}>
            <span className={styles.eyebrow}>عشيرة الكلية</span>
            <h2 className={styles.clanName}>{clan.name}</h2>
          </div>
        </div>

        <div className={styles.headerRight}>
          <span className={isActive ? styles.badgeActive : styles.badgeInactive}>
            <span className={styles.dot} />
            {clan.status}
          </span>
          <button className={styles.editBtn} onClick={onEditClick} aria-label="تعديل">
            <Edit2 size={14} strokeWidth={2.2} />
            <span>تعديل</span>
          </button>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className={styles.divider} />

      {/* ── Description ── */}
      <div className={styles.descSection}>
        <div className={styles.descHeader}>
          <Star size={13} strokeWidth={2} />
          <span className={styles.sectionLabel}>الوصف</span>
        </div>
        <p className={styles.desc}>
          {clan.description?.trim()
            ? clan.description
            : <span className={styles.muted}>لا يوجد وصف</span>}
        </p>
      </div>

      {/* ── Meta Pills Row ── */}
      <div className={styles.metaRow}>
        <div className={styles.metaPill}>
          <div className={styles.metaPillIcon}>
            <Users size={14} strokeWidth={2} />
          </div>
          <div className={styles.metaPillContent}>
            <span className={styles.metaLabel}>الأعضاء الحاليون</span>
            <span className={styles.metaValue}>{clan.members_count ?? 0}</span>
          </div>
        </div>

        <div className={styles.metaPill}>
          <div className={styles.metaPillIcon}>
            <Shield size={14} strokeWidth={2} />
          </div>
          <div className={styles.metaPillContent}>
            <span className={styles.metaLabel}>الحد الأدنى</span>
            <span className={styles.metaValue}>{clan.min_members ?? "—"}</span>
          </div>
        </div>

        <div className={styles.metaPill}>
          <div className={styles.metaPillIcon}>
            <Building2 size={14} strokeWidth={2} />
          </div>
          <div className={styles.metaPillContent}>
            <span className={styles.metaLabel}>الكلية</span>
            <span className={styles.metaValue}>{clan.faculty_name || "—"}</span>
          </div>
        </div>

        <div className={styles.metaPill}>
          <div className={styles.metaPillIcon}>
            <Calendar size={14} strokeWidth={2} />
          </div>
          <div className={styles.metaPillContent}>
            <span className={styles.metaLabel}>تاريخ الإنشاء</span>
            <span className={styles.metaValue}>{formatDate(clan.created_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}