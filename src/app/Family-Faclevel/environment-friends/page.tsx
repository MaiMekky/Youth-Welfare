"use client";

import React from "react";

// Global Footer
import Footer from "@/app/FacLevel/components/Footer";

// Your original component
import FriendsForm from "../environment-friends/components/friends";

export default function Page() {
  return (
    <div>

      <FriendsForm />

      <Footer />
    </div>
  );
}
