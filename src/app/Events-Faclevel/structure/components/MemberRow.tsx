"use client";
import React from "react";
import styles from "../styles/MemberRow.module.css";
import { User, Crown } from "lucide-react";
import type { ScoutMember } from "../page";

interface Props {
  role: string;
  member: ScoutMember;
  roleColor: "gold" | "blue" | "teal" | "purple" | "green" | "gray";
  isLeader?: boolean;
  compact?: boolean;
}

const GENDER_LABEL: Record<string, string> = {
  M: "ذكر", m: "ذكر",
  F: "أنثى", f: "أنثى",
};

export default function MemberRow({
  role,
  member,
  roleColor,
  isLeader = false,
  compact = false,
}: Props) {
  const genderLabel = GENDER_LABEL[member.gender ?? ""] ?? "";
  const isMale      = ["M", "m"].includes(member.gender ?? "");

  return (
    <div
      className={[
        styles.row,
        compact   ? styles.compact    : "",
        isLeader  ? styles.leaderRow  : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Avatar */}
      <div className={`${styles.avatar} ${styles[`avatar_${roleColor}`]}`}>
        {isLeader
          ? <Crown size={compact ? 14 : 18} />
          : <User  size={compact ? 14 : 18} />}
      </div>

      {/* Info */}
      <div className={styles.info}>
        <span className={`${styles.name} ${isLeader ? styles.leaderName : ""}`}>
          {member.name}
        </span>
        <div className={styles.meta}>
          <span className={`${styles.roleBadge} ${styles[`role_${roleColor}`]}`}>
            {role}
          </span>
          {genderLabel && (
            <span className={`${styles.genderBadge} ${isMale ? styles.male : styles.female}`}>
              {genderLabel}
            </span>
          )}
          {member.group && (
            <span className={styles.groupTag}>{member.group}</span>
          )}
        </div>
      </div>

      {/* ID chip */}
      <span className={styles.idChip}>#{member.scout_member_id}</span>
    </div>
  );
}