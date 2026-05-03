"use client";
import React, { useState } from "react";
import styles from "../styles/ClanLevelSection.module.css";
import MemberRow from "./MemberRow";
import { Shield, ChevronDown, ChevronUp } from "lucide-react";
import type { ClanLevel } from "../page";

const ROLE_COLORS: Record<string, "gold" | "blue" | "teal" | "purple" | "green" | "gray"> = {
  "رائد أكبر":  "gold",
  "مساعد قائد": "blue",
  "سكرتير":     "teal",
  "أمين صندوق": "purple",
  "مرشد":       "green",
};

function getRoleColor(role: string): "gold" | "blue" | "teal" | "purple" | "green" | "gray" {
  return ROLE_COLORS[role] ?? "gray";
}

interface Props {
  clanLevel: ClanLevel;
}

export default function ClanLevelSection({ clanLevel }: Props) {
  const [expanded, setExpanded] = useState(true);
  const entries = Object.entries(clanLevel);

  return (
    <section className={styles.section}>
      {/* Section Header */}
      <div className={styles.sectionHeader} onClick={() => setExpanded((p) => !p)}>
        <div className={styles.sectionHeaderLeft}>
          <div className={styles.sectionIcon}>
            <Shield size={20} />
          </div>
          <div>
            <h2 className={styles.sectionTitle}>مستوى العشيرة</h2>
            <p className={styles.sectionSub}>القيادة العليا والأدوار المركزية</p>
          </div>
        </div>
        <div className={styles.sectionMeta}>
          <span className={styles.countBadge}>{entries.length} دور</span>
          <button className={styles.toggleBtn} aria-label="توسيع / طي">
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Entries Grid */}
      {expanded && (
        <div className={styles.entriesGrid}>
          {entries.map(([role, member]) => (
            <MemberRow
              key={member.scout_member_id}
              role={role}
              member={member}
              roleColor={getRoleColor(role)}
              isLeader={role === "رائد أكبر"}
            />
          ))}
        </div>
      )}
    </section>
  );
}