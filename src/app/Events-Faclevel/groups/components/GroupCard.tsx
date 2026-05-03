import React from "react";
import styles from "../styles/Groupcard.module.css";
import { Pencil, Trash2 } from "lucide-react";
import type { Group } from "../page";

type Props = {
  group: Group;
  onEdit: () => void;
  onDelete: () => void;
};

const ACCENTS = ["blue", "green", "amber", "purple", "teal", "rose"];
function accentFor(id: number) {
  return ACCENTS[id % ACCENTS.length];
}

const MAX_MEMBERS = 20;

export default function GroupCard({ group, onEdit, onDelete }: Props) {
  const accent = accentFor(group.group_id);
  const count = group.member_count ?? 0;
  const fillPct = Math.min((count / MAX_MEMBERS) * 100, 100);
  const isEmpty = count === 0;

  return (
    <div className={`${styles.card} ${styles[`accent_${accent}`]}`}>
      <div className={styles.body}>
        <div className={styles.topRow}>
          <h3 className={styles.groupName}>{group.name}</h3>
            <span className={`${styles.countBadge} ${isEmpty ? styles.countEmpty : ""}`}>
            {count} عضو
          </span>
        </div>

        <div className={styles.progressRow}>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${fillPct}%` }}
            />
          </div>
          <span className={styles.progressCount}>{count} / {MAX_MEMBERS}</span>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.editBtn} onClick={onEdit}>
          <Pencil size={12} />
          تعديل
        </button>
        <button className={styles.deleteBtn} onClick={onDelete}>
          <Trash2 size={12} />
          حذف
        </button>
      </div>
    </div>
  );
}