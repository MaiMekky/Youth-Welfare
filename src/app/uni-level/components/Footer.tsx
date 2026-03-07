"use client";
import React from "react";
import "../styles/Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footerContainer">
        <div className="footerLeft">
        <div className="footerLogo">
          <img src="/logo.png" alt="Logo" className="logoImage" />
        </div>
          <div className="footerText">
            <span>بوابة رعاية الشباب بجامعة العاصمة</span>
            <span>قسم خدمات الطلاب</span>
          </div>
        </div>
        <div className="footerRight">
          <p>الإصدار: 1.0.9</p>
          <p>© منصة رعاية الشباب - جامعة العاصمة - جميع الحقوق محفوظة</p>
        </div>
      </div>
    </footer>
  );
}
