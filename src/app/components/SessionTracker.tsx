"use client";

import { useEffect } from "react";

export default function SessionTracker() {

  useEffect(() => {

    // mark when this tab started
    sessionStorage.setItem("tabOpenedAt", Date.now().toString());

  }, []);

  return null;
}