"use client";
import React from "react";
import "../Styles/Footer.css";
import { MapPin, Phone, Mail, Globe, ExternalLink } from "lucide-react";

const QUICK_LINKS = [
  { label: "الموقع الرسمي للجامعة", href: "https://www.helwan.edu.eg" },
  { label: "نظام إدارة التعلم",      href: "#" },
  { label: "شؤون الطلاب",            href: "#" },
  { label: "الأنشطة الطلابية",       href: "#" },
];

const DEPARTMENTS = [
  "إدارة الأنشطة الرياضية",
  "إدارة الأنشطة الاجتماعية",
  "إدارة الجوالة والخدمة العامة",
  "إدارة الأنشطة الفنية",
  "إدارة الأنشطة الثقافية",
  "إدارة الأنشطة العلمية",
  "إدارة التضامن الاجتماعي",
  "إدارة اتحادات الطلاب",
];

export default function Footer() {
  return (
    <footer className="ftr" dir="rtl">

      {/* ── Main content ── */}
      <div className="ftr-main">

        {/* Col 1 – Brand */}
        <div className="ftr-col ftr-brand-col">
          <div className="ftr-logo-area">
            <div className="ftr-logo-badge">HU</div>
            <div>
              <p className="ftr-brand-name">جامعة حلوان</p>
              <p className="ftr-brand-en">Helwan University</p>
            </div>
          </div>
          <p className="ftr-brand-desc">
            إدارة شؤون الطلاب والأنشطة الطلابية<br />
            نظام إدارة الفعاليات والأنشطة
          </p>
          <div className="ftr-version">الإصدار 1.0.9</div>
        </div>

        {/* Col 2 – Quick Links */}
        <div className="ftr-col">
          <h3 className="ftr-col-title">روابط سريعة</h3>
          <ul className="ftr-links">
            {QUICK_LINKS.map(l => (
              <li key={l.label}>
                <a href={l.href} className="ftr-link" target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={12} />
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3 – Contact */}
        <div className="ftr-col">
          <h3 className="ftr-col-title">معلومات الاتصال</h3>
          <ul className="ftr-contact">
            <li>
              <MapPin size={14} className="ftr-contact-icon" />
              <span>حلوان، محافظة القاهرة، مصر</span>
            </li>
            <li>
              <Phone size={14} className="ftr-contact-icon" />
              <span dir="ltr">+20 2 2555 0000</span>
            </li>
            <li>
              <Mail size={14} className="ftr-contact-icon" />
              <a href="mailto:info@helwan.edu.eg" className="ftr-contact-link">info@helwan.edu.eg</a>
            </li>
            <li>
              <Globe size={14} className="ftr-contact-icon" />
              <a href="https://www.helwan.edu.eg" className="ftr-contact-link" target="_blank" rel="noopener noreferrer">
                www.helwan.edu.eg
              </a>
            </li>
          </ul>
        </div>

        {/* Col 4 – Departments */}
        <div className="ftr-col">
          <h3 className="ftr-col-title">الإدارات</h3>
          <ul className="ftr-depts">
            {DEPARTMENTS.map(d => (
              <li key={d} className="ftr-dept-item">
                <span className="ftr-dept-dot" />
                {d}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="ftr-bottom">
        <p>© {new Date().getFullYear()} جامعة حلوان — نظام إدارة الأنشطة الطلابية. جميع الحقوق محفوظة.</p>
      </div>
    </footer>
  );
}