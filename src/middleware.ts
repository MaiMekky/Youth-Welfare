import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  "/SuperAdmin",
  "/uni-level",
  "/FacLevel",
  "/Student",
];

const allowedByRoleKey: { [userType: string]: { [roleKey: string]: string[] } } = {
  admin: {
    super_admin: ["/SuperAdmin"],
    uni_manager: ["/uni-level"],
    fac_manager: ["/FacLevel"],
  },
  student: {
    "": ["/Student"],
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
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (!isProtected || !userType) return NextResponse.next();

  const rulesForUserType = allowedByRoleKey[userType];
  if (!rulesForUserType) return NextResponse.next();

  if (userType === "admin") {
    const allowedRoutes = rulesForUserType[roleKey] || [];
    if (!allowedRoutes.includes(path)) {
      return NextResponse.redirect(new URL(allowedRoutes[0] || "/", req.url));
    }
  }

  if (userType === "student") {
    const allowedRoutes = rulesForUserType[""] || ["/Student"];
    if (!allowedRoutes.includes(path)) {
      return NextResponse.redirect(new URL(allowedRoutes[0], req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
