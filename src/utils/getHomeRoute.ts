export function getHomeRoute(path: string): string {

  // Super Admin
  if (path.startsWith("/SuperAdmin/Events")) return "/SuperAdmin/Events";
  if (path.startsWith("/SuperAdmin-family")) return "/SuperAdmin-family";
  if (path.startsWith("/CreateAdmins")) return "/CreateAdmins";
  if (path.startsWith("/ActivityLogs")) return "/ActivityLogs";
  if (path.startsWith("/students")) return "/SuperAdmin";
  if (path.startsWith("/admin/add-user")) return "/CreateAdmins";

  // University manager
  if (path.startsWith("/uni-level-family")) return "/uni-level-family";
  if (path.startsWith("/uni-level-activities")) return "/uni-level-activities";
  if (path.startsWith("/uni-level")) return "/uni-level";

  // Faculty manager
  if (path.startsWith("/Family-Faclevel")) return "/Family-Faclevel";
  if (path.startsWith("/Events-Faclevel")) return "/Events-Faclevel";
  if (path.startsWith("/FacultyReport")) return "/FacLevel";
  if (path.startsWith("/requests")) return "/FacLevel";
  if (path.startsWith("/FacLevel")) return "/FacLevel";

  // Student
  if (path.startsWith("/my-requests")) return "/Student/takafol";

  if (path.startsWith("/Student/MainPage")) return "/Student/MainPage";
  if (path.startsWith("/Student/Activities")) return "/Student/Activities";
  if (path.startsWith("/Student/Families")) return "/Student/Families";
  if (path.startsWith("/Student/StudentUnion")) return "/Student/StudentUnion";
  if (path.startsWith("/Student/manage")) return "/Student/manage";
  if (path.startsWith("/Student/profile")) return "/Student/profile";
  if (path.startsWith("/Student/takafol")) return "/Student/takafol";

  return "/";
}