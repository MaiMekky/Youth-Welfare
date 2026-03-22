"use client";
import React, { useState, useEffect } from "react";
import styles from "../Styles/components/Navbar.module.css";
import LoginPage from "./LoginPage";
import SignupPage from "./SignUp";
import Image from "next/image";
import logo from "../assets/capital-uni-logo.png";

const Navbar: React.FC = () => {
  const [lang] = useState("ar");
  const [scrolled, setScrolled] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [activeScreen, setActiveScreen] = useState<"login" | "signup">("login");
    useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 120); // trigger after hero
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header  className={`${styles.header} ${scrolled ? styles.headerScrolled : ""}`} dir={lang === "ar" ? "rtl" : "ltr"} lang={lang}>
        
        {/* Floating Logo */}
        <div   className={`${styles.logoWrapper} ${
          scrolled ? styles.logoScrolled : ""
        }`}>
          <Image
            src={logo}
            alt="Capital University"
            width={90}
            height={110}
            className={styles.logoImage}
            draggable={false}
            priority
          />
        </div>

        <div className={styles.navContent}>
          <div className={styles.rightSide}></div>

          <div className={styles.departmentInfo}>
            <h2>
              {lang === "ar"
                ? "الإدارة العامة لرعاية الطلاب"
                : "General Administration of Youth Care"}
            </h2>
            <p>
              {lang === "ar"
                ? "Capital University - Youth Welfare"
                : "Capital University - Youth Care"}
            </p>
          </div>
        </div>
      </header>

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              borderRadius: "15px",
              padding: "30px",
              maxWidth: "500px",
              width: "90%",
            }}
          >
            {activeScreen === "login" ? (
              <LoginPage
                onClose={() => setShowModal(false)}
                onSwitchToSignup={() => setActiveScreen("signup")}
              />
            ) : (
              <SignupPage
                onClose={() => setShowModal(false)}
                onSwitchToLogin={() => setActiveScreen("login")}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;