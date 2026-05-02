"use client";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import "@/app/Styles/Sidebar.css";
import { CalendarDays, Users, X, User, Home, Tent , FolderTree, GitBranch  } from "lucide-react";
import Image from "next/image";
import logo from "@/app/assets/logo.png";
import { getSessionMeta } from "@/utils/cookieHelpers";

interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: (v: boolean) => void;
}

interface Dept {
  dept_id: number;
  dept_name: string;
}

export default function Sidebar({ isOpen = false, setIsOpen = () => {} }: SidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();

  const [userData, setUserData] = useState<{ name?: string; faculty_name?: string } | null>(null);
  const [isScout, setIsScout]   = useState(false);

  useEffect(() => {
    const meta = getSessionMeta();
    if (!meta) return;

    setUserData({ name: meta.name, faculty_name: meta.faculty_name });

    // Check if dept_id 7 exists in the departments array from session_meta
    const depts: Dept[] = meta.departments ?? [];
    setIsScout(depts.some((d) => d.dept_id === 7));
  }, []);

  // Close on outside click
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
  }, [isOpen, setIsOpen]);

  // Close on route change
  useEffect(() => { setIsOpen(false); }, [pathname, setIsOpen]);

  const go = (path: string) => { router.push(path); setIsOpen(false); };

  return (
    <>
      <aside id="sidebar" className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo-container">
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
          <h2 className="sidebar-title">إدارة الفعاليات</h2>
          <p className="sidebar-subtitle">نظام إدارة الفعاليات لجامعة العاصمة</p>
          <button
            className="sidebar-close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="إغلاق القائمة"
          >
            <X size={20} />
          </button>
        </div>

        <div className="profile-card">
          <div className="profile-icon"><User size={22} /></div>
          <div className="admin-info">
            <h3>{userData?.name || "المستخدم"}</h3>
            <p>{userData?.faculty_name || ""}</p>
          </div>
        </div>

        <nav className="nav">

          {/* ── Always visible ───────────────────────────────────── */}
          <button
            onClick={() => go("/Events-Faclevel/Home")}
            className={pathname === "/Events-Faclevel/Home" ? "active" : ""}
          >
            <Home size={18} /><span>الرئيسية</span>
          </button>

          <button
            onClick={() => go("/Events-Faclevel")}
            className={pathname === "/Events-Faclevel" ? "active" : ""}
          >
            <CalendarDays size={18} /><span>إدارة الفعاليات</span>
          </button>

          <button
            onClick={() => go("/Events-Faclevel/plans")}
            className={pathname === "/Events-Faclevel/plans" ? "active" : ""}
          >
            <Users size={18} /><span>خطط الكلية</span>
          </button>

          {/* ── Scout dept (dept_id === 7) only ─────────────────── */}
          {isScout && (
            <>
              <button
                onClick={() => go("/Events-Faclevel/scout")}
                className={pathname === "/Events-Faclevel/scout" ? "active" : ""}
              >
                <Tent size={18} /><span>الجوالة</span>
              </button>

              <button
                onClick={() => go("/Events-Faclevel/members")}
                className={pathname === "/Events-Faclevel/members" ? "active" : ""}
              >
                <Users size={18} /><span>الاعضاء</span>
              </button>

              <button
                onClick={() => go("/Events-Faclevel/groups")}
                className={pathname === "/Events-Faclevel/groups" ? "active" : ""}
              >
                <FolderTree size={18} /><span>الرهوط</span>
              </button>

              <button
                onClick={() => go("/Events-Faclevel/structure")}
                className={pathname === "/Events-Faclevel/structure" ? "active" : ""}
              >
                <GitBranch size={18} /><span>الهيكل التنظيمي</span>
              </button>
            </>
          )}

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