"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import "@/app/uni-level/styles/Sidebar.css";
import { Menu, X, User, Users, CalendarDays, Bell } from "lucide-react";
import Image from "next/image";
import logo from "../../assets/logo1.png";

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

  // Detect mobile screen
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Load admin info
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

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const sidebar = document.getElementById("sidebar");
      if (isOpen && sidebar && !sidebar.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleNav = (path: string) => {
    router.push(path);
    if (isMobile) setIsOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      {isMobile && (
        <button className="mobileMenuBtn" onClick={() => setIsOpen(true)}>
          <Menu size={24} />
        </button>
      )}

      <aside id="sidebar" className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>إدارة الفعاليات</h2>
          <p>جامعة حلوان - قسم خدمات الطلاب</p>

          <div className="headerIcon">
            <Image
              src={logo}
              alt="logo"
              className="headerLogo"
              width={50}
              height={50}
            />
          </div>

          {isMobile && (
            <button className="closeBtn" onClick={() => setIsOpen(false)}>
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
        <div className="overlay" onClick={() => setIsOpen(false)} />
      )}
    </>
  );
}
