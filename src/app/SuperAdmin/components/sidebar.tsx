"use client";
import React from "react";
import styles from "../Styles/sidebar.module.css";
import Image from "next/image";
import Logo from "../../assets/logo1.png";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname(); // current route

  const menuItems = [
    { label: "صلاحيات الوصول", href: "/CreateAdmins" },
    { label: "سجلات النشاط", href: "/ActivityLogs" },
    { label: "إدارة الفعاليات", href: "#" },
    { label: "إحصائيات الزوار", href: "#" },
    { label: "التكافل الاجتماعي", href: "/SuperAdmin" },
    { label: "الاسر الطلابية", href: "/SuperAdmin-family" },
  ];

  return (
    <aside className={styles.saSidebar}>
      <div className={styles.profileSection}>
        <div className={styles.profileAvatar}>
          <Image
            src={Logo}
            alt="Logo"
            width={60}
            height={60}
            className={styles.logoImage}
          />
        </div>
        <div className={styles.profileInfo}>
          <h3>مشرف النظام</h3>
          <p style={{ textAlign: "center" }}>نظام إدارة الفعاليات</p>
        </div>
      </div>

      <nav className={styles.sidebarMenu}>
        {menuItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className={`${styles.menuItem} ${
              pathname === item.href ? styles.active : ""
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
