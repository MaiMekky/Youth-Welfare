import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  "/ActivityLogs",
  "/admin",
  "/CreateAdmins",
  "/FacultyReport",
  "/my-requests",
  "/requests",
  "/Student",
  "/students",
  "/SuperAdmin",
  "/uni-level",
  "/FacLevel",
];

export function middleware(req: NextRequest) {
  const token = req.cookies.get("access")?.value;

  const path = req.nextUrl.pathname;

  // check if route is protected
  const isProtected = protectedRoutes.some((route) =>
    path.startsWith(route)
  );

  if (isProtected && !token) {
    const loginUrl = new URL("/", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// apply middleware to all routes
export const config = {
  matcher: [
    "/:path*", // runs on everything
  ],
};
