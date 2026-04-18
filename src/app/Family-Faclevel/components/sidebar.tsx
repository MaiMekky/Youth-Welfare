"use client";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import "@/app/Styles/Sidebar.css";
import {
  User,
  X,
  BarChart3,
  ClipboardList,
  PlusCircle,
  CalendarRange,
} from "lucide-react";
import Image from "next/image";
import logo from "@/app/assets/logo.png";

// ✅ Add this interface
interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: (v: boolean) => void;
}

export default function FacLevelSidebar({ isOpen = false, setIsOpen = () => {} }: SidebarProps) {
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
  }, [isOpen, setIsOpen]);

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };
    // Close on route change
    useEffect(() => { setIsOpen(false); }, [pathname, setIsOpen]);
  
    // ✅ NO <button className="mobileMenuBtn"> here — it's now in Header

  return (
    <>
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
          <h2 className="sidebar-title">إدارة الأسر الطلابية</h2>
          <p className="sidebar-subtitle">ادارة الأسر الطلابية لجامعة العاصمة</p>
          {isOpen && (
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
            <h3>{userData?.name || "المستخدم"}</h3>
            <p>{userData?.faculty_name || ""}</p>
          </div>
        </div>

        <nav className="nav">
          <button
            onClick={() => handleNavigation("/Family-Faclevel/events")}
            className={pathname === "/Family-Faclevel/events" ? "active" : ""}
          >
            <CalendarRange size={18} />
            <span>إدارة الفعاليات</span>
          </button>
          <button
            onClick={() => handleNavigation("/Family-Faclevel/families-reports")}
            className={pathname === "/Family-Faclevel/families-reports" ? "active" : ""}
          >
            <BarChart3 size={18} />
            <span>تقارير الأسر</span>
          </button>
          <button
            onClick={() => handleNavigation("/Family-Faclevel/families-requests")}
            className={pathname === "/Family-Faclevel/families-requests" ? "active" : ""}
          >
            <ClipboardList size={18} />
            <span>طلبات الأسر</span>
          </button>
          <button
            onClick={() => handleNavigation("/Family-Faclevel/environment-friends")}
            className={pathname === "/Family-Faclevel/environment-friends" ? "active" : ""}
          >
            <PlusCircle size={18} />
            <span>إنشاء أسرة أصدقاء البيئة</span>
          </button>
          <button
            onClick={() => handleNavigation("/Family-Faclevel/leaders")}
            className={pathname === "/Family-Faclevel/leaders" ? "active" : ""}
          >
            <User size={18} />
            <span>قادة الأسر</span>
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
