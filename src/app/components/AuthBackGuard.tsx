"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const PROTECTED = [
  "/SuperAdmin",
  "/SuperAdmin-family",
  "/CreateAdmins",
  "/ActivityLogs",
  "/admin",
  "/uni-level",
  "/uni-level-family",
  "/FacLevel",
  "/Family-Faclevel",
  "/FacultyReport",
  "/Student",
  "/students",
  "/requests",
  "/my-requests",
];

function hasAccess() {
  return document.cookie.split("; ").some(c => c.startsWith("access="));
}

export default function AuthBackGuard() {
  const pathname = usePathname();

  useEffect(() => {
    const isProtected = PROTECTED.some(p => pathname.startsWith(p));

    const check = () => {
      if (isProtected && !hasAccess()) {
        window.location.replace("/");
      }
    };

    check();

    // 🔥 لما الصفحة ترجع من cache بعد Back
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) check();
    };

    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [pathname]);

  return null;
}
