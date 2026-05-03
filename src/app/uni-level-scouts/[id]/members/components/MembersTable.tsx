"use client";
import React from "react";
import styles from "../Members.module.css";
import { Edit2, Trash2, Mail, GitBranch } from "lucide-react";
import type { Member } from "../page";
import { getStatusText, SCOUT_STATUS } from "../../../utils/scoutsDataMapper";

interface Props {
  members: Member[];
  onChangeRole: (member: Member) => void;
  onRemove: (member: Member) => void;
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

function getStatusBadgeClass(status: string) {
  switch (status) {
    case SCOUT_STATUS.ACCEPTED:
      return styles.badgeAccepted;
    case SCOUT_STATUS.PENDING:
      return styles.badgePending;
    case SCOUT_STATUS.REJECTED:
      return styles.badgeRejected;
    default:
      return styles.badgeDefault;
  }
}

export default function MembersTable({ members, onChangeRole, onRemove }: Props) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>الاسم</th>
            <th>البريد الإلكتروني</th>
            <th>الدور</th>
            <th>الحالة</th>
            <th>المجموعة</th>
            <th>تاريخ الانضمام</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.member_id}>
              <td>
                <div className={styles.memberName}>
                  <div className={styles.memberAvatar}>
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <span>{member.name}</span>
                </div>
              </td>
              <td>
                <div className={styles.emailCell}>
                  <Mail size={14} />
                  <span>{member.email}</span>
                </div>
              </td>
              <td>
                <span className={styles.roleText}>{member.role || "—"}</span>
              </td>
              <td>
                <span className={getStatusBadgeClass(member.status)}>
                  {getStatusText(member.status)}
                </span>
              </td>
              <td>
                {member.group_name ? (
                  <div className={styles.groupCell}>
                    <GitBranch size={14} />
                    <span>{member.group_name}</span>
                  </div>
                ) : (
                  <span className={styles.noGroup}>بلا مجموعة</span>
                )}
              </td>
              <td>
                <span className={styles.dateText}>{formatDate(member.joined_at)}</span>
              </td>
              <td>
                <div className={styles.actions}>
                  <button
                    className={styles.editBtn}
                    onClick={() => onChangeRole(member)}
                    title="تغيير الدور"
                    disabled={member.status !== SCOUT_STATUS.ACCEPTED}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => onRemove(member)}
                    title="إزالة العضو"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
