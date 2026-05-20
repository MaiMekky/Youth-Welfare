"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getHomeRoute } from "@/utils/getHomeRoute";

export default function RouteTracker() {

  const pathname = usePathname();
  
  useEffect(() => {
    const ignored = ["/"];
    if (!ignored.includes(pathname)) {
      // Store the real current path, not the mapped home route
      document.cookie = `lastRoute=${encodeURIComponent(pathname)}; path=/; max-age=604800; SameSite=Lax`;
    }
  }, [pathname]);

  return null;
}