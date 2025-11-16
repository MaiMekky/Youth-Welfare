"use client";
import React from 'react';
import '../styles/studentFooter.css';
import { Phone, Mail, Facebook, Twitter, Instagram, GraduationCap, MapPin, Clock } from "lucide-react";

const StudentFooter: React.FC = () => {
  return (
    <footer className="student-footer">
      <div className="footer-container">
        {/* University Info */}
        <div className="footer-section university-info">
          <div className="university-header">
            <h3>جامعة حلوان</h3>
            <GraduationCap className="university-icon" />
          </div>
          <p className="university-details">
            بوابة رعاية الشباب - منصة شاملة لجميع الأنشطة والفعاليات الطلابية
          </p>
          <div className="location">
            <span>القاهرة، مصر</span>
            <MapPin className="location-icon" />
          </div>
        </div>

        {/* Contact Section */}
        <div className="footer-section contact-info">
          <h3>اتصل بنا</h3>
          <div className="contact-item">
            <span>01234567890</span>
            <div className="contact-icon-wrapper">
              <Phone className="contact-icon" />
            </div>
          </div>
          <div className="contact-item">
            <span>youth@helwan.edu.eg</span>
            <div className="contact-icon-wrapper">
              <Mail className="contact-icon" />
            </div>
          </div>
          <div className="contact-item">
            <span>السبت - الخميس: 8:00 - 16:00</span>
            <div className="contact-icon-wrapper">
              <Clock className="contact-icon" />
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="footer-section support-info">
          <h3>الدعم الفني</h3>
          <ul className="support-list">
            <li>الأسئلة الشائعة</li>
            <li>مركز المساعدة</li>
            <li>التواصل مع الدعم</li>
            <li>سياسة الخصوصية</li>
          </ul>
        </div>

        {/* Social Media Section */}
        <div className="footer-section social-media">
          <h3>مواقع التواصل</h3>
          <div className="social-icons">
            <a href="#" className="social-link" aria-label="Facebook">
              <Facebook />
            </a>
            <a href="#" className="social-link" aria-label="Twitter">
              <Twitter />
            </a>
            <a href="#" className="social-link" aria-label="Instagram">
              <Instagram />
            </a>
          </div>
          <p className="social-description">
            تابعنا للحصول على آخر الأخبار والفعاليات
          </p>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p className="copyright">
            © 2024 جامعة حلوان - بوابة رعاية الشباب. جميع الحقوق محفوظة.
          </p>
          <div className="footer-links">
            <a href="#">الشروط والأحكام</a>
            <a href="#">سياسة الخصوصية</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default StudentFooter;