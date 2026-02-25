// components/Footer.tsx
"use client";
import React from "react";
import Image from "next/image";
import { Facebook, Instagram, Youtube, MapPin, Phone, Mail } from "react-feather";
import youthLogo from "../assets/logo1.png";
import styles from "../Styles/components/Footer.module.css";

const Footer: React.FC = () => {
  const textLightStyle: React.CSSProperties = { color: "#F3F5FD" };
  const grayTextStyle: React.CSSProperties = { color: "#B0B0B0" };

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    (e.currentTarget.style as any).backgroundColor = "#A07E16";
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    (e.currentTarget.style as any).backgroundColor = "#B38E19";
  };

  return (
    <footer id="footer" className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerGrid}>
          <div className={styles.footerLogoSection}>
            <div className={styles.footerLogoRow}>
              <div className={styles.footerLogoWrapper}>
                <Image
                  src={youthLogo}
                  alt="الإدارة العامة لرعاية الطلاب"
                  style={{ objectFit: "contain" }}
                  fill
                />
              </div>
              <div>
                <h3 style={{ fontSize: "1rem", fontWeight: "bold", margin: 0 }}>جامعة العاصمة</h3>
                <p style={{ ...textLightStyle, margin: 0 }}>بوابة رعاية الطلاب</p>
              </div>
            </div>
            <p style={{ ...textLightStyle, lineHeight: "1.8", marginBottom: "1.5rem" }}>
              نهدف إلى تنمية قدرات الطلاب وإثراء تجربتهم الجامعية من خلال مجموعة متنوعة من الأنشطة الثقافية والرياضية والعلمية.
            </p>
            <div className={styles.footerSocialRow}>
              {[Facebook, Instagram, Youtube].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className={styles.socialBtn}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          <div className={styles.footerSection}>
            <h4>روابط سريعة</h4>
            <ul className={styles.footerLinks}>
              {["تسجيل الأنشطة", "اتحاد الطلبة", "الأندية الطلابية", "المسابقات", "الفعاليات"].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    style={{ ...grayTextStyle, textDecoration: "none" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#B0B0B0")}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h4>اتصل بنا</h4>
            <div className={styles.contactList}>
              <div className={styles.contactItem}>
                <MapPin size={18} style={{ flexShrink: 0, color: "#FACC15" }} />
                <span style={grayTextStyle}>حلوان، القاهرة، مصر</span>
              </div>
              <div className={styles.contactItem}>
                <Phone size={18} style={{ flexShrink: 0, color: "#FACC15" }} />
                <span style={grayTextStyle}>025-5555-123</span>
              </div>
              <div className={styles.contactItem}>
                <Mail size={18} style={{ flexShrink: 0, color: "#FACC15" }} />
                <span style={grayTextStyle}>info@helwan.edu.eg</span>
              </div>
            </div>
            <div style={{ marginTop: "1.5rem" }}>
              <a
                href="#"
                style={{ ...grayTextStyle, fontSize: "0.875rem", textDecoration: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#B0B0B0")}
              >
                الدعم الفني
              </a>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p style={grayTextStyle}>
            © 2026 جامعة العاصمة - بوابة رعاية الطلاب. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
