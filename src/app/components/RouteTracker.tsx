"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getHomeRoute } from "@/utils/getHomeRoute";

export default function RouteTracker() {

  const pathname = usePathname();

  useEffect(() => {

    const ignored = ["/"];

    if (!ignored.includes(pathname)) {

      const homeRoute = getHomeRoute(pathname);

      localStorage.setItem("lastRoute", homeRoute);

      document.cookie = `lastRoute=${homeRoute}; path=/; max-age=604800; SameSite=Lax`;
    }

  }, [pathname]);

  return null;
}