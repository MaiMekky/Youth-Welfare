import React from "react";
import styles from "../styles/MembersTable.module.css";
import { Eye, Users, RefreshCcw, Trash2 } from "lucide-react";
import type { Member } from "../page";

type Props = {
  members: Member[];
  onReview: (m: Member) => void;
  onAssign: (m: Member) => void;
  onChangeRole: (m: Member) => void;
  onDelete: (m: Member) => void;
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    "مقبول": styles.badgeSuccess,
    "مرفوض": styles.badgeDanger,
    "منتظر": styles.badgeWarning,
  };
  return <span className={`${styles.badge} ${map[status] ?? styles.badgeDefault}`}>{status}</span>;
}

function GenderBadge({ gender }: { gender: string }) {
  return (
    <span className={`${styles.badge} ${gender === "M" || "m" ? styles.badgeMale : styles.badgeFemale}`}>
      {gender === "M" || "m"? "ذكر" : "أنثى"}
    </span>
  );
}

export default function MembersTable({ members, onReview, onAssign, onChangeRole, onDelete }: Props) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>اسم الطالب</th>
            <th>البريد الإلكتروني</th>
            <th>الهاتف</th>
            <th>النوع</th>
            <th>الدور</th>
            <th>الحالة</th>
            <th>الرهط</th>
            <th>تاريخ الانضمام</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m, i) => (
            <tr key={m.scout_member_id} className={i % 2 === 0 ? styles.rowEven : styles.rowOdd}>
              <td className={styles.tdNum}>{i + 1}</td>
              <td className={styles.tdName}>{m.student_name}</td>
              <td className={styles.tdEmail}>{m.student_email}</td>
              <td>{m.student_phone}</td>
              <td><GenderBadge gender={m.student_gender} /></td>
              <td><span className={styles.roleChip}>{m.role}</span></td>
              <td><StatusBadge status={m.status} /></td>
              <td>
                {m.group_name
                  ? <span className={styles.groupChip}>{m.group_name}</span>
                  : <span className={styles.unassigned}>—</span>}
              </td>
              <td className={styles.tdDate}>
                {new Date(m.joined_at).toLocaleDateString("ar-EG", {
                  year: "numeric", month: "short", day: "numeric",
                })}
              </td>
              <td>
                <div className={styles.actions}>
                  {m.status === "منتظر" && (
                    <button
                      className={`${styles.actionBtn} ${styles.reviewBtn}`}
                      onClick={() => onReview(m)}
                      title="مراجعة الطلب"
                    >
                      <Eye size={15} />
                      <span>مراجعة</span>
                    </button>
                  )}
                  <button
                    className={`${styles.actionBtn} ${styles.assignBtn}`}
                    onClick={() => onAssign(m)}
                    title="توزيع على الرهط"
                  >
                    <Users size={15} />
                    <span>توزيع</span>
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.roleBtn}`}
                    onClick={() => onChangeRole(m)}
                    title="تغيير الدور"
                  >
                    <RefreshCcw size={15} />
                    <span>الدور</span>
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    onClick={() => onDelete(m)}
                    title="حذف العضو"
                  >
                    <Trash2 size={15} />
                    <span>حذف</span>
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