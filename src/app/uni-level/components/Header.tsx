"use client";
import Image from "next/image";
import "../styles/Header.css";
import logo from "../../assets/logo1.png";
import { useRouter } from "next/navigation";

export default function Header() {

  // 🔥 هنا call hook بشكل صحيح
  const router = useRouter();

  const handleLogout = () => {
    // إزالة التوكن من التخزين المحلي
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    // إعادة التوجيه لصفحة تسجيل الدخول
    router.push("/");
  };

  return (
    <header className="header">
      <div className="headerContent">
        <div className="headerLeft">

          <div className="headerTitle">
            <h1 className="headerTitleH1">إدارة التكافل الاجتماعي</h1>
            <p className="headerTitleP">جامعة حلوان - قسم خدمات الطلاب</p>
          </div>
        </div>

        <button className="logoutBtn" onClick={handleLogout}>
          تسجيل خروج
        </button>
      </div>
    </header>
  );
}
