"use client";
import React, { useMemo } from "react";
import styles from "../Styles/FiltersSection.module.css";

interface FiltersSectionProps {
  filters: {
    search: string;
    fatherStatus: string;
    motherStatus: string;
    housingStatus: string;
    brothers: string;
    totalIncome: string;
    grade: string;
    disability: string;
    status: string;
    date_from: string;
    date_to: string;
    [key: string]: string;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      search: string;
      fatherStatus: string;
      motherStatus: string;
      housingStatus: string;
      brothers: string;
      totalIncome: string;
      grade: string;
      disability: string;
      status: string;
      date_from: string;
      date_to: string;
      [key: string]: string;
    }>
  >;
  onApply: () => void;
  onSearchChange: (value: string) => void;
}

const EMPTY_FILTERS = {
  search: "",
  fatherStatus: "",
  motherStatus: "",
  housingStatus: "",
  brothers: "",
  totalIncome: "",
  grade: "",
  disability: "",
  status: "",
  date_from: "",
  date_to: "",
};

export default function FiltersSection({
  filters = EMPTY_FILTERS,
  setFilters,
  onApply,
  onSearchChange,
}: FiltersSectionProps) {
  const handleChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    if (key === "search") onSearchChange(value);
  };

  const clearAllFilters = () => {
    setFilters(EMPTY_FILTERS);
    onSearchChange("");
  };

  const activeCount = useMemo(
    () => Object.values(filters).filter((v) => v && v !== "").length,
    [filters]
  );

  return (
    <div className={styles.filtersContainer}>

      {/* ── Search ── */}
      <div className={styles.searchWrapper}>
        <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="ابحث بالاسم أو كود التكافل..."
          value={filters.search || ""}
          onChange={(e) => handleChange("search", e.target.value)}
          className={styles.searchField}
        />
      </div>

      <div className={styles.divider} />

      {/* ── Filter selects ── */}
      <div className={styles.filterSelects}>

        <select
          value={filters.fatherStatus || ""}
          onChange={(e) => handleChange("fatherStatus", e.target.value)}
          className={styles.select}
        >
          <option value="" disabled hidden>حالة الأب</option>
          <option value="none">غير محدد</option>
          <option value="كريم النسب">كريم النسب</option>
          <option value="يعمل">يعمل</option>
          <option value="بالمعاش">بالمعاش</option>
          <option value="مريض">مريض</option>
          <option value="متوفى">متوفى</option>
        </select>

        <select
          value={filters.motherStatus || ""}
          onChange={(e) => handleChange("motherStatus", e.target.value)}
          className={styles.select}
        >
          <option value="" disabled hidden>حالة الأم</option>
          <option value="none">غير محدد</option>
          <option value="كريم النسب">كريم النسب</option>
          <option value="تعمل">تعمل</option>
          <option value="بالمعاش">بالمعاش</option>
          <option value="مريضة">مريضة</option>
          <option value="متوفاة">متوفاة</option>
        </select>

        <select
          value={filters.housingStatus || ""}
          onChange={(e) => handleChange("housingStatus", e.target.value)}
          className={styles.select}
        >
          <option value="" disabled hidden>حالة السكن</option>
          <option value="none">غير محدد</option>
          <option value="ملك">ملك</option>
          <option value="ايجار">إيجار</option>
        </select>

        <select
          value={filters.brothers || ""}
          onChange={(e) => handleChange("brothers", e.target.value)}
          className={styles.select}
        >
          <option value="" disabled hidden>أفراد الأسرة</option>
          <option value="none">غير محدد</option>
          <option value="few">١ – ٢</option>
          <option value="moderate">٣ – ٥</option>
          <option value="many">٦ فأكثر</option>
        </select>

        <select
          value={filters.totalIncome || ""}
          onChange={(e) => handleChange("totalIncome", e.target.value)}
          className={styles.select}
        >
          <option value="" disabled hidden>الدخل الإجمالي</option>
          <option value="none">غير محدد</option>
          <option value="low">منخفض</option>
          <option value="medium">متوسط</option>
          <option value="high">مرتفع</option>
        </select>

        <select
          value={filters.disability || ""}
          onChange={(e) => handleChange("disability", e.target.value)}
          className={styles.select}
        >
          <option value="" disabled hidden>ذوو الهمم</option>
          <option value="none">غير محدد</option>
          <option value="نعم">نعم</option>
          <option value="لا">لا</option>
        </select>

        <select
          value={filters.status || ""}
          onChange={(e) => handleChange("status", e.target.value)}
          className={styles.select}
        >
          <option value="" disabled hidden>حالة الطلب</option>
          <option value="none">غير محدد</option>
          <option value="موافقة مبدئية">موافقة مبدئية</option>
          <option value="مقبول">مقبول</option>
          <option value="منتظر">منتظر</option>
          <option value="مرفوض">مرفوض</option>
        </select>

      </div>

          <div className={styles.divider} />
        <div className={styles.filterSelects}>
        {/* ── Date range ── */}
        <label className={styles.dateLabel}>
          <span className={styles.dateLabelText}>من تاريخ</span>
          <input
            type="date"
            value={filters.date_from || ""}
            onChange={(e) => handleChange("date_from", e.target.value)}
            className={styles.select}
          />
        </label>

        <label className={styles.dateLabel}>
          <span className={styles.dateLabelText}>إلى تاريخ</span>
          <input
            type="date"
            value={filters.date_to || ""}
            onChange={(e) => handleChange("date_to", e.target.value)}
            className={styles.select}
          />
        </label>
        </div>

      {/* ── Footer ── */}
      <div className={styles.footer}>
        {activeCount > 0 && (
          <p className={styles.activeFiltersHint}>
            <span>{activeCount}</span> {activeCount === 1 ? "فلتر نشط" : "فلاتر نشطة"}
          </p>
        )}

        {activeCount > 0 && (
          <button onClick={clearAllFilters} className={styles.clearBtn} type="button">
            تعيين افتراضي
          </button>
        )}

        <button onClick={onApply} className={styles.applyBtn} type="button">
          عرض النتائج
        </button>
      </div>

    </div>
  );
}