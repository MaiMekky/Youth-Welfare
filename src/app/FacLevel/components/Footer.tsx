import React from "react";
import styles from "../Styles/Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.left}>
        <p>
          إدارة التكافل الاجتماعي | جامعة حلوان<br />
          قسم خدمات الطلاب - نظام إدارة الدعم المالي
        </p>
      </div>
      <div className={styles.center}>
        <p>solidarity@helwan.edu.eg :الدعم</p>
        <p>© 2024 جامعة حلوان. جميع الحقوق محفوظة.</p>
      </div>
      <div className={styles.right}>
        <p>آخر تحديث: ديسمبر 2024</p>
        <p>الإصدار 1.0.0 - النظام نشط</p>
      </div>
    </footer>
  );
}

