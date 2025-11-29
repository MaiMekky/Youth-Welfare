"use client";
import React from "react";
import HeadPage from "./components/HeadPage";
import RequestDetails from "./components/RequestDetails";
import CreateFamForm from "./components/CreateFamForm";
import MainPage from "./components/MainPage";

export default function FamiliesPage() {
  return (
    <div>
      <HeadPage />
      {/* <CreateFamForm /> */}
      <MainPage />
    </div>
  );
}

