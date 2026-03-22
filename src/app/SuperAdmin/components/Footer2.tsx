"use client";
import React from "react";
import Image from "next/image";
import styles from "../Styles/Footer2.module.css";
import { MapPin, Users } from "lucide-react";
import capitalLogo from "../../../app/assets/capital-uni-logo.png";

export default function Footer() {
  return ( 
  <div className={styles.pageWrapper}>
    
    <div className={styles.pageContent}>

    </div>
    <footer className={styles.footer}>
      <div className={styles.footerTop}>

        {/* Col 1: جامعة العاصمة */}
        <div className={styles.footerCol}>
          <div className={styles.brandBlock}>
            <div className={styles.brandIcon}>
              <Image
                src={capitalLogo}
                alt="Capital University Logo"
                width={70}
                height={70}
                draggable={false}
              />
            </div>
            <div>
              <div className={styles.brandName}>جامعة العاصمة</div>
              <div className={styles.brandSub}>Capital University</div>
            </div>
          </div>
          <p className={styles.brandDesc}>
            جامعة مصرية حكومية تأسست عام 1975، تضم العديد من الكليات والمعاهد
            المتخصصة في مختلف المجالات العلمية والتطبيقية
          </p>
          <div className={styles.brandMeta}>
            <div className={styles.metaRow}>
              <MapPin size={14} />
              <span>عين حلوان، القاهرة، جمهورية مصر العربية</span>
            </div>
            <div className={styles.metaRow}>
              <Users size={14} />
              <span>أكثر من 180,000 طالب وطالبة</span>
            </div>
          </div>
        </div>

        {/* Col 2: نظام إدارة شؤون الطلاب */}
        <div className={styles.footerCol}>
          <div className={styles.colTitle}>نظام إدارة شؤون الطلاب</div>
          <p className={styles.colDesc}>
            المنصة الرقمية الموحدة لإدارة الأنشطة الطلابية والشبابية بجامعة العاصمة
          </p>
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
    </footer>
    </div>
  );
}