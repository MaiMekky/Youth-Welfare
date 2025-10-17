// components/Footer.tsx
"use client";
import React from "react";
import Image from "next/image";
import { Facebook, Instagram, Youtube, MapPin, Phone, Mail } from "react-feather";
import youthLogo from "../assets/logo1.png"; 

const Footer: React.FC = () => {
  // Inline styles
  const footerStyle: React.CSSProperties = {
    backgroundColor: "#27285D",
    color: "white",
  };

  const textLightStyle: React.CSSProperties = {
    color: "#F3F5FD",
  };

  const grayTextStyle: React.CSSProperties = {
    color: "#B0B0B0",
  };

  const socialBtnStyle: React.CSSProperties = {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#B38E19",
    transition: "background-color 0.3s",
    cursor: "pointer",
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    (e.currentTarget.style as any).backgroundColor = "#A07E16";
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    (e.currentTarget.style as any).backgroundColor = "#B38E19";
  };

  return (
    <footer id="footer" style={footerStyle}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(1, 1fr)",
            gap: "32px",
          }}
        >
          {/* University Logo & Info */}
          <div style={{ gridColumn: "span 1 / span 1" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  backgroundColor: "white",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                  marginLeft: "16px",
                  position: "relative",
                }}
              >
                <Image
                  src={youthLogo}
                  alt="الإدارة العامة لرعاية الشباب"
                  style={{ objectFit: "contain" }}
                  fill
                />
              </div>
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>جامعة حلوان</h3>
                <p style={textLightStyle}>بوابة رعاية الشباب</p>
              </div>
            </div>
            <p style={{ ...textLightStyle, lineHeight: "1.8", marginBottom: "24px" }}>
              نهدف إلى تنمية قدرات الطلاب وإثراء تجربتهم الجامعية من خلال مجموعة متنوعة من الأنشطة الثقافية والرياضية والعلمية.
            </p>
            <div style={{ display: "flex", gap: "12px", flexDirection: "row-reverse" }}>
              {[Facebook, Instagram, Youtube].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  style={socialBtnStyle}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: "1.125rem", fontWeight: "bold", marginBottom: "24px" }}>
              روابط سريعة
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              {["تسجيل الأنشطة", "اتحاد الطلبة", "الأندية الطلابية", "المسابقات", "الفعاليات"].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    style={{ color: "#B0B0B0", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#B0B0B0")}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 style={{ fontSize: "1.125rem", fontWeight: "bold", marginBottom: "24px" }}>اتصل بنا</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <MapPin size={18} style={{ marginLeft: "12px", color: "#FACC15" }} />
                <span style={grayTextStyle}>حلوان، القاهرة، مصر</span>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <Phone size={18} style={{ marginLeft: "12px", color: "#FACC15" }} />
                <span style={grayTextStyle}>025-5555-123</span>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <Mail size={18} style={{ marginLeft: "12px", color: "#FACC15" }} />
                <span style={grayTextStyle}>info@helwan.edu.eg</span>
              </div>
            </div>
            <div style={{ marginTop: "24px" }}>
              <a
                href="#"
                style={{ color: "#B0B0B0", fontSize: "0.875rem", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#B0B0B0")}
              >
                الدعم الفني
              </a>
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid #1f1f2e", marginTop: "32px", paddingTop: "32px", textAlign: "center" }}>
          <p style={grayTextStyle}>
            © 2025 جامعة حلوان - بوابة رعاية الشباب. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
