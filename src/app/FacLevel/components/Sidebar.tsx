"use client";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import "@/app/Styles/Sidebar.css";
import { FileText, BarChart3, User, Menu, X } from "lucide-react";
import Image from "next/image";
import logo from "@/app/assets/logo.png";

export default function Sidebar() {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [userData, setUserData] = useState<{ name?: string; faculty_name?: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch {}
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const sidebar = document.getElementById("sidebar");
      const menuBtn = document.querySelector(".mobileMenuBtn");
      if (
        isOpen &&
        sidebar &&
        !sidebar.contains(e.target as Node) &&
        menuBtn &&
        !(menuBtn as HTMLElement).contains(e.target as Node)
      ) {
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

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsOpen(false);
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
                  alt="شعار جامعة العاصمة"
                  className="sidebar-logo"
                  width={96}
                  height={96}
                  priority
                />
              </div>
            </div>
          </div>
          <h2 className="sidebar-title">إدارة التكافل الاجتماعي</h2>
          <p className="sidebar-subtitle">جامعة العاصمة - قسم خدمات الطلاب</p>
          <button
            className="sidebar-close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="إغلاق القائمة"
          >
            <X size={20} />
          </button>
        </div>

        <div className="profile-card">
          <div className="profile-icon">
            <User size={22} />
          </div>
          <div className="admin-info">
            <h3>{userData?.name || "المستخدم"}</h3>
            <p>{userData?.faculty_name || ""}</p>
          </div>
        </div>

        <nav className="nav">
          <button
            onClick={() => handleNavigation("/FacultyReport")}
            className={pathname === "/FacultyReport" ? "active" : ""}
          >
            <BarChart3 size={18} />
            <span>تقرير الكلية</span>
          </button>
          <button
            onClick={() => handleNavigation("/FacLevel")}
            className={pathname === "/FacLevel" ? "active" : ""}
          >
            <FileText size={18} />
            <span>إدارة الطلبات</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <span>الإصدار 1.0.0 | النظام نشط</span>
        </div>
      </aside>

      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
