import React from "react";
import styles from "../styles/GroupCard.module.css";
import { Users } from "lucide-react";
import type { Group } from "../page";

type Props = {
  group: Group;
  colorIdx: number;
};

const ACCENTS = ["blue", "green", "amber", "purple", "teal", "rose"];
function accentFor(idx: number) {
  return ACCENTS[idx % ACCENTS.length];
}

const MAX_MEMBERS = 20;

export default function GroupCard({ group, colorIdx }: Props) {
  const accent = accentFor(colorIdx);
  const count = group.members_count ?? 0;
  const fillPct = Math.min((count / MAX_MEMBERS) * 100, 100);
  const isEmpty = count === 0;

  return (
    <div className={`${styles.card} ${styles[`accent_${accent}`]}`}>
      <div className={styles.body}>
        <div className={styles.topRow}>
          <div className={styles.groupNameRow}>
            <div className={styles.groupIcon}>
              <Users size={16} />
            </div>
            <h3 className={styles.groupName}>{group.name}</h3>
          </div>
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

        <div className={styles.metaRow}>
          <span className={styles.metaItem}>
            الترتيب: {group.display_order}
          </span>
        </div>
      </div>
    </div>
  );
}
