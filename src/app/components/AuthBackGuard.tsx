"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const PROTECTED = [
  "/SuperAdmin",
  "/SuperAdmin/Events",

  "/SuperAdmin-family",
  "/CreateAdmins",
  "/ActivityLogs",
  "/admin",

  "/uni-level",
  "/uni-level-family",
  "/uni-level-activities",

  "/FacLevel",
  "/Family-Faclevel",
  "/FacultyReport",
  "/Events-Faclevel",

  "/GeneralAdmin",
  "/FacultyHead",

  "/Student",
  "/Student/Activities",

  "/students",
  "/requests",
  "/my-requests",
];
function getCookie(name: string): string {
  return document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${name}=`))
    ?.split("=")[1] ?? "";
}

function hasAccess() {
  return !!getCookie("user_type");
}

function isLoggingOut(): boolean {
  return getCookie("logging_out") === "1";
}

function getDashboard(): string {
  const userType = getCookie("user_type");
  const roleKey  = getCookie("roleKey");
  if (userType === "student") return "/Student";
  if (userType === "admin") {
    if (roleKey === "super_admin")   return "/CreateAdmins";
    if (roleKey === "uni_manager")   return "/uni-level";
    if (roleKey === "fac_manager")   return "/FacLevel";
    if (roleKey === "fac_head")      return "/FacultyHead";
    if (roleKey === "General_admin") return "/GeneralAdmin";
  }
  return "/";
}

function runCheck(pathname: string) {
  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isRoot = pathname === "/";

  if (isProtected && !hasAccess()) {
    window.location.replace("/");
    return;
  }

  if (isRoot && hasAccess() && !isLoggingOut()) {
    window.location.replace(getDashboard());
  }
}

export default function AuthBackGuard() {
  const pathname = usePathname();

  useEffect(() => {
    runCheck(pathname);
  }, [pathname]);

  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) runCheck(window.location.pathname);
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  return null;
}