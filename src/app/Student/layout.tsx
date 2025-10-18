// app/student/layout.tsx
import React from "react";
import "./styles/studentNavbar.css";
import "./styles/headerCard.css";
import StudentNavbar from "./components/StudentNavbar";

export const metadata = {
  title: "التكافل الاجتماعي - صفحة الطلاب",
  description: "Student solidarity area",
};

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    
    <div className="student-app">
      {/* Navbar and header can be included here if you want them on every subpage */}
      <div className="student-content">{children}</div>
     
      
    </div>
  );
}