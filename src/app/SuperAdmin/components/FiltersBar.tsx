"use client";
import React, { useState } from "react";
import styles from "../Styles/FiltersBar.module.css";

export default function FiltersBar() {
  const [filters, setFilters] = useState({
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
  });

  const handleChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
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
    });
  };

  const applyFilters = () => {
    console.log("Filters applied:", filters);
  };

  return (
    <div className={styles.filtersContainer}>
      <h2 className={styles.sectionTitle}>البحث وفلترة الطلاب</h2>

      <div className={styles.filtersRow}>
        <input
          type="text"
          placeholder="ابحث بالاسم، الرقم القومي أو كود التكافل..."
          value={filters.search}
          onChange={(e) => handleChange("search", e.target.value)}
          className={styles.searchField}
        />

        <div className={styles.filterSelects}>
          <select
            value={filters.fatherStatus}
            onChange={(e) => handleChange("fatherStatus", e.target.value)}
            className={styles.select}
          >
            <option value="" disabled hidden>حالة الأب</option>
            <option value="none">لا يوجد</option>
            <option value="working">يعمل</option>
            <option value="retired">بالمعاش</option>
            <option value="sick">مريض</option>
            <option value="deceased">متوفى</option>
          </select>

          <select
            value={filters.motherStatus}
            onChange={(e) => handleChange("motherStatus", e.target.value)}
            className={styles.select}
          >
            <option value="" disabled hidden>حالة الأم</option>
            <option value="none">لا يوجد</option>
            <option value="working">تعمل</option>
            <option value="retired">بالمعاش</option>
            <option value="sick">مريضة</option>
            <option value="deceased">متوفاة</option>
          </select>

          <select
            value={filters.housingStatus}
            onChange={(e) => handleChange("housingStatus", e.target.value)}
            className={styles.select}
          >
            <option value="" disabled hidden>حالة السكن</option>
            <option value="none">لا يوجد</option>
            <option value="owned">ملك</option>
            <option value="rented">ايجار</option>
          </select>

          <select
            value={filters.brothers}
            onChange={(e) => handleChange("brothers", e.target.value)}
            className={styles.select}
          >
            <option value="" disabled hidden>عدد الإخوة</option>
            <option value="none">لا يوجد</option>
            <option value="1-2">1-2</option>
            <option value="3-5">3-5</option>
            <option value="6+">6 فأكثر</option>
          </select>

          <select
            value={filters.totalIncome}
            onChange={(e) => handleChange("totalIncome", e.target.value)}
            className={styles.select}
          >
            <option value="" disabled hidden>الدخل الإجمالي</option>
            <option value="none">لا يوجد</option>
            <option value="low">منخفض</option>
            <option value="medium">متوسط</option>
            <option value="high">مرتفع</option>
          </select>

          <select
            value={filters.faculty}
            onChange={(e) => handleChange("faculty", e.target.value)}
            className={styles.select}
          >
            <option value="" disabled hidden>الكلية</option>
            <option value="none">لا يوجد</option>
            <option value="commerce">تجارة</option>
            <option value="arts">آداب</option>
            <option value="law">حقوق</option>
          </select>

          <select
            value={filters.grade}
            onChange={(e) => handleChange("grade", e.target.value)}
            className={styles.select}
          >
            <option value="" disabled hidden>التقدير</option>
            <option value="none">لا يوجد</option>
            <option value="1">امتياز</option>
            <option value="2">جيد جدًا</option>
            <option value="3">جيد</option>
            <option value="4">مقبول</option>
          </select>

          <select
            value={filters.disability}
            onChange={(e) => handleChange("disability", e.target.value)}
            className={styles.select}
          >
            <option value="" disabled hidden>ذوي الهمم</option>
            <option value="none">لا يوجد</option>
            <option value="yes">نعم</option>
            <option value="no">لا</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => handleChange("status", e.target.value)}
            className={styles.select}
          >
            <option value="" disabled hidden>حالة الطلب</option>
            <option value="initial">موافقة مبدئية</option>
            <option value="approved">مقبول</option>
            <option value="pending">منتظر</option>
            <option value="rejected">مرفوض</option>
          </select>
        </div>

        <button onClick={clearAllFilters} className={styles.clearBtn}>
          مسح جميع الفلاتر
        </button>

        <button onClick={applyFilters} className={styles.applyBtn}>
          تطبيق الفلاتر
        </button>
      </div>
    </div>
  );
}