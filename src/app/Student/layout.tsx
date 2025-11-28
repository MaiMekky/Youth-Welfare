// app/student/layout.tsx
import React from "react";
import "./styles/studentNavbar.css";
import "./styles/headerCard.css";
import StudentNavbar from "./components/StudentNavbar";
import StudentFooter from "./components/StudentFooter";

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
      <StudentNavbar />
      <div className="student-content">{children}</div>
      <StudentFooter />
    </div>
  );
}