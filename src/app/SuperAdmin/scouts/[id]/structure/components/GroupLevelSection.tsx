"use client";
import React, { useState } from "react";
import styles from "../styles/GroupLevelSection.module.css";
import MemberRow from "./MemberRow";
import { Users, ChevronDown, ChevronUp, Shield } from "lucide-react";
import type { GroupLevel, ScoutMember } from "../page";

interface Props {
  groupLevel: GroupLevel;
}

type NormalisedEntry = { role: string; member: ScoutMember };

function normaliseGroup(
  raw: Record<string, ScoutMember> | { leader: ScoutMember | null; members: ScoutMember[] }
): NormalisedEntry[] {
  if ("members" in raw) {
    const g = raw as { leader: ScoutMember | null; members: ScoutMember[] };
    const entries: NormalisedEntry[] = [];
    if (g.leader) entries.push({ role: "قائد رهط", member: g.leader });
    (g.members ?? []).forEach((m) => entries.push({ role: "عضو", member: m }));
    return entries;
  }
  return Object.entries(raw as Record<string, ScoutMember>).map(([role, member]) => ({
    role,
    member,
  }));
}

const GROUP_COLORS = ["blue", "teal", "purple", "green", "amber"] as const;
type GroupColor = (typeof GROUP_COLORS)[number];

interface GroupCardProps {
  name: string;
  groupData: Record<string, ScoutMember> | { leader: ScoutMember | null; members: ScoutMember[] };
  colorIdx: number;
  animDelay: number;
}

function GroupCard({ name, groupData, colorIdx, animDelay }: GroupCardProps) {
  const [open, setOpen] = useState(true);
  const entries = normaliseGroup(groupData);
  const colorKey: GroupColor = GROUP_COLORS[colorIdx % GROUP_COLORS.length];
  const leaderEntry = entries.find(
    (e) => e.role === "رائد رهط" || e.role === "رائدة رهط" || e.role === "قائد رهط"
  );

  return (
    <div
      className={`${styles.groupCard} ${styles[`accent_${colorKey}`]}`}
      style={{ animationDelay: `${animDelay}ms` }}
    >
      {/* Group header */}
      <div className={styles.groupHeader} onClick={() => setOpen((p) => !p)}>
        <div className={styles.groupHeaderLeft}>
          <div className={styles.groupIcon}>
            <Users size={17} />
          </div>
          <div style={{ minWidth: 0 }}>
            <h3 className={styles.groupName}>{name}</h3>
            {leaderEntry && (
              <p className={styles.groupLeaderName}>
                <Shield size={10} />
                {leaderEntry.member.name}
              </p>
            )}
          </div>
        </div>

        <div className={styles.groupMeta}>
          <span className={styles.memberCount}>{entries.length} عضو</span>
          <button className={styles.groupToggleBtn} aria-label="طي/توسيع">
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Members list */}
      {open && (
        <div className={styles.membersList}>
          {entries.map((e, idx) => (
            <MemberRow
              key={`${e.member.scout_member_id}-${idx}`}
              role={e.role}
              member={e.member}
              roleColor={
                e.role === "رائد رهط" || e.role === "رائدة رهط" || e.role === "قائد رهط"
                  ? "gold"
                  : "gray"
              }
              isLeader={e.role === "رائد رهط" || e.role === "رائدة رهط" || e.role === "قائد رهط"}
              compact
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function GroupLevelSection({ groupLevel }: Props) {
  const [sectionOpen, setSectionOpen] = useState(true);
  const groups = Object.entries(groupLevel);

  return (
    <section className={styles.section}>
      {/* Section Header */}
      <div className={styles.sectionHeader} onClick={() => setSectionOpen((p) => !p)}>
        <div className={styles.sectionHeaderLeft}>
          <div className={styles.sectionIcon}>
            <Users size={20} />
          </div>
          <div>
            <h2 className={styles.sectionTitle}>مستوى الرهوط</h2>
            <p className={styles.sectionSub}>المجموعات وتوزيع الأعضاء</p>
          </div>
        </div>
        <div className={styles.sectionMeta}>
          <span className={styles.countBadge}>{groups.length} رهط</span>
          <button className={styles.toggleBtn} aria-label="توسيع / طي">
            {sectionOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {sectionOpen && (
        <div className={styles.groupsGrid}>
          {groups.length === 0 ? (
            <div className={styles.noGroups}>لا يوجد رهوط مضافة بعد</div>
          ) : (
            groups.map(([name, data], idx) => (
              <GroupCard
                key={name}
                name={name}
                groupData={
                  data as
                    | Record<string, ScoutMember>
                    | { leader: ScoutMember | null; members: ScoutMember[] }
                }
                colorIdx={idx}
                animDelay={idx * 50}
              />
            ))
          )}
        </div>
      )}
    </section>
  );
}
