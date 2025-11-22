"use client";

import React, { useEffect, useState } from "react";
import styles from "../Styles/PageTitleSection.module.css";
import { FileText, Printer } from "lucide-react";
import axios from "axios";

export default function PageTitleSection() {
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);

  const handleExport = async () => { 
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/api/solidarity/faculty/export`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
          responseType: "blob"
        }
      );
      const blob = new Blob([res.data], { type: 'application/pdf' });
    
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = res.headers['content-disposition'];
      let filename = 'document.pdf';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch.length === 2) {
          filename = filenameMatch[1];
        }
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("coudnt generate pdf, error:", err);
    }
  }

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
        <button className={styles.btnSecondary} onClick={handleExport}>
          <FileText size={18} />
          <span>تصدير</span>
        </button>
      </div>
    </div>
  );
}
