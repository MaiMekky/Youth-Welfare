"use client";
import React, { useState } from "react";
import styles from "../Styles/components/Navbar.module.css";
import { Search, User, Globe } from "lucide-react";

const Navbar: React.FC = () => {
  const [lang, setLang] = useState("ar");

  const toggleLang = () => {
    setLang(lang === "ar" ? "en" : "ar");
  };

  return (
    <header
      className={styles.header}
      dir={lang === "ar" ? "rtl" : "ltr"}
      lang={lang}
    >
      <div className={styles.navContent}>
        {/* Right side: search + buttons */}
        <div className={styles.rightSide}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder={
                lang === "ar" ? "البحث في الموقع..." : "Search the site..."
              }
            />
            <Search className={styles.searchIcon} size={16} />
          </div>

          <button className={styles.topBtn} onClick={toggleLang}>
            <Globe size={14} />
            {lang === "ar" ? "English" : "العربية"}
          </button>

          <button className={styles.topBtn}>
            <User size={14} />
            {lang === "ar" ? "بوابة الطلاب" : "Student Portal"}
          </button>
        </div>

        {/* Left side: department info */}
        <div className={styles.departmentInfo}>
          <h2>
            {lang === "ar"
              ? "الإدارة العامة لرعاية الشباب"
              : "General Administration of Youth Care"}
          </h2>
          <p>
            {lang === "ar"
              ? "Helwan University - Youth Care"
              : "Helwan University - Youth Care"}
          </p>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
