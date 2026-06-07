import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ── All protected route prefixes ──────────────────────────────────────────────
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
  "/uni-level-scouts",

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

// ── Static role → allowed routes (for non-dept roles) ────────────────────────
const staticAllowedByRole: Record<string, string[]> = {
  super_admin: [
    "/SuperAdmin",
    "/SuperAdmin/Events",
    "/SuperAdmin-family",
    "/CreateAdmins",
    "/ActivityLogs",
    "/admin/add-user",
    "/students",
  ],
  fac_head: ["/FacultyHead"],
  General_admin: ["/GeneralAdmin"],
};

// ── Department → route groups for fac_manager ─────────────────────────────────
// Each dept_id maps to ALL routes that manager is allowed to access.
// Base routes (/FacLevel, /FacultyReport) are always included for any dept.
// Any dept_id not listed here (> 7 or unknown) falls back to FAC_FALLBACK_ROUTES.
const FAC_DEPT_ROUTES: Record<number, string[]> = {
  6: ["/FacLevel", "/FacultyReport", "/requests"],                                        // تكافل
  4: ["/Family-Faclevel/Home"],       // أسر
  1: ["/Events-Faclevel/Home"],       // ثقافي
  2: ["/Events-Faclevel/Home"],       // اجتماعي
  3: ["/Events-Faclevel/Home"],       // رياضي
  5: ["/Events-Faclevel/Home"],        // علمي
  7: ["/Events-Faclevel/Home"],        // جوالة
};
// Fallback for any dept_id > 7 or unknown → treated as an events dept
const FAC_FALLBACK_ROUTES = ["/Events-Faclevel/Home"];

// ── Department → route groups for uni_manager ─────────────────────────────────
// Any dept_id not listed here (> 7 or unknown) falls back to UNI_FALLBACK_ROUTES.
const UNI_DEPT_ROUTES: Record<number, string[]> = {
  6: ["/uni-level"],                                          // تكافل
  4: ["/uni-level-family"],                     // أسر
  1: ["/uni-level-activities/Home"],                 // ثقافي
  2: ["/uni-level-activities/Home"],                 // اجتماعي
  3: ["/uni-level-activities/Home"],                 // رياضي
  5: ["/uni-level-activities/Home"],                 // علمي
  7: ["/uni-level-activities/Home","/uni-level-scouts"],                     // جوالة
};
// Fallback for any dept_id > 7 or unknown → treated as an activities dept
const UNI_FALLBACK_ROUTES = ["/uni-level-activities/Home"];

// ── Student routes ────────────────────────────────────────────────────────────
const STUDENT_ROUTES = [
  "/Student",
  "/Student/MainPage",
  "/Student/Activities",
  "/Student/Families",
  "/Student/StudentUnion",
  "/Student/manage",
  "/Student/profile",
  "/Student/takafol",
  "/my-requests",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Strict prefix match: the path must equal the route exactly
 * OR continue with a "/" after it.
 *
 * Why: plain `startsWith` lets "/uni-level" match "/uni-level-activities"
 * because the hyphen is not a path separator. This helper requires the
 * next character (if any) to be "/" so siblings never bleed into each other.
 *
 * Examples:
 *   routeMatches("/uni-level", "/uni-level")            → true  ✅
 *   routeMatches("/uni-level", "/uni-level/reports")    → true  ✅
 *   routeMatches("/uni-level", "/uni-level-activities") → false ✅
 */
function routeMatches(allowedRoute: string, path: string): boolean {
  if (!path.startsWith(allowedRoute)) return false;
  const next = path[allowedRoute.length];
  return next === undefined || next === "/";
}

/**
 * Union of all routes allowed for a given set of dept_ids from a dept-route map.
 * If a dept_id has no entry in the map (unknown / future ID), the fallback
 * routes are used instead — so IDs > 7 are treated as activities/events depts.
 */
function getAllowedRoutesForDepts(
  deptIds: number[],
  map: Record<number, string[]>,
  fallback: string[] = []
): string[] {
  const set = new Set<string>();
  for (const id of deptIds) {
    const routes = map[id] ?? fallback;
    for (const route of routes) set.add(route);
  }
  return [...set];
}

/** Resolve allowed routes for an admin based on roleKey + deptIds. */
function getAdminAllowedRoutes(roleKey: string, deptIds: number[]): string[] {
  if (roleKey === "fac_manager") {
    return getAllowedRoutesForDepts(deptIds, FAC_DEPT_ROUTES, FAC_FALLBACK_ROUTES);
  }
  if (roleKey === "uni_manager") {
    return getAllowedRoutesForDepts(deptIds, UNI_DEPT_ROUTES, UNI_FALLBACK_ROUTES);
  }
  return staticAllowedByRole[roleKey] ?? [];
}

/** Default landing page per role. */
function defaultRedirect(userType: string, roleKey: string, deptIds: number[]): string {
  if (userType === "student") return "/Student";
  if (userType === "admin") {
    if (roleKey === "super_admin")   return "/CreateAdmins";
    if (roleKey === "fac_head")      return "/FacultyHead";
    if (roleKey === "General_admin") return "/GeneralAdmin";
    if (roleKey === "fac_manager") {
      const routes = getAllowedRoutesForDepts(deptIds, FAC_DEPT_ROUTES, FAC_FALLBACK_ROUTES);
      return routes[0] ?? "/";
    }
    if (roleKey === "uni_manager") {
      const routes = getAllowedRoutesForDepts(deptIds, UNI_DEPT_ROUTES, UNI_FALLBACK_ROUTES);
      return routes[0] ?? "/";
    }
  }
  return "/";
}

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

// ── Middleware ────────────────────────────────────────────────────────────────
export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Skip static & API routes
  if (
    path.startsWith("/_next") ||
    path.startsWith("/api")   ||
    path === "/favicon.ico"   ||
    /\.(.*)$/.test(path)
  ) return NextResponse.next();

  // Read cookies set by the client (non-HttpOnly)
  const userType    = req.cookies.get("user_type")?.value || "";
  const roleKey     = req.cookies.get("roleKey")?.value   || "";
  const deptIdsRaw  = req.cookies.get("dept_ids")?.value  || "";

  // Parse dept_ids: "1,4,6" → [1, 4, 6]
  const deptIds: number[] = deptIdsRaw
    ? deptIdsRaw.split(",").map(Number).filter((n) => !isNaN(n) && n > 0)
    : [];

  const isLoggedIn =
    VALID_USER_TYPES.has(userType) &&
    (userType === "student" || VALID_ADMIN_ROLES.has(roleKey));

  // ── Root: redirect logged-in users to their home ──────────────────────────
  if (path === "/") {
    const isLoggingOut = req.cookies.get("logging_out")?.value === "1";
    if (!isLoggingOut && isLoggedIn) {
      const lastRoute = req.cookies.get("lastRoute")?.value;
      const dest = lastRoute
        ? decodeURIComponent(lastRoute)
        : defaultRedirect(userType, roleKey, deptIds);
      if (dest !== "/") return redirectTo(dest, req);
    }
    return NextResponse.next();
  }

  // ── Not a protected route → pass through ─────────────────────────────────
  const isProtected = protectedRoutes.some((r) => routeMatches(r, path));
  if (!isProtected) return NextResponse.next();

  // ── Not logged in → home ──────────────────────────────────────────────────
  if (!isLoggedIn) return redirectTo("/", req);

  // ── Admin route guard ─────────────────────────────────────────────────────
  if (userType === "admin") {
    const allowed = getAdminAllowedRoutes(roleKey, deptIds);

    if (allowed.length === 0) {
      // No routes resolved (e.g. no dept_ids stored yet) → send to root
      return redirectTo("/", req);
    }

    if (!allowed.some((r) => routeMatches(r, path))) {
      // Trying to access an unauthorized route → bounce to first allowed
      return redirectTo(allowed[0], req);
    }
  }

  // ── Student route guard ───────────────────────────────────────────────────
  if (userType === "student") {
    if (!STUDENT_ROUTES.some((r) => routeMatches(r, path))) {
      return redirectTo("/Student", req);
    }
  }

  return noCache(NextResponse.next());
}

export const config = { matcher: ["/:path*"] };