"use client";
import React from "react";
import styles from "../Styles/Footer.module.css";
import { MapPin, Phone, Mail, Globe, Users, Facebook, Twitter, Instagram } from "lucide-react";
import capitalLogo from "../../../app/assets/capital-uni-logo.png";

export default function Footer() {
  return (
    <footer className={styles.footer}>

      <div className={styles.footerTop}>

        {/* Col 1: جامعة حلوان */}
        <div className={styles.footerCol}>
          <div className={styles.brandBlock}>
            <div className={styles.brandIcon}>
              <img src={capitalLogo.src} alt="Capital University Logo" width="70" height="70" draggable={false} />
            </div>
            <div>
              <div className={styles.brandName}>جامعة العاصمة</div>
              <div className={styles.brandSub}>Capital University</div>
            </div>
          </div>
          <p className={styles.brandDesc}>
            جامعة مصرية حكومية تأسست عام 1975، تضم العديد من الكليات والمعاهد المتخصصة في مختلف المجالات العلمية والتطبيقية
          </p>
          <div className={styles.brandMeta}>
            <div className={styles.metaRow}><MapPin size={14} /><span>عين حلوان، القاهرة، جمهورية مصر العربية</span></div>
            <div className={styles.metaRow}><Users size={14} /><span>أكثر من 180,000 طالب وطالبة</span></div>
          </div>
        </div>

        {/* Col 2: نظام إدارة شؤون الشباب */}
        <div className={styles.footerCol}>
          <div className={styles.colTitle}>نظام إدارة شؤون الطلاب</div>
          <p className={styles.colDesc}>المنصة الرقمية الموحدة لإدارة الأنشطة الطلابية والشبابية بجامعة العاصمة</p>
          {/* <ul className={styles.colListIcon}>
            <li><Users size={13} /><span>النظرة العامة</span></li>
            <li><Users size={13} /><span>إدارة الفعاليات</span></li>
            <li><Users size={13} /><span>إدارة المدراء</span></li>
            <li><Users size={13} /><span>تقارير الكليات</span></li>
          </ul> */}
        </div>

        {/* Col 3: إدارات رعاية الشباب */}
        <div className={styles.footerCol}>
          <div className={styles.colTitle}>إدارات رعاية الشباب</div>
          <ul className={styles.colListPlain}>
            <li>إدارة الأنشطة الرياضية</li>
            <li>إدارة الأنشطة الاجتماعية</li>
            <li>إدارة الكشافة والخدمة العامة</li>
            <li>إدارة الأنشطة الفنية</li>
            <li>إدارة الأنشطة الثقافية</li>
            <li>إدارة الأنشطة العلمية</li>
            <li>إدارة التضامن الاجتماعي</li>
          </ul>
        </div>



      </div>

      {/* Stats bar
      <div className={styles.footerStats}>
        <div className={styles.statItem}><span className={styles.statNum}>+24</span><span className={styles.statLbl}>كلية </span></div>
        <div className={styles.statItem}><span className={styles.statNum}>+180K</span><span className={styles.statLbl}>طالب وطالبة</span></div>
        <div className={styles.statItem}><span className={styles.statNum}>100</span><span className={styles.statLbl}>عام من التميز</span></div>
        <div className={styles.statItem}><span className={styles.statNum}>3</span><span className={styles.statLbl}>فروع جامعية</span></div>
      </div> */}

    </footer>
  );
}