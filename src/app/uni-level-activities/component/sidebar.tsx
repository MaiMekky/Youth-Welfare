"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import "@/app/Styles/Sidebar.css";
import { Menu, X, User, Users, CalendarDays, Bell } from "lucide-react";
import Image from "next/image";
import logo from "../../assets/logo.png";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const [adminInfo, setAdminInfo] = useState({
    name: "",
    email: "",
    role: "",
  });

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth <= 768);
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  useEffect(() => {
    const userDataString = localStorage.getItem("user");
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        setAdminInfo({
          name: userData.name || "مدير النظام",
          email: userData.email || "admin@helwan.edu.eg",
          role: userData.role || "",
        });
      } catch (error) {
        console.error("فشل في قراءة بيانات المدير", error);
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const sidebar = document.getElementById("sidebar");
      const mobileBtn = document.querySelector(".mobileMenuBtn");
      if (
        isOpen &&
        sidebar &&
        !sidebar.contains(e.target as Node) &&
        mobileBtn &&
        !(mobileBtn as HTMLElement).contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen && isMobile) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isMobile]);

  const handleNav = (path: string) => {
    router.push(path);
    if (isMobile) setIsOpen(false);
  };

  return (
    <>
      {isMobile && (
        <button
          className="mobileMenuBtn"
          onClick={() => setIsOpen(true)}
          aria-label="فتح القائمة"
        >
          <Menu size={24} />
        </button>
      )}

      <aside id="sidebar" className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo-container" aria-hidden="true">
            <div className="logo-wrapper">
              <div className="logo-circle">
                <Image
                  src={logo}
                  alt="شعار الجامعة"
                  className="sidebar-logo"
                  width={96}
                  height={96}
                  priority
                />
              </div>
            </div>
          </div>
          <h2 className="sidebar-title">إدارة الفعاليات</h2>
          <p className="sidebar-subtitle">جامعة حلوان - قسم خدمات الطلاب</p>
          {isMobile && (
            <button
              className="sidebar-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="إغلاق القائمة"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="profile-card">
          <div className="profile-icon">
            <User size={22} />
          </div>
          <div className="admin-info">
            <h3>{adminInfo.name}</h3>
            {adminInfo.role && <p>{adminInfo.role}</p>}
          </div>
        </div>

        <nav className="nav">
          <button
            className={pathname === "/uni-level-activities" ? "active" : ""}
            onClick={() => handleNav("/uni-level-activities")}
          >
            <CalendarDays size={18} />
            <span>الفعاليات</span>
          </button>
          <button
            className={pathname === "/uni-level-activities/plans" ? "active" : ""}
            onClick={() => handleNav("/uni-level-activities/plans")}
          >
            <Users size={18} />
            <span>الخطط</span>
          </button>
          <button
            className={pathname === "/uni-level-activities/uni-level-faculty-events" ? "active" : ""}
            onClick={() => handleNav("/uni-level-activities/uni-level-faculty-events")}
          >
            <Bell size={18} />
            <span>فعاليات الكليات</span>
          </button>
        </nav>
      </aside>

      {isMobile && isOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
