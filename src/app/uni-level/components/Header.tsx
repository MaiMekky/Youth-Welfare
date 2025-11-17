"use client";
import Image from "next/image";
import "../styles/Header.css";
import logo from "../../assets/logo1.png";

export default function Header() {
  return (
    <header className="header">
      <div className="headerContent">
        <div className="headerLeft">
         
          <div className="headerTitle">
            <h1 className="headerTitleH1">إدارة التكافل الاجتماعي</h1>
            <p className="headerTitleP">جامعة حلوان - قسم خدمات الطلاب</p>
          </div>
        </div>
      </div>
    </header>
  );
}
