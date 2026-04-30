import { getSessionMeta } from "./cookieHelpers";

export const getFacultyIdFromToken = (): number | null => {
  // faculty_id is not stored in session_meta; kept for compatibility — returns null
  return null;
};

export const getStudentIdFromToken = (): number | null => {
  return getSessionMeta()?.student_id ?? null;
};
