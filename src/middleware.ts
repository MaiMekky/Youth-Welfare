import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [

  // Super Admin
  "/SuperAdmin",
  "/SuperAdmin/Events",
  "/SuperAdmin-family",
  "/CreateAdmins",
  "/ActivityLogs",
  "/admin",
  "/admin/add-user",

  // University manager
  "/uni-level",
  "/uni-level-family",
  "/uni-level-activities",

  // Faculty manager
  "/FacLevel",
  "/Family-Faclevel",
  "/FacultyReport",
  "/requests",
  "/Events-Faclevel",

  // Faculty Head
  "/FacultyHead",

  // General Admin
  "/GeneralAdmin",

  // Student
  "/Student",
  "/Student/MainPage",
  "/Student/Activities",
  "/Student/Families",
  "/Student/StudentUnion",
  "/Student/manage",
  "/Student/profile",
  "/Student/takafol",

  "/my-requests",

  // super-admin only
  "/students",
];

const allowedByRoleKey: Record<string, Record<string, string[]>> = {
  admin: {
    super_admin: [
      "/SuperAdmin",
      "/SuperAdmin/Events",
      "/SuperAdmin-family",
      "/CreateAdmins",
      "/ActivityLogs",
      "/admin/add-user",
      "/students",
    ],
    uni_manager: [
      "/uni-level",
      "/uni-level-family",
      "/uni-level-activities",
    ],
    fac_manager: [
      "/FacLevel",
      "/Family-Faclevel",
      "/FacultyReport",
      "/requests",
      "/Events-Faclevel",
    ],
    fac_head: ["/FacultyHead"],
    General_admin: ["/GeneralAdmin"],
  },
 student: {
  "": [
    "/Student",
    "/Student/MainPage",
    "/Student/Activities",
    "/Student/Families",
    "/Student/StudentUnion",
    "/Student/manage",
    "/Student/profile",
    "/Student/takafol",
    "/my-requests",
  ],
},
};

const VALID_USER_TYPES  = new Set(["admin", "student"]);
const VALID_ADMIN_ROLES = new Set(["super_admin", "uni_manager", "fac_manager", "fac_head", "General_admin"]);

function noCache(res: NextResponse) {
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  return res;
}

function redirectTo(url: string, req: NextRequest) {
  if (new URL(url, req.url).pathname === req.nextUrl.pathname) {
    return noCache(NextResponse.next());
  }
  return noCache(NextResponse.redirect(new URL(url, req.url)));
}

function defaultRedirect(userType: string, roleKey: string): string {
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

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Skip static & API
  if (
    path.startsWith("/_next") ||
    path.startsWith("/api")   ||
    path === "/favicon.ico"   ||
    /\.(.*)$/.test(path)
  ) return NextResponse.next();

  // Read JS-set cookies only (HttpOnly tokens are validated by Django per-request)
  const userType = req.cookies.get("user_type")?.value || "";
  const roleKey  = req.cookies.get("roleKey")?.value   || "";

  // Decode in case they were encoded with encodeURIComponent
  // const userType = decodeURIComponent(rawUserType);
  // const roleKey  = decodeURIComponent(rawRoleKey);

  const isLoggedIn = VALID_USER_TYPES.has(userType) && (
    userType === "student" || VALID_ADMIN_ROLES.has(roleKey)
  );

  // Root: redirect logged-in users to their home
  if (path === "/") {
    const isLoggingOut = req.cookies.get("logging_out")?.value === "1";
    if (!isLoggingOut && isLoggedIn) {
      const dest = defaultRedirect(userType, roleKey);
      if (dest !== "/") return redirectTo(dest, req);
    }
    return NextResponse.next();
  }

  const isProtected = protectedRoutes.some(r => path.startsWith(r));
  if (!isProtected) return NextResponse.next();

  // Not logged in → home
  if (!isLoggedIn) return redirectTo("/", req);

  const rulesForUserType = allowedByRoleKey[userType];
  if (!rulesForUserType) return redirectTo("/", req);

  if (userType === "admin") {
    const allowed = rulesForUserType[roleKey] || [];
    if (!allowed.some(r => path.startsWith(r))) {
      return redirectTo(allowed[0] ?? defaultRedirect(userType, roleKey), req);
    }
  }

  if (userType === "student") {
    const allowed = rulesForUserType[""] || ["/Student"];
    if (!allowed.some(r => path.startsWith(r))) {
      return redirectTo("/Student", req);
    }
  }

  return noCache(NextResponse.next());
}

export const config = { matcher: ["/:path*"] };