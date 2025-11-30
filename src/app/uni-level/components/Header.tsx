"use client";
import Image from "next/image";
import "../styles/Header.css";
import logo from "../../assets/logo1.png";
import { useRouter } from "next/navigation";

export default function Header() {

  // 🔥 هنا call hook بشكل صحيح
  const router = useRouter();

  const handleLogout = () => {
   localStorage.clear();
  document.cookie = "access=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "refresh=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "user_type=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "roleKey=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "role=; path=/; max-age=0; SameSite=Lax";
  router.replace("/"); 
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

        <button className="logoutBtn" onClick={handleLogout}>
          تسجيل خروج
        </button>
      </div>
    </header>
  );
}
