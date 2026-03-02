"use client";

import React, { useMemo, useState } from "react";
import styles from "../styles/PlanCard.module.css";
import type { PlanItem } from "../page";
import { Eye, CalendarDays, Building2, ClipboardList, Pencil, Download } from "lucide-react";

const API_URL = "http://localhost:8000";

function fmt(iso: string) {
  if (!iso) return "—";
  return iso.slice(0, 10);
}

function getAccessToken(): string | null {
  return (
    localStorage.getItem("access") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    null
  );
}

export default function PlanCard({
  item,
  onView,
  onEdit,
}: {
  item: PlanItem;
  onView: (id: number) => void;
  onEdit: (p: PlanItem) => void;
}) {
  const created = useMemo(() => fmt(item.createdAt), [item.createdAt]);
  const [exporting, setExporting] = useState(false);

  const onExport = async () => {
    try {
      setExporting(true);

      const token = getAccessToken();
      const res = await fetch(`${API_URL}/api/event/export-plan-pdf/${item.id}/`, {
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `فشل التصدير (${res.status})`);
      }

      const blob = await res.blob();

      // اسم ملف لطيف
      const safeTitle = (item.title || "plan")
        .replace(/[\\/:*?"<>|]/g, "-")
        .slice(0, 60);
      const fileName = `خطة-${safeTitle}-${String(item.id)}.pdf`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      window.alert(e?.message || "حدث خطأ أثناء التصدير");
    } finally {
      setExporting(false);
    }
  };

  return (
    <article className={styles.card}>
      {/* ✅ زر تصدير أعلى يسار */}
      <button
        className={styles.exportBtn}
        type="button"
        onClick={onExport}
        disabled={exporting}
        title="تصدير الخطة PDF"
      >
        <Download size={16} />
        {exporting ? "جاري التصدير..." : "تصدير PDF"}
      </button>

      <div className={styles.top}>
        <h3 className={styles.title}>{item.title}</h3>
        <p className={styles.desc}>{item.description}</p>

        <div className={styles.badges}>
          <span
            className={`${styles.badge} ${
              item.statusLabel === "نشطة" ? styles.badgeActive : styles.badgeDraft
            }`}
          >
            {item.statusLabel}
          </span>

          <span className={`${styles.badge} ${styles.badgeTerm}`}>
            <ClipboardList size={14} />
            الفصل {item.term}
          </span>

          {item.facultyName && (
            <span className={`${styles.badge} ${styles.badgeFaculty}`}>
              <Building2 size={14} />
              {item.facultyName}
            </span>
          )}

          <span className={`${styles.badge} ${styles.badgeDate}`} dir="ltr">
            <CalendarDays size={14} />
            {created}
          </span>
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statBox}>
          <div className={styles.statLabel}>عدد الفعاليات الفعلية</div>
          <div className={styles.statValue}>{item.eventsCount}</div>
        </div>

        <div className={styles.statBox}>
          <div className={styles.statLabel}>آخر تحديث</div>
          <div className={styles.statValueSm} dir="ltr">
            {fmt(item.updatedAt)}
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.viewBtn} onClick={() => onView(item.id)} type="button">
          <Eye size={18} />
          عرض التفاصيل
        </button>

        <button className={styles.editBtn} onClick={() => onEdit(item)} type="button">
          <Pencil size={18} />
          تعديل
        </button>
      </div>
    </article>
  );
}