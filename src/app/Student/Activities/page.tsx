"use client";

import React from "react";
import Events from "./Events";
import StaticCard from "./StaticCard";

export default function ActivitiesPage() {
  return (
    <div style={{ backgroundColor: "#F3F5FD" }}>
      <StaticCard />
      <Events />
    </div>
  );
}
