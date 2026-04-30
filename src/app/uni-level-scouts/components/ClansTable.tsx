"use client";
import React from "react";
import styles from "../styles/ClansTable.module.css";
import { Eye, Power, Building2, Users, GitBranch, Clock } from "lucide-react";
import type { Clan } from "../page";

interface Props {
  clans: Clan[];
  onView: (clanId: number) => void;
  onToggleStatus: (clanId: number, currentStatus: string) => void;
}

function formatDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ClansTable({ clans, onView, onToggleStatus }: Props) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>اسم العشيرة</th>
            <th>الكلية</th>
            <th>الحالة</th>
            <th>الأعضاء</th>
            <th>المجموعات</th>
            <th>طلبات معلقة</th>
            <th>تاريخ الإنشاء</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {clans.map((clan) => {
            const isActive = clan.status === "نشط";
            return (
              <tr key={clan.clan_id}>
                <td>
                  <div className={styles.clanName}>
                    <div className={styles.clanIcon}>
                      <Building2 size={16} />
                    </div>
                    <span>{clan.name}</span>
                  </div>
                </td>
                <td>
                  <span className={styles.facultyName}>{clan.faculty_name || "—"}</span>
                </td>
                <td>
                  <span className={isActive ? styles.badgeActive : styles.badgeInactive}>
                    <span className={styles.dot} />
                    {clan.status}
                  </span>
                </td>
                <td>
                  <div className={styles.statCell}>
                    <Users size={14} />
                    <span>{clan.members_count || 0}</span>
                  </div>
                </td>
                <td>
                  <div className={styles.statCell}>
                    <GitBranch size={14} />
                    <span>{clan.groups_count || 0}</span>
                  </div>
                </td>
                <td>
                  <div className={styles.statCell}>
                    <Clock size={14} />
                    <span className={clan.pending_count > 0 ? styles.pendingHighlight : ""}>
                      {clan.pending_count || 0}
                    </span>
                  </div>
                </td>
                <td>
                  <span className={styles.dateText}>{formatDate(clan.created_at)}</span>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button
                      className={styles.viewBtn}
                      onClick={() => onView(clan.clan_id)}
                      title="عرض التفاصيل"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className={isActive ? styles.toggleBtnActive : styles.toggleBtnInactive}
                      onClick={() => onToggleStatus(clan.clan_id, clan.status)}
                      title={isActive ? "تعطيل" : "تفعيل"}
                    >
                      <Power size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
