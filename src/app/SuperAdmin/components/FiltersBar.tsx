"use client";
import React, { useMemo } from "react";
import styles from "../Styles/FiltersBar.module.css";
import { useEffect, useState } from "react";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";

interface FiltersBarProps {
  filters: {
    search: string;
    fatherStatus: string;
    motherStatus: string;
    housingStatus: string;
    brothers: string;
    totalIncome: string;
    faculty: string;
    grade: string;
    disability: string;
    status: string;
    [key: string]: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    search: string;
    fatherStatus: string;
    motherStatus: string;
    housingStatus: string;
    brothers: string;
    totalIncome: string;
    faculty: string;
    grade: string;
    disability: string;
    status: string;
    [key: string]: string;
  }>>;
  onApply: () => void;
  onSearchChange: (value: string) => void;
}

const EMPTY_FILTERS = {
  fatherStatus: "",
  fatherIncome: "",
  motherStatus: "",
  housingStatus: "",
  brothers: "",
  totalIncome: "",
  faculty: "",
  grade: "",
  disability: "",
  status: "",
  search: "",
};

export default function FiltersBar({
  filters,
  setFilters,
  onApply,
  onSearchChange,
}: FiltersBarProps) {

  const handleChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    if (key === "search") onSearchChange(value);
  };
const [faculties, setFaculties] = useState<{ faculty_id: number; name: string }[]>([]);
  const clearAllFilters = () => {
    setFilters(EMPTY_FILTERS);
    onSearchChange("");
  };

  // count how many non-search filters are active
  const activeCount = useMemo(() => {
    const { ...rest } = filters;
    return Object.values(rest).filter((v) => v && v !== "").length;
  }, [filters]);

  useEffect(() => {
  const fetchFaculties = async () => {
    try {
      const res = await authFetch(
        `${getBaseUrl()}/api/family/faculties/`
      );

      const data = await res.json();
      setFaculties(data);
    } catch (err) {
      console.error("Error fetching faculties:", err);
    }
  };

  fetchFaculties();
}, []);

  return (
    <div className={styles.filtersContainer}>

      {/* ── Search ── */}
      <div className={styles.searchWrapper}>
        {/* search icon */}
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
          value={filters.faculty || ""}
          onChange={(e) => handleChange("faculty", e.target.value)}
          className={styles.select}
        >
          <option value="" disabled hidden>الكلية</option>
          <option value="none">غير محدد</option>
          {faculties.map((fac) => (
            <option key={fac.faculty_id} value={fac.name}>
              {fac.name}
            </option>
          ))}
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

      {/* ── Footer ── */}
      <div className={styles.footer}>
        {activeCount > 0 && (
          <p className={styles.activeFiltersHint}>
            <span>{activeCount}</span> {activeCount === 1 ? "فلتر نشط" : "فلاتر نشطة"}
          </p>
        )}

        {activeCount > 0 && (
          <button onClick={clearAllFilters} className={styles.clearBtn} type="button">
            {/* x icon */}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            مسح الفلاتر
          </button>
        )}

        <button onClick={onApply} className={styles.applyBtn} type="button">
          {/* filter icon */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
          </svg>
          تطبيق
        </button>
      </div>

    </div>
  );
}