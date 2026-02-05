import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  "/SuperAdmin",
  "/uni-level",
  "/FacLevel",
  "/Student",
  "/ActivityLogs",
  "/CreateAdmins",
  "/admin/add-user",
  "/FacultyReport",
  "/uni-level/reports",
];

const allowedByRoleKey: { [userType: string]: { [roleKey: string]: string[] } } = {
  admin: {
    super_admin: ["/SuperAdmin", "/admin/add-user", "/CreateAdmins", "/ActivityLogs"],
    uni_manager: ["/uni-level", "/uni-level/reports", "/uni-level/details"],
    fac_manager: ["/FacLevel", "/requests", "/FacultyReport"],
  },
  student: {
    "": ["/Student", "/my-requests"],
  },
};

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // السماح للـ API و ملفات Next.js
  if (path.startsWith("/_next") || path.startsWith("/api") || path === "/favicon.ico") {
    return NextResponse.next();
  }

  const token = req.cookies.get("access")?.value;
  const roleKey = req.cookies.get("roleKey")?.value || "";
  const userType = req.cookies.get("user_type")?.value || "";

  const isProtected = protectedRoutes.some(route => path.startsWith(route));

  // لو محمي ومفيش توكن
  if (isProtected && !token) {
    const response = NextResponse.redirect(new URL("/", req.url));
    // منع الكاش لتجنب عرض الصفحة القديمة عند الضغط على back
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    return response;
  }

  if (!isProtected || !userType) return NextResponse.next();

  const rulesForUserType = allowedByRoleKey[userType];
  if (!rulesForUserType) return NextResponse.next();

  if (userType === "admin") {
    const allowedRoutes = rulesForUserType[roleKey] || [];
    const isAllowed = allowedRoutes.some(route => path.startsWith(route));
    if (!isAllowed) {
      const response = NextResponse.redirect(new URL(allowedRoutes[0] || "/", req.url));
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      response.headers.set("Pragma", "no-cache");
      response.headers.set("Expires", "0");
      return response;
    }
  }

  if (userType === "student") {
    const allowedRoutes = rulesForUserType[""] || ["/Student"];
    const isAllowed = allowedRoutes.some(route => path.startsWith(route));
    if (!isAllowed) {
      const response = NextResponse.redirect(new URL(allowedRoutes[0], req.url));
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      response.headers.set("Pragma", "no-cache");
      response.headers.set("Expires", "0");
      return response;
    }
  }

  const response = NextResponse.next();
  if (isProtected) {
    // منع الكاش للصفحات المحمية
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }

  return response;
}

export const config = {
  matcher: ["/:path*"],
};