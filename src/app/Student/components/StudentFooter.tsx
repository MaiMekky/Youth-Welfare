"use client";
import React from 'react';
import '../styles/studentFooter.css';
import { Phone, Mail, Facebook, Twitter, Instagram, MapPin, Clock, HelpCircle, BookOpen, MessageCircle, Shield } from "lucide-react";

/* University emblem (matches navbar) */
const UniversityEmblem = () => (
  <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="19" width="8" height="4" rx="1" fill="rgba(255,255,255,0.55)"/>
    <rect x="11.5" y="9" width="5" height="11" rx="1" fill="rgba(255,255,255,0.75)"/>
    <rect x="11.5" y="7" width="1.8" height="3" rx="0.5" fill="rgba(255,255,255,0.9)"/>
    <rect x="14.7" y="7" width="1.8" height="3" rx="0.5" fill="rgba(255,255,255,0.9)"/>
    <rect x="12.8" y="15" width="2.4" height="5" rx="1" fill="rgba(0,0,0,0.2)"/>
    <path d="M11.5 13 L7 15 L7 19 L11.5 19 Z" fill="rgba(255,255,255,0.4)"/>
    <path d="M16.5 13 L21 15 L21 19 L16.5 19 Z" fill="rgba(255,255,255,0.4)"/>
    <circle cx="14" cy="5.5" r="1.8" fill="rgba(255,255,255,0.95)"/>
  </svg>
);

const StudentFooter: React.FC = () => {
  return (
    <footer className="student-footer" id="footer">
      <div className="footer-container">

        {/* ── Brand / University Info ── */}
        <div className="footer-section">
          <div className="university-brand">
            <div className="footer-brand-text">
              <span className="footer-brand-name">رعاية الطلاب</span>
              <span className="footer-brand-sub">جامعة العاصمة</span>
            </div>
            <div className="footer-logo-mark">
              <UniversityEmblem />
            </div>
          </div>

          <p className="university-details">
            بوابة رعاية الطلاب — منصة شاملة تجمع جميع الأنشطة والفعاليات والخدمات الطلابية في مكان واحد، لدعم مسيرتك الجامعية.
          </p>

          <div className="footer-location">
            <span>القاهرة، مصر</span>
            <MapPin />
          </div>
        </div>

        {/* ── Contact ── */}
        <div className="footer-section">
          <h3>اتصل بنا</h3>
          <div className="contact-list">
            <div className="contact-item">
              <span>01234567890</span>
              <div className="contact-icon-box"><Phone /></div>
            </div>
            <div className="contact-item">
              <span>youth@capital.edu.eg</span>
              <div className="contact-icon-box"><Mail /></div>
            </div>
            <div className="contact-item">
              <span>السبت – الخميس: 8:00 – 16:00</span>
              <div className="contact-icon-box"><Clock /></div>
            </div>
          </div>
        </div>

        {/* ── Support ── */}
        <div className="footer-section">
          <h3>الدعم والمساعدة</h3>
          <ul className="support-list">
            <li><HelpCircle size={13} style={{color:'#c9972a', flexShrink:0}} />الأسئلة الشائعة</li>
            <li><BookOpen    size={13} style={{color:'#c9972a', flexShrink:0}} />مركز المساعدة</li>
            <li><MessageCircle size={13} style={{color:'#c9972a', flexShrink:0}} />التواصل مع الدعم</li>
            <li><Shield      size={13} style={{color:'#c9972a', flexShrink:0}} />سياسة الخصوصية</li>
          </ul>
        </div>

        {/* ── Social Media ── */}
        <div className="footer-section">
          <h3>تابعنا</h3>
          <div className="social-icons">
            <a href="#" className="social-link" aria-label="Instagram">
              <Instagram />
            </a>
            <a href="#" className="social-link" aria-label="Twitter">
              <Twitter />
            </a>
            <a href="#" className="social-link" aria-label="Facebook">
              <Facebook />
            </a>
          </div>
          <p className="social-description">
            تابع صفحاتنا للاطلاع على آخر الأخبار والفعاليات والإعلانات الجامعية.
          </p>
        </div>

      </div>

      {/* ── Bottom Bar ── */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p className="copyright">
            © {new Date().getFullYear()} جامعة العاصمة — جميع الحقوق محفوظة
          </p>
          <div className="footer-bottom-links">
            <a href="#">سياسة الخصوصية</a>
            <a href="#">شروط الاستخدام</a>
            <a href="#">تواصل معنا</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default StudentFooter;