"use client";

import React from "react";

// Global Header & Footer
import Header from "@/app/FacLevel/components/Header";
import Footer from "@/app/FacLevel/components/Footer";

// Your original component
import FriendsForm from "../environment-friends/components/friends";

export default function Page() {
  return (
    <div>
      <Header />

      <FriendsForm />

      <Footer />
    </div>
  );
}
