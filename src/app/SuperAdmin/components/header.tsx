"use client";
import React from "react";
import styles from "../Styles/Header.module.css";
import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const router = useRouter();

  const handleLogout = () => {
    // إزالة التوكن من التخزين المحلي
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    // إعادة التوجيه لصفحة تسجيل الدخول
    router.push("/");
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <button className={styles.mobileToggle} onClick={toggleSidebar}>
          <Menu size={24} />
        </button>

        <div className={styles.brand}>
          <div className={styles.brandText}>
            <h1 className={styles.title}>التكافل الاجتماعي</h1>
            <p className={styles.subtitle}>طلبات الدعم المالي المعتمدة للطلاب</p>
          </div>
        </div>

        <div className={styles.controls}>
          <button className={styles.exportBtn}>
            <span className={styles.exportIcon}>⬇</span> تصدير البيانات
          </button>

          <div className={styles.searchBox}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="ابحث بالاسم أو الرقم القومي أو كود التكافل..."
            />
          </div>

          {/* زر تسجيل الخروج */}
          <button className={styles.logoutBtn} onClick={handleLogout}>
            تسجيل خروج
          </button>
        </div>
      </div>
    </header>
  );
}
