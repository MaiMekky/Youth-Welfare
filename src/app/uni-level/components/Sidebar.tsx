"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import "../styles/Sidebar.css";
import { Menu, X, FileText, BarChart3, User } from "lucide-react";
import Image from "next/image";
import logo from "../../assets/logo1.png";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
const [adminInfo, setAdminInfo] = useState({
    name: "",
    email: "",
    role: "",
  });

  useEffect(() => {
    // جلب البيانات من الـ localStorage
    const tokenData = localStorage.getItem("access"); // أو لو خزنتِ كامل الـ JSON في localStorage
    const userDataString = localStorage.getItem("user"); // لو خزنت الـ JSON كامل باسم userData
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);

        setAdminInfo({
          name: userData.name || "مدير النظام",
          email: userData.email || "admin@helwan.edu.eg",
          role: userData.role || "",
        });
      } catch (error) {
        console.error("فشل في قراءة بيانات المدير من localStorage", error);
      }
    }
  }, []);
  const handleReportsClick = () => {
    router.push("/uni-level/reports");
    setIsOpen(false);
  };

  const handleAllApplicationsClick = () => {
    router.push("/uni-level");
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const sidebar = document.getElementById("sidebar");
      if (isOpen && sidebar && !sidebar.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <>
      <button className="mobileMenuBtn" onClick={() => setIsOpen(true)}>
        <Menu size={24} />
      </button>

      <aside id="sidebar" className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>إدارة التكافل الاجتماعي</h2>
          <p>جامعة حلوان - قسم خدمات الطلاب</p>  
          <div className="headerIcon">
            <Image src={logo} alt="logo" className="headerLogo" width={50} height={50} />
          </div>
          <button className="closeBtn" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="profile-card">
          <div className="profile-icon">
            <User size={22} />
          </div>
         <div className="admin-info">
      <h3>{adminInfo.name}</h3>
      {adminInfo.role && <p>{adminInfo.role}</p>}
      {/* <p>{adminInfo.email}</p> */}
    </div>
        </div>
        <nav className="nav">
          <button
            className={pathname === "/uni-level/reports" ? "active" : ""}
            onClick={handleReportsClick}
          >
            <BarChart3 size={18} />
            <span>تقارير الكليات</span>
          </button>

          <button
            className={pathname === "/uni-level" ? "active" : ""}
            onClick={handleAllApplicationsClick}
          >
            <FileText size={18} />
            <span>إدارة الطلبات</span>
          </button>
        </nav>
      </aside>

      {isOpen && <div className="overlay" onClick={() => setIsOpen(false)} />}
    </>
  );
}
