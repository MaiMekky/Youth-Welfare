"use client";
import React from "react";
import styles from "../styles/FiltersBar.module.css"

interface FiltersBarProps {
  filters: any;
  setFilters: (filters: any) => void;
  onApply: () => void;
  onSearchChange: (value: string) => void;
}

export default function FiltersBar({ filters, setFilters, onApply, onSearchChange }: FiltersBarProps) {
  const facultyMap: { [key: string]: number } = {
    "كلية الهندسة": 1,
    "كلية العلوم": 2,
    "كلية التجارة": 4,
    "كلية الطب": 3,
    "كلية التربية": 5,
  };

  const handleChange = (key: string, value: string) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }));
    if (key === "search") {
      onSearchChange(value); // <--- تحديث البحث للجدول
    }
  };

  const clearAllFilters = () => {
    const cleared = {
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
    setFilters(cleared);
    onSearchChange(""); // مسح البحث أيضًا
  };

  return (
    <div className={styles.filtersContainer}>
      <h2 className={styles.sectionTitle}>البحث وفلترة الطلاب</h2>

      <div className={styles.filtersRow}>
        <input
          type="text"
          placeholder="ابحث بالاسم أو كود التكافل..."
          value={filters.search || ""}
          onChange={(e) => handleChange("search", e.target.value)}
          className={styles.searchField}
        />

        <div className={styles.filterSelects}>
          {/* Father's status */}
          <select value={filters.fatherStatus || ""} onChange={(e) => handleChange("fatherStatus", e.target.value)} className={styles.select}>
            <option value="" disabled hidden>حالة الأب</option>
            <option value="none">لا يوجد</option>
            <option value="working">يعمل</option>
            <option value="retired">بالمعاش</option>
            <option value="sick">مريض</option>
            <option value="deceased">متوفى</option>
          </select>

          {/* Mother's status */}
          <select value={filters.motherStatus || ""} onChange={(e) => handleChange("motherStatus", e.target.value)} className={styles.select}>
            <option value="" disabled hidden>حالة الأم</option>
            <option value="none">لا يوجد</option>
            <option value="working">تعمل</option>
            <option value="retired">بالمعاش</option>
            <option value="sick">مريضة</option>
            <option value="deceased">متوفاة</option>
          </select>

          {/* Housing status */}
                <select
          value={filters.housingStatus || ""}
          onChange={(e) => handleChange("housingStatus", e.target.value)}
          className={styles.select}
        >
          <option value="" disabled hidden>حالة السكن</option>
          <option value="none">لا يوجد</option>
          <option value="ملك">ملك</option>
          <option value="ايجار">ايجار</option>
        </select>


          {/* Brothers */}
          <select
          value={filters.brothers || ""}
          onChange={(e) => handleChange("brothers", e.target.value)}
          className={styles.select}
        >
          <option value="" disabled hidden>عدد أفراد الأسرة</option>
          <option value="none">لا يوجد</option>
          <option value="few">1–2</option>
          <option value="moderate">3–5</option>
          <option value="many">6 فأكثر</option>
        </select>


          {/* Total Income */}
          <select value={filters.totalIncome || ""} onChange={(e) => handleChange("totalIncome", e.target.value)} className={styles.select}>
            <option value="" disabled hidden>الدخل الإجمالي</option>
            <option value="none">لا يوجد</option>
            <option value="low">منخفض</option>
            <option value="medium">متوسط</option>
            <option value="high">مرتفع</option>
          </select>

          {/* Faculty */}
          <select value={filters.faculty || ""} onChange={(e) => handleChange("faculty", e.target.value)} className={styles.select}>
            <option value="" disabled hidden>الكلية</option>
            <option value="none">لا يوجد</option>
            {Object.keys(facultyMap).map((fac) => <option key={fac} value={fac}>{fac}</option>)}
          </select>

          {/* Grade */}
         {/* <select
          value={filters.grade || ""}
          onChange={(e) => handleChange("grade", e.target.value)}
          className={styles.select}
        >
          <option value="" disabled hidden>التقدير</option>
          <option value="none">لا يوجد</option>
          <option value="امتياز">امتياز</option>
          <option value="جيد جدا">جيد جدا</option>
          <option value="جيد">جيد</option>
          <option value="مقبول">مقبول</option>
        </select> */}


          {/* Disability */}
         <select
          value={filters.disability || ""}
          onChange={(e) => handleChange("disability", e.target.value)}
          className={styles.select}
        >
          <option value="" disabled hidden>ذوي الهمم</option>
          <option value="none">لا يوجد</option>
          <option value="نعم">نعم</option>
          <option value="لا">لا</option>
        </select>


          {/* Request status */}
          <select value={filters.status || ""} onChange={(e) => handleChange("status", e.target.value)} className={styles.select}>
            <option value="" disabled hidden>حالة الطلب</option>
            <option value="none">لا يوجد</option>
            <option value="موافقة مبدئية">موافقة مبدئية</option>
            <option value="مقبول">مقبول</option>
            <option value="منتظر">منتظر</option>
            <option value="مرفوض">مرفوض</option>
          </select>
        </div>
        <div className={styles.buttonsWrapper}>
  <button onClick={clearAllFilters} className={styles.clearBtn}>
    مسح جميع الفلاتر
  </button>

  <button onClick={onApply} className={styles.applyBtn}>
    تطبيق الفلاتر
  </button>
</div>


        
      </div>
    </div>
  );
}
