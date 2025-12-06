"use client";
import Image from "next/image";
import "../styles/Header.css";
import logo from "../../assets/logo1.png";
import { useRouter } from "next/navigation";

export default function Header() {
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

      <div className="rightButtons">
        <button onClick={() => router.push("/uni-level")}>التكافل الاجتماعي</button>
        <button onClick={() => router.push("/uni-level-family")}>الأسر الطلابية</button>
        <button onClick={() => router.push("/activities")}>الأنشطة</button>

        {/* moved inside here 👇 */}
        <button className="logoutBtn" onClick={handleLogout}>
          تسجيل خروج
        </button>
      </div>
      </div>
    </header>
  );
}
