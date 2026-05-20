import React from "react";
import { FileText, X } from "lucide-react";
import styles from "../styles/EventDetails.module.css";
import { ReportFormState, ReportErrors } from "../page";

type Props = {
  open: boolean;
  reportForm: ReportFormState;
  reportErrors: ReportErrors;
  exportBusy: null | "report" | "summary";
  onClose: () => void;
  onSubmit: () => void;
  setField: <K extends keyof ReportFormState>(key: K, value: ReportFormState[K]) => void;
};

export default function ReportModal({
  open, reportForm, reportErrors,
  exportBusy, onClose, onSubmit, setField,
}: Props) {
  if (!open) return null;

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-label="تقرير الفعالية">
      <div className={styles.modalCard}>
        <div className={styles.modalHead}>
          <div>
            <div className={styles.modalTitle}>تقرير الفعالية</div>
            <div className={styles.modalSub}>املئي البيانات المطلوبة ثم اضغطي تنزيل</div>
          </div>
          <button className={styles.modalClose} type="button" onClick={onClose} disabled={exportBusy !== null}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.modalGrid2}>

            <div className={styles.modalField}>
              <label className={styles.modalLabel}>عنوان الفعالية</label>
              <input
                className={styles.modalInput}
                value={reportForm.event_title}
                onChange={(e) => setField("event_title", e.target.value)}
                placeholder="عنوان الفعالية"
              />
              {reportErrors.event_title && <div className={styles.modalError}>{reportErrors.event_title}</div>}
            </div>

            <div className={styles.modalField}>
              <label className={styles.modalLabel}>كود الفعالية</label>
              <input
                className={styles.modalInput}
                value={reportForm.event_code}
                onChange={(e) => setField("event_code", e.target.value)}
                placeholder="مثال: EVT-001"
              />
              {reportErrors.event_code && <div className={styles.modalError}>{reportErrors.event_code}</div>}
            </div>

            <div className={styles.modalField}>
              <label className={styles.modalLabel}>عدد الذكور</label>
              <input
                className={styles.modalInput}
                type="number"
                min={0}
                value={reportForm.male_count}
                onChange={(e) => setField("male_count", e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="0"
              />
              {reportErrors.male_count && <div className={styles.modalError}>{reportErrors.male_count}</div>}
            </div>

            <div className={styles.modalField}>
              <label className={styles.modalLabel}>عدد الإناث</label>
              <input
                className={styles.modalInput}
                type="number"
                min={0}
                value={reportForm.female_count}
                onChange={(e) => setField("female_count", e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="0"
              />
              {reportErrors.female_count && <div className={styles.modalError}>{reportErrors.female_count}</div>}
            </div>

            <div className={styles.modalField}>
              <label className={styles.modalLabel}>إجمالي المشاركين</label>
              <input
                className={styles.modalInput}
                type="number"
                min={0}
                value={reportForm.total_participants}
                onChange={(e) => setField("total_participants", e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="0"
              />
              {reportErrors.total_participants && <div className={styles.modalError}>{reportErrors.total_participants}</div>}
            </div>

            <div className={styles.modalField}>
              <label className={styles.modalLabel}>تاريخ البداية</label>
              <input
                className={styles.modalInput}
                type="date"
                value={reportForm.start_date}
                onChange={(e) => setField("start_date", e.target.value)}
              />
              {reportErrors.start_date && <div className={styles.modalError}>{reportErrors.start_date}</div>}
            </div>

            <div className={styles.modalField}>
              <label className={styles.modalLabel}>مدة التنفيذ (بالأيام)</label>
              <input
                className={styles.modalInput}
                type="number"
                min={0}
                value={reportForm.duration_days}
                onChange={(e) => setField("duration_days", e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="0"
              />
              {reportErrors.duration_days && <div className={styles.modalError}>{reportErrors.duration_days}</div>}
            </div>

            <div className={styles.modalField}>
              <label className={styles.modalLabel}>التقييم العام</label>
              <select
                className={styles.modalInput}
                value={reportForm.evaluation}
                onChange={(e) => setField("evaluation", e.target.value as ReportFormState["evaluation"])}
              >
                <option value="excellent">ممتاز</option>
                <option value="very_good">جيد جداً</option>
                <option value="good">جيد</option>
                <option value="acceptable">مقبول</option>
              </select>
              {reportErrors.evaluation && <span className={styles.modalErrorInline}>{reportErrors.evaluation}</span>}
            </div>
          </div>

          {(
            [
              { key: "project_stages" as const, label: "مراحل المشروع", placeholder: "اكتب مراحل المشروع..." },
            ]
          ).map(({ key, label, placeholder }) => (
            <div key={key} className={styles.modalField}>
              <label className={styles.modalLabel}>{label}</label>
              <textarea
                className={styles.modalTextarea}
                rows={3}
                maxLength={250}
                value={reportForm[key] as string}
                onChange={(e) => setField(key, e.target.value)}
                placeholder={placeholder}
              />
              <div className={styles.modalHintRow}>
                <span className={styles.modalHint}>{((reportForm[key] as string) ?? "").length}/250</span>
                {reportErrors[key] && <span className={styles.modalErrorInline}>{reportErrors[key]}</span>}
              </div>
            </div>
          ))}

          <div className={styles.modalGrid2}>
            {(
              [
                { key: "preparation_stage" as const,  label: "مرحلة الإعداد",                        placeholder: "اكتب تفاصيل الإعداد..." },
                { key: "execution_stage" as const,    label: "مرحلة التنفيذ",                         placeholder: "اكتب تفاصيل التنفيذ..." },
                { key: "evaluation_stage" as const,   label: "مرحلة التقييم والمتابعة والنتائج",       placeholder: "اكتب تفاصيل التقييم..." },
                { key: "achieved_goals" as const,     label: "ما تحقق من أهداف",                      placeholder: "اكتب ما تحقق من أهداف المشروع..." },
              ]
            ).map(({ key, label, placeholder }) => (
              <div key={key} className={styles.modalField}>
                <label className={styles.modalLabel}>{label}</label>
                <textarea
                  className={styles.modalTextarea}
                  rows={3}
                  maxLength={250}
                  value={reportForm[key] as string}
                  onChange={(e) => setField(key, e.target.value)}
                  placeholder={placeholder}
                />
                <div className={styles.modalHintRow}>
                  <span className={styles.modalHint}>{((reportForm[key] as string) ?? "").length}/250</span>
                  {reportErrors[key] && <span className={styles.modalErrorInline}>{reportErrors[key]}</span>}
                </div>
              </div>
            ))}

            {(
              [
                { key: "committee_preparation" as const,  label: "لجنة الإعداد",     placeholder: "لجنة الاعداد..." },
                { key: "committee_organizing" as const,   label: "لجنة التنظيم",     placeholder: "لجنة التنظيم..." },
                { key: "committee_execution" as const,    label: "لجنة التنفيذ",     placeholder: "لجنة التنفيذ..." },
                { key: "committee_purchases" as const,    label: "لجنة المشتريات",   placeholder: "لجنة المشتريات..." },
                { key: "committee_supervision" as const,  label: "لجنة الإشراف",     placeholder: "لجنة الإشراف..." },
                { key: "committee_other" as const,        label: "لجان أخرى",        placeholder: "لجان أخرى..." },
              ]
            ).map(({ key, label, placeholder }) => (
              <div key={key} className={styles.modalField}>
                <label className={styles.modalLabel}>{label}</label>
                <input
                  className={styles.modalInput}
                  value={reportForm[key] as string}
                  onChange={(e) => setField(key, e.target.value)}
                  placeholder={placeholder}
                />
                {reportErrors[key] && <span className={styles.modalErrorInline}>{reportErrors[key]}</span>}
              </div>
            ))}

            <div className={styles.modalField}>
              <label className={styles.modalLabel}>مقترحات للتحسين</label>
              <textarea
                className={styles.modalTextarea}
                rows={3}
                maxLength={250}
                value={reportForm.suggestions}
                onChange={(e) => setField("suggestions", e.target.value)}
                placeholder="اكتب مقترحات للتحسين..."
              />
              <div className={styles.modalHintRow}>
                <span className={styles.modalHint}>{(reportForm.suggestions ?? "").length}/250</span>
                {reportErrors.suggestions && <span className={styles.modalErrorInline}>{reportErrors.suggestions}</span>}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.modalCancel} type="button" onClick={onClose} disabled={exportBusy !== null}>
            إلغاء
          </button>
          <button
            className={styles.modalPrimary}
            type="button"
            onClick={onSubmit}
            disabled={exportBusy !== null}
            style={{ opacity: exportBusy !== null ? 0.7 : 1 }}
          >
            <FileText size={18} />
            {exportBusy === "report" ? "جاري التنزيل..." : "تنزيل PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}