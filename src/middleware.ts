import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * =========================
 * Protected route prefixes (based on your src/app structure)
 * =========================
 */
const protectedRoutes = [
  // Super Admin
  "/SuperAdmin",
  "/SuperAdmin-family",
  "/SuperAdmin-family/details",
  "/CreateAdmins",
  "/ActivityLogs",
  "/admin",
  "/admin/add-user",

  // University manager
  "/uni-level",
  "/uni-level/details",
  "/uni-level/reports",
  "/uni-level-family",
  "/uni-level-family/details",
  "/uni-level-family/add-central-family",

  // Faculty manager
  "/FacLevel",
  "/Family-Faclevel",
  "/Family-Faclevel/environment-friends",
  "/Family-Faclevel/events",
  "/Family-Faclevel/leaders",
  "/Family-Faclevel/families-requests",
  "/Family-Faclevel/families-reports",
  "/FacultyReport",
  "/requests",

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

/**
 * =========================
 * Permissions
 * =========================
 * Confirmed by you:
 * - /my-requests => student
 * - /students => super_admin
 * - /requests => fac_manager
 * - uni_manager is NOT allowed to access /students or /requests
 */
const allowedByRoleKey: Record<string, Record<string, string[]>> = {
  admin: {
    super_admin: [
      "/SuperAdmin",
      "/SuperAdmin-family",
      "/CreateAdmins",
      "/ActivityLogs",
      "/admin/add-user",
      "/students",
    ],

    uni_manager: ["/uni-level", "/uni-level-family"],

    fac_manager: ["/FacLevel", "/Family-Faclevel", "/FacultyReport", "/requests"],
  },

  student: {
    "": ["/Student", "/my-requests"],
  },
};

const VALID_USER_TYPES = new Set(["admin", "student"]);
const VALID_ADMIN_ROLE_KEYS = new Set(["super_admin", "uni_manager", "fac_manager"]);

function noCache(res: NextResponse) {
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
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
    return "/";
  }
  if (userType === "student") return "/Student";
  return "/";
}

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // =========================
  // Allow Next internals + API + static files
  // =========================
  const isStaticFile = /\.(.*)$/.test(path);
  if (
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path === "/favicon.ico" ||
    isStaticFile
  ) {
    return NextResponse.next();
  }

  const isProtected = protectedRoutes.some((route) => path.startsWith(route));
  if (!isProtected) return NextResponse.next();

  // =========================
  // Protected => must have token + valid user_type
  // =========================
  const token = req.cookies.get("access")?.value;
  const userType = req.cookies.get("user_type")?.value || "";
  const roleKey = req.cookies.get("roleKey")?.value || "";

  // 1) No token => kick out
  if (!token) return redirectTo("/", req);

  // 2) Invalid user_type => kick out (strong)
  if (!VALID_USER_TYPES.has(userType)) return redirectTo("/", req);

  // 3) Admin must have valid roleKey
  if (userType === "admin" && !VALID_ADMIN_ROLE_KEYS.has(roleKey)) {
    return redirectTo("/", req);
  }

  // 4) Student: we don't require roleKey, but permissions are fixed
  const rulesForUserType = allowedByRoleKey[userType];
  if (!rulesForUserType) return redirectTo("/", req);

  // =========================
  // Authorization
  // =========================
  if (userType === "admin") {
    const allowedRoutes = rulesForUserType[roleKey] || [];
    const isAllowed = allowedRoutes.some((route) => path.startsWith(route));

    if (!isAllowed) {
      const fallback = allowedRoutes[0] || defaultRedirect(userType, roleKey);
      return redirectTo(fallback, req);
    }
  }

  if (userType === "student") {
    const allowedRoutes = rulesForUserType[""] || ["/Student"];
    const isAllowed = allowedRoutes.some((route) => path.startsWith(route));

    if (!isAllowed) {
      const fallback = allowedRoutes[0] || defaultRedirect(userType, roleKey);
      return redirectTo(fallback, req);
    }
  }

  // =========================
  // OK => pass + no-cache
  // =========================
  return noCache(NextResponse.next());
}

export const config = {
  matcher: ["/:path*"],
};
