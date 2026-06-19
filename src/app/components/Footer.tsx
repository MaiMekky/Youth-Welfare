"use client";
import React from "react";
import Image from "next/image";
import { Facebook, Instagram, Youtube, MapPin, Phone, Mail } from "react-feather";
import capitalLogo from "@/app/assets/capital-uni-logo.png";
import styles from "../Styles/components/Footer.module.css";

const Footer: React.FC = () => {
  return (
    <footer id="footer" className={styles.footer}>
      {/* Decorative top border */}
      <div className={styles.footerTopAccent} />

      <div className={styles.footerInner}>
        <div className={styles.footerGrid}>

          {/* Brand Column */}
          <div className={styles.footerBrandCol}>
            <div className={styles.footerLogoRow}>
              <div className={styles.footerBrandText}>
                <h3 className={styles.brandName}>جامعة العاصمة</h3>
                <span className={styles.brandTagline}>بوابة رعاية الطلاب</span>
              </div>
                 <div className={styles.footerLogoWrapper}>
                <Image
                  src={capitalLogo}
                  alt="جامعة العاصمة"
                  style={{ objectFit: "contain" }}
                  fill
                />
                </div>
            </div>

            <div className={styles.dividerLine} />

            <p className={styles.brandDesc}>
              نهدف إلى تنمية قدرات الطلاب وإثراء تجربتهم الجامعية من خلال مجموعة متنوعة من الأنشطة الثقافية والرياضية والعلمية.
            </p>

            <div className={styles.socialRow}>
              {[
                { Icon: Facebook, label: "Facebook" },
                { Icon: Instagram, label: "Instagram" },
                { Icon: Youtube, label: "Youtube" },
              ].map(({ Icon, label }) => (
                <a key={label} href="#" className={styles.socialBtn} aria-label={label}>
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Column */}
          <div className={styles.footerCol}>
            <h4 className={styles.colHeading}>
              <span className={styles.colHeadingAccent} />
              روابط سريعة
            </h4>
            <ul className={styles.linkList}>
              {[
                "تسجيل الأنشطة",
                // "اتحاد الطلبة",
                "الأندية الطلابية",
                "المسابقات",
                "الفعاليات",
              ].map((link) => (
                <li key={link} className={styles.linkItem}>
                  <a href="#" className={styles.footerLink}>
                    <span className={styles.linkArrow}>›</span>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div className={styles.footerCol}>
            <h4 className={styles.colHeading}>
              <span className={styles.colHeadingAccent} />
              اتصل بنا
            </h4>
            <div className={styles.contactList}>
              {[
                { Icon: MapPin, text: "حلوان، القاهرة، مصر" },
                { Icon: Phone, text: "025-5555-123" },
                { Icon: Mail, text: "info@helwan.edu.eg" },
              ].map(({ Icon, text }) => (
                <div key={text} className={styles.contactItem}>
                  <span className={styles.contactIconWrap}>
                    <Icon size={15} />
                  </span>
                  <span className={styles.contactText}>{text}</span>
                </div>
              ))}
            </div>

            <a href="#" className={styles.supportLink}>
              الدعم الفني &nbsp;→
            </a>
          </div>
        </div>

       {/* Footer Bottom */}
    <div className={styles.footerBottom}>
      <div className={styles.copyrightDivider} />
      <div className={styles.copyrightContent}>
        <p className={styles.copyrightAr}>
          جميع حقوق النشر والملكية الفكرية محفوظة لـ
          <span className={styles.copyrightHighlight}> كلية الحاسبات والذكاء الاصطناعي </span>
          و <span className={styles.copyrightHighlight}> مركز الاتصالات وتكنولوجيا المعلومات </span>
        </p>
        <span className={styles.copyrightSep}>·</span>
        <p className={styles.copyrightEn}>
          All copyrights &amp; intellectual property rights reserved by
          <span className={styles.copyrightHighlight}> FCAI </span>&amp;
          <span className={styles.copyrightHighlight}> CITC</span>
        </p>
      </div>
    </div>
      </div>
    </footer>
  );
};

export default Footer;