export const decodeToken = (token: string): Record<string, any> | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const decoded = JSON.parse(atob(parts[1]));
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const getFacultyIdFromToken = (): number | null => {
  const token = localStorage.getItem('access');
  if (!token) return null;

  const decoded = decodeToken(token);
  if (!decoded) return null;

  return decoded.faculty_id || decoded.faculty || null;
};

export const getStudentIdFromToken = (): number | null => {
  const token = localStorage.getItem('access');
  if (!token) return null;

  const decoded = decodeToken(token);
  if (!decoded) return null;

  return decoded.user_id || decoded.student_id || decoded.id || null;
};
