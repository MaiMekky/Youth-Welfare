"use client";
import React from "react";
import "../Styles/Footer2.css";

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Support */}
        <div className="footer-section">
          <h3 className="section-title">الدعم</h3>
          <p>الدعم الفني متاح على مدار الساعة</p>
          <p>مراقبة النظام 24/7</p>
          <p className="email">admin@university.edu</p>
        </div>

        {/* System Features */}
        <div className="footer-section">
          <h3 className="section-title">ميزات النظام</h3>
          <ul className="features-list">
            <li>التحكم في الوصول</li>
            <li>مراقبة النشاط</li>
            <li>تحليلات المستخدم</li>
          </ul>
        </div>

        {/* Quick Access */}
        <div className="footer-section">
          <h3 className="section-title">وصول سريع</h3>
          <ul className="quick-access-list">
            <li>إدارة الفعاليات</li>
            <li>التكافل الاجتماعي</li>
          </ul>
        </div>

        {/* Super Admin Dashboard */}
        <div className="footer-section">
          <h3 className="section-title">لوحة تحكم المشرف العام</h3>
          <p className="dashboard-description">
            منصة إدارة شاملة للأحداث والأنشطة وشؤون الطلاب.
            إدارة المبادرات الثقافية والرياضية والأكاديمية بتميز وفعالية.
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>لوحة تحكم المشرف العام للجامعة - جميع الحقوق محفوظة © 2025</p>
        <div className="footer-bottom-row">
          <span className="status">
            النظام متصل <span className="status-dot"></span>
          </span>
          <span className="powered-by">مدعوم بتقنيات الويب الحديثة</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
