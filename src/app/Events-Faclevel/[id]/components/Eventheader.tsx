import React from "react";
import { ArrowRight, FileText } from "lucide-react";
import styles from "../styles/EventDetails.module.css";

type Props = {
  title: string;
  subtitle: string;
  isDeptEvent: boolean;
  exportBusy: null | "report" | "summary";
  hasEvent: boolean;
  backPath: string;
  onBack: () => void;
  onExportSummary: () => void;
  onOpenReport: () => void;
};

export default function EventHeader({
  subtitle,
  isDeptEvent,
  exportBusy,
  hasEvent,
  onBack,
  onExportSummary,
  onOpenReport,
}: Props) {
  return (
    <div className={styles.topBar}>
      <div className={styles.headText}>
        <h1 className={styles.pageTitle}>تفاصيل الفعالية</h1>
        <p className={styles.pageSubtitle}>{subtitle}</p>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <button
          className={styles.actionBtn}
          type="button"
          onClick={onExportSummary}
          disabled={!isDeptEvent && exportBusy !== null}
          style={{
            opacity: (!isDeptEvent && exportBusy !== null) || isDeptEvent ? 0.6 : 1,
            cursor: isDeptEvent ? "not-allowed" : undefined,
          }}
          title={isDeptEvent ? "غير متاح لفعاليات الأقسام" : "تصدير ملخص الفعالية PDF"}
        >
          <FileText size={18} />
          {exportBusy === "summary" ? "جاري التصدير..." : "ملخص الفعالية"}
        </button>

        <button
          className={styles.actionBtn}
          type="button"
          onClick={onOpenReport}
          disabled={!isDeptEvent && (exportBusy !== null || !hasEvent)}
          style={{
            opacity: (!isDeptEvent && (exportBusy !== null || !hasEvent)) || isDeptEvent ? 0.6 : 1,
            cursor: isDeptEvent ? "not-allowed" : undefined,
          }}
          title={isDeptEvent ? "غير متاح لفعاليات الأقسام" : "تصدير تقرير الفعالية PDF"}
        >
          <FileText size={18} />
          {exportBusy === "report" ? "جاري التصدير..." : "تقرير الفعالية"}
        </button>

        <button
          className={styles.backBtn}
          onClick={onBack}
          type="button"
          disabled={exportBusy !== null}
          style={{ opacity: exportBusy !== null ? 0.7 : 1 }}
        >
          <ArrowRight size={18} />
          العودة للفعاليات
        </button>
      </div>
    </div>
  );
}