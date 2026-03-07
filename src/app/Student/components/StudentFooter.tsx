"use client";
import React from 'react';
import Image from "next/image";
import logo from "@/app/assets/capital-uni-logo.png";
import '../styles/studentFooter.css';
import { Phone, Mail, Facebook, Twitter, Instagram, MapPin, Clock, HelpCircle, BookOpen, MessageCircle, Shield } from "lucide-react";

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
              <Image
                src={logo}
                alt="شعار جامعة العاصمة"
                width={60}
                height={60}
                style={{ objectFit: "contain", width: "100%", height: "100%" }}
                priority
                draggable={false}
                quality={100}
              />
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
          
          </div>
        </div>

        {/* ── Support ── */}
        <div className="footer-section">
          <h3>الدعم والمساعدة</h3>
          <ul className="support-list">
            <li><HelpCircle    size={13} style={{color:'#c9972a', flexShrink:0}} />الأسئلة الشائعة</li>
            <li><BookOpen      size={13} style={{color:'#c9972a', flexShrink:0}} />مركز المساعدة</li>
            <li><MessageCircle size={13} style={{color:'#c9972a', flexShrink:0}} />التواصل مع الدعم</li>
            <li><Shield        size={13} style={{color:'#c9972a', flexShrink:0}} />سياسة الخصوصية</li>
          </ul>
        </div>

        {/* ── Social Media ── */}
        <div className="footer-section">
          <h3>تابعنا</h3>
          <div className="social-icons">
            <a href="#" className="social-link" aria-label="Instagram"><Instagram /></a>
            <a href="#" className="social-link" aria-label="Twitter"><Twitter /></a>
            <a href="#" className="social-link" aria-label="Facebook"><Facebook /></a>
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