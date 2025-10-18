// app/student/components/StudentNavbar.tsx
import React from "react";
import "../styles/studentNavbar.css";

export default function StudentNavbar() {
  return (
    <nav className="student-navbar">
      <div className="navbar-right">
        <div className="navbar-logo">🎓 رعاية الشباب</div>
      </div>

      <ul className="navbar-links">
        <li><button className="nav-btn">الرئيسية</button></li>
        <li><button className="nav-btn">أنشطتي</button></li>
        <li><button className="nav-btn active">التكافل الاجتماعي</button></li>
        <li><button className="nav-btn">ملفي الشخصي</button></li>
      </ul>

      <div className="navbar-left">
        <button className="logout-btn">تسجيل خروج</button>
      </div>
    </nav>
  );
}