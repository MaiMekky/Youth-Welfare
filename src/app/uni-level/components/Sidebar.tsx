"use client";
import React from "react";
import { useRouter } from "next/navigation";
import "../styles/Sidebar.css";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const router = useRouter();

  const handleAllApplicationsClick = () => {
    router.push("/uni-level");
    if (onClose) onClose();
  };

  const handleReportsClick = () => {
    router.push("/uni-level/reports");
    if (onClose) onClose();
  };

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <div className="sidebar-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
            <line x1="8" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="8" y1="16" x2="12" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="sidebar-title">النظام الإداري</h1>
        <p className="sidebar-subtitle">إدارة التكافل الاجتماعي</p>
      </div>

      <nav className="sidebar-nav">
        <h2 className="nav-section-title">القوائم الرئيسية</h2>

        <button className="nav-button nav-button-primary" onClick={handleAllApplicationsClick}>
          <span className="button-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div className="button-text">
            <span className="button-title">كل الطلبات</span>
            <span className="button-subtitle">إدارة طلبات الطلاب</span>
          </div>
        </button>

        <button className="nav-button nav-button-secondary" onClick={handleReportsClick}>
          <span className="button-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 17V11M12 17V7M15 17V13M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V19C19 20.1046 18.1046 21 17 21Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div className="button-text">
            <span className="button-title">تقارير الكليات</span>
            <span className="button-subtitle">تقارير الكليات والميزانيات</span>
          </div>
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="admin-info">
          <div className="admin-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
              <path d="M6 21C6 17.6863 8.68629 15 12 15C15.3137 15 18 17.6863 18 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="admin-details">
            <span className="admin-label">مدير النظام</span>
            <span className="admin-email">admin@helwan.edu.eg</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
