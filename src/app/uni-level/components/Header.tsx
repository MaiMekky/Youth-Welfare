"use client";
import Image from "next/image";
import "../styles/Header.css";
import logo from "../../assets/logo1.png";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Header() {
  const router = useRouter();
  const [open,setOpen] = useState(false);

 const handleLogout = () => {
 
  localStorage.clear();

  const isProd = process.env.NODE_ENV === "production";
  const cookieEnd = `path=/; max-age=0; SameSite=Lax${isProd ? "; Secure" : ""}`;
 
  document.cookie = `access=; ${cookieEnd}`;
  document.cookie = `refresh=; ${cookieEnd}`;
  document.cookie = `user_type=; ${cookieEnd}`;
  document.cookie = `roleKey=; ${cookieEnd}`;
  document.cookie = `role=; ${cookieEnd}`;

  window.location.replace("/");
};


  return (
    <header className="header">
      <div className="headerContent">

        <div className="headerLeft">
          <div className="headerTitle">
            <h1 className="headerTitleH1">النظام الاداري</h1>
            <p className="headerTitleP">إدارة التكافل الاجتماعي</p>
          </div>
        </div>

        {/* ✅ Hamburger */}
        <button
          className={`hamburgerBtn ${open ? "active" : ""}`}
          onClick={()=>setOpen(!open)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`rightButtons ${open ? "open" : ""}`}>
          <button onClick={() => router.push("/uni-level")}>التكافل الاجتماعي</button>
          <button onClick={() => router.push("/uni-level-family")}>الأسر الطلابية</button>
          <button onClick={() => router.push("/uni-level-activities")}>الأنشطة</button>
          <button className="logoutBtn" onClick={handleLogout}>
            تسجيل خروج
          </button>
        </div>

      </div>
    </header>
  );
}
