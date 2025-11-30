"use client";
import React, { useState } from "react";
import styles from "../Styles/components/Navbar.module.css";
import { Search, User, Globe } from "lucide-react";
import LoginPage from "./LoginPage";
import SignupPage from "./SignUp";

const Navbar: React.FC = () => {
  const [lang, setLang] = useState("ar");

  // ✅ Local modal state
  const [showModal, setShowModal] = useState(false);
  const [activeScreen, setActiveScreen] = useState<"login" | "signup">("login");

  const toggleLang = () => {
    setLang(lang === "ar" ? "en" : "ar");
  };

  return (
    <>
      <header className={styles.header} dir={lang === "ar" ? "rtl" : "ltr"} lang={lang}>
        <div className={styles.navContent}>
          {/* Right side: search + buttons */}
          <div className={styles.rightSide}>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder={lang === "ar" ? "البحث في الموقع..." : "Search the site..."}
              />
              <Search className={styles.searchIcon} size={16} />
            </div>

            <button className={styles.topBtn} onClick={toggleLang}>
              <Globe size={14} />
              {lang === "ar" ? "English" : "العربية"}
            </button>

            {/* ✅ Student Portal Button */}
            <button
              className={styles.topBtn}
              onClick={() => {
                setActiveScreen("signup"); // open signup by default
                setShowModal(true);
              }}
            >
              <User size={14} />
              {lang === "ar" ? "بوابة الطلاب" : "Student Portal"}
            </button>
          </div>

          {/* Left side: department info */}
          <div className={styles.departmentInfo}>
            <h2>
              {lang === "ar"
                ? "الإدارة العامة لرعاية الشباب"
                : "General Administration of Youth Care"}
            </h2>
            <p>
              {lang === "ar"
                ? "Helwan University - Youth Care"
                : "Helwan University - Youth Care"}
            </p>
          </div>
        </div>
      </header>

      {/* ✅ Modal Popup */}
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
              // backgroundColor: "#fff",
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