// "use client";
// import "../styles/Header.css";
// import { useState } from "react";

// export default function Header({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
//   return (
//     <header className="header">
//       <div className="header-content">
//         {/* Mobile Sidebar Toggle */}
//         <button className="menu-toggle" onClick={onToggleSidebar}>
//           ☰
//         </button>

//         {/* Logo Section */}
//         <div className="logo">
//           <div className="logo-icon">🏠</div>
//         </div>

//         {/* Title Section */}
//         <div className="header-title">
//           <h1>إدارة التكافل الاجتماعي</h1>
//           <p>جامعة حلوان</p>
//         </div>
//       </div>
//     </header>
//   );
// }
"use client";

import Image from "next/image";
import "../styles/Header.css";
import logo from "../../assets/logo1.png"; // ✅ correct import path (adjust based on your folder structure)

export default function Header({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  return (
    <header className="header">
      <div className="header-inner flex items-center justify-between px-4 py-2">
        {/* Sidebar toggle (mobile) */}
        <div className="flex items-center gap-4">
          <button className="menu-toggle" onClick={onToggleSidebar}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="menu-icon w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>

          {/* ✅ University logo and text */}
          <div className="logo-container flex items-center gap-3">
            <Image src={logo} alt="Logo" className="logo-img" />
            <div className="logo-text text-right">
              <h1 className="text-xl font-bold">جامعة حلوان</h1>
              <p className="text-sm text-gray-600">إدارة التكافل الاجتماعي</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
