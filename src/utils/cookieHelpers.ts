export function getCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

export interface SessionMeta {
  user_type:    string;
  roleKey:      string;
  role:         string;
  name:         string;
  faculty_name: string;
  admin_id:     number | null;
  student_id:   number | null;
  departments:  { dept_id: number; dept_name: string }[];
  dept_ids:     number[];
}

export function getSessionMeta(): SessionMeta | null {
  try {
    const raw = getCookie("session_meta");
    if (!raw) return null;
    return JSON.parse(raw) as SessionMeta;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  const wipe = "path=/; max-age=0";
  document.cookie = `user_type=; ${wipe}`;
  document.cookie = `roleKey=; ${wipe}`;
  document.cookie = `session_meta=; ${wipe}`;
  // access + refresh HttpOnly cookies must be cleared by the backend on logout
}