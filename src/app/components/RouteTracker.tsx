"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function RouteTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const ignored = ["/"];

    if (!ignored.includes(pathname)) {
      localStorage.setItem("lastRoute", pathname);

      // also store in cookie for middleware
      document.cookie = `lastRoute=${pathname}; path=/; max-age=604800; SameSite=Lax`;
    }
  }, [pathname]);

  return null;
}