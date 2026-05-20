import React, { useMemo } from "react";
import {
  DollarSign, ShieldAlert, Users, Timer,
  MapPin, CalendarDays,
} from "lucide-react";
import styles from "../styles/EventDetails.module.css";

type Props = {
  cost: string;
  status: string;
  scope: string;
  displayType: string;
  location: string;
  startDate: string;
  endDate: string;
  rejectionReason: string;
  reward: string;
  constraints: string;
  description: string;
};

export default function EventInfoGrid({
  cost, status, scope, displayType,
  location, startDate, endDate,
  rejectionReason, reward, constraints, description,
}: Props) {
  const statusBadgeClass = useMemo(() => {
    const s = (status || "").trim();
    if (s === "نشط") return styles.badgeSuccess;
    if (s === "منتظر") return styles.badgeBlue;
    if (s === "غير نشط" || s === "ملغي" || s === "مرفوض")
      return (styles as Record<string, string>).badgeDanger || styles.badgeBlue;
    return styles.badgeBlue;
  }, [status]);

  return (
    <>
      <section className={styles.infoGrid}>
        <div className={styles.infoCard}>
          <div className={styles.infoLabel}><DollarSign size={16} /> التكلفة</div>
          <div className={styles.infoValue}>{cost}</div>
        </div>

        <div className={styles.infoCard}>
          <div className={styles.infoLabel}><ShieldAlert size={16} /> حالة الفعالية</div>
          <div className={statusBadgeClass}>{status || "—"}</div>
        </div>

        <div className={styles.infoCard}>
          <div className={styles.infoLabel}><Users size={16} /> نطاق الفعالية</div>
          <div className={styles.infoValue}>{scope || "—"}</div>
        </div>

        <div className={styles.infoCard}>
          <div className={styles.infoLabel}><Timer size={16} /> نوع الفعالية</div>
          <div className={styles.badgeBlue}>{displayType || "—"}</div>
        </div>

        <div className={`${styles.infoCard} ${styles.infoWide}`}>
          <div className={styles.infoLabel}><MapPin size={16} /> المكان</div>
          <div className={styles.infoValue}>{location || "—"}</div>
        </div>

        <div className={styles.infoCard}>
          <div className={styles.infoLabel}><CalendarDays size={16} /> تاريخ البداية</div>
          <div className={styles.infoValue} dir="ltr">{startDate || "—"}</div>
        </div>

        <div className={styles.infoCard}>
          <div className={styles.infoLabel}><CalendarDays size={16} /> تاريخ النهاية</div>
          <div className={styles.infoValue} dir="ltr">{endDate || "—"}</div>
        </div>
      </section>

      {rejectionReason && (
        <section
          style={{
            display: "flex", alignItems: "flex-start", gap: "14px",
            background: "linear-gradient(135deg, #FFF1F1, #FFE4E4)",
            border: "1.5px solid #FCA5A5", borderRight: "5px solid #EF4444",
            borderRadius: "14px", padding: "18px 20px",
            direction: "rtl", marginTop: "22px",
          }}
        >
          <ShieldAlert size={22} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#EF4444", marginBottom: "6px" }}>
              سبب الرفض
            </div>
            <div style={{ fontSize: "0.95rem", color: "#7F1D1D", lineHeight: 1.7, fontWeight: 500 }}>
              {rejectionReason}
            </div>
          </div>
        </section>
      )}

      <section className={styles.twoCols}>
        <div className={styles.block}>
          <div className={styles.blockTitle}>المكافأة</div>
          <div className={styles.blockBody}>{reward}</div>
        </div>
        <div className={styles.block}>
          <div className={styles.blockTitle}>القيود والشروط</div>
          <div className={styles.blockBody}>{constraints}</div>
        </div>
      </section>

      <section className={styles.block}>
        <div className={styles.blockTitle}>وصف الفعالية</div>
        <div className={styles.blockBody}>{description}</div>
      </section>
    </>
  );
}