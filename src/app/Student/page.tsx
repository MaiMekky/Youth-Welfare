// app/student/page.tsx
import React from "react";
import StudentNavbar from "./components/StudentNavbar";
import HeaderCard from "./components/HeaderCard";
import Cards from "./components/Cards";

export default function StudentHome() {
  return (
    <>
      <StudentNavbar />
      <HeaderCard />
      <Cards />
     
    </>
  );
}