"use client";
import React from "react";
import styles from "../Styles/Footer2.module.css";

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        {/* Support */}
        <div className={styles.footerSection}>
          <h3 className={styles.sectionTitle}>الدعم</h3>
          <p>الدعم الفني متاح على مدار الساعة</p>
          <p>مراقبة النظام 24/7</p>
          <p className={styles.email}>admin@university.edu</p>
        </div>

        {/* System Features */}
        <div className={styles.footerSection}>
          <h3 className={styles.sectionTitle}>ميزات النظام</h3>
          <ul className={styles.featuresList}>
            <li>التحكم في الوصول</li>
            <li>مراقبة النشاط</li>
            <li>تحليلات المستخدم</li>
          </ul>
        </div>

        {/* Quick Access */}
        <div className={styles.footerSection}>
          <h3 className={styles.sectionTitle}>وصول سريع</h3>
          <ul className={styles.quickAccessList}>
            <li>إدارة الفعاليات</li>
            <li>التكافل الاجتماعي</li>
          </ul>
        </div>

        {/* Super Admin Dashboard */}
        <div className={styles.footerSection}>
          <h3 className={styles.sectionTitle}>لوحة تحكم المشرف العام</h3>
          <p className={styles.dashboardDescription}>
            منصة إدارة شاملة للأحداث والأنشطة وشؤون الطلاب.
            إدارة المبادرات الثقافية والرياضية والأكاديمية بتميز وفعالية.
          </p>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p className={styles.copyright}>
          لوحة تحكم المشرف العام للجامعة - جميع الحقوق محفوظة © 2025
        </p>
        <div className={styles.footerBottomRow}>
          <span className={styles.status}>
            النظام متصل <span className={styles.statusDot}></span>
          </span>
          <span className={styles.poweredBy}>مدعوم بتقنيات الويب الحديثة</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;