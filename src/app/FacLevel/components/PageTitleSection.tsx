"use client";

import React, { useEffect, useState } from "react";
import styles from "../Styles/PageTitleSection.module.css";

export default function PageTitleSection() {
  const [userData, setUserData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className={styles.pageTitleSection}>
      <div className={styles.pageTitleLeft}>
        {/* Icon removed as in original */}
        <div>
          <h2 className={styles.pageTitleH2}>
            {userData
              ? `${userData.faculty_name} - طلبات الدعم المالي`
              : "طلبات الدعم المالي"}
          </h2>

          <p className={styles.pageTitleP}>
            {userData ? `المسؤول: ${userData.name}` : "المسؤول"}
          </p>
        </div>
      </div>

      <div className={styles.pageActions}>
      </div>
    </div>
  );
}
