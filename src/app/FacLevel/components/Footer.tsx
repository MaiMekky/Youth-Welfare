import React from "react";
import styles from "../Styles/Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.left}>
        <img src="/logo.png" alt="logo" className={styles.logo} />
        <p>قسم خدمات الطلاب</p>
        <p>بوابة رعاية الشباب بجامعة العاصمة</p>
      </div>

      <div className={styles.center}>
        <p>© 2026 جامعة العاصمة. جميع الحقوق محفوظة.</p>
      </div>

      <div className={styles.right}>
        <p>آخر تحديث: ديسمبر 2026</p>
        <p>الإصدار 1.0.0 - النظام نشط</p>
      </div>
    </footer>
  );
}