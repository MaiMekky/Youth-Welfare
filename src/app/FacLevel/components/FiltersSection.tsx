import React from "react";
import styles from "../Styles/FiltersSection.module.css";
import { Filter, Search } from "lucide-react";

export default function FiltersSection({
  selectedFilter,
  setSelectedFilter,
  searchQuery,
  setSearchQuery,
}: any) {
  return (
    <div className={styles.filtersSection}>
      <div className={styles.filtersHeader}>
        <Filter size={20} />
        <h3>المرشحات والبحث</h3>
      </div>

      <div className={styles.filtersContent}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            placeholder="ابحث بالاسم أو رقم الطلب..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

      <select
  value={selectedFilter}
  onChange={(e) => setSelectedFilter(e.target.value)}
  className={styles.filterSelect}
>
  <option value="all">عرض الكل</option>
  <option value="منتظر">منتظر</option>
  <option value="موافقة مبدئية">موافقة مبدئية</option>
  <option value="مقبول">مقبول</option>
  <option value="مرفوض">مرفوض</option>
</select>

      </div>
    </div>
  );
}
