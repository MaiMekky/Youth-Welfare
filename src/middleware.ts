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

    fac_head: [
      "/FacultyHead",
    ],

    General_admin: [
      "/GeneralAdmin",
    ],
  },

  student: {
    "": [
      "/Student",
      "/Student/Activities",
      "/my-requests",
    ],
  },
};

const VALID_USER_TYPES = new Set(["admin", "student"]);

const VALID_ADMIN_ROLE_KEYS = new Set([
  "super_admin",
  "uni_manager",
  "fac_manager",
  "fac_head",
  "General_admin",
]);

function noCache(res: NextResponse) {
  res.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  return res;
}

function redirectTo(resUrl: string, req: NextRequest) {
  return noCache(NextResponse.redirect(new URL(resUrl, req.url)));
}

function defaultRedirect(userType: string, roleKey: string) {

  if (userType === "admin") {

    if (roleKey === "super_admin") return "/SuperAdmin";

    if (roleKey === "uni_manager") return "/uni-level";

    if (roleKey === "fac_manager") return "/FacLevel";

    if (roleKey === "fac_head") return "/FacultyHead";

    if (roleKey === "General_admin") return "/GeneralAdmin";

    return "/";
  }

  if (userType === "student") return "/Student";

  return "/";
}

export function middleware(req: NextRequest) {

  const path = req.nextUrl.pathname;

  const isStaticFile = /\.(.*)$/.test(path);

  if (
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path === "/favicon.ico" ||
    isStaticFile
  ) {
    return NextResponse.next();
  }

  const isProtected = protectedRoutes.some((route) =>
    path.startsWith(route)
  );

  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get("access")?.value;
  const userType = req.cookies.get("user_type")?.value || "";
  const roleKey = req.cookies.get("roleKey")?.value || "";

  if (!token) return redirectTo("/", req);

  if (!VALID_USER_TYPES.has(userType)) return redirectTo("/", req);

  if (userType === "admin" && !VALID_ADMIN_ROLE_KEYS.has(roleKey)) {
    return redirectTo("/", req);
  }

  const rulesForUserType = allowedByRoleKey[userType];

  if (!rulesForUserType) return redirectTo("/", req);

  if (userType === "admin") {

    const allowedRoutes = rulesForUserType[roleKey] || [];

    const isAllowed = allowedRoutes.some((route) =>
      path.startsWith(route)
    );

    if (!isAllowed) {

      const fallback =
        allowedRoutes[0] || defaultRedirect(userType, roleKey);

      return redirectTo(fallback, req);
    }
  }

  if (userType === "student") {

    const allowedRoutes = rulesForUserType[""] || ["/Student"];

    const isAllowed = allowedRoutes.some((route) =>
      path.startsWith(route)
    );

    if (!isAllowed) {

      const fallback =
        allowedRoutes[0] || defaultRedirect(userType, roleKey);

      return redirectTo(fallback, req);
    }
  }

  return noCache(NextResponse.next());
}

export const config = {
  matcher: ["/:path*"],
};