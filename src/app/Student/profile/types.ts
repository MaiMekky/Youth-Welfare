// API Response Interface
export interface StudentProfileAPIResponse {
  student_id: number;
  name: string;
  email: string;
  faculty: number;
  gender: string;
  nid: string;
  uid: string;
  phone_number: string;
  address: string;
  acd_year: string;
  grade: string;
  major: string;
  profile_photo_url: string;
}

// UI Interface (mapped from API)
export interface StudentProfile {
  student_id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  nid: string;
  uid: string;
  address: string;
  acd_year: string;
  grade: string;
  major: string;
  faculty: number;
  facultyName?: string;
  profilePicture: string;
}

// Update Profile Request
export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  faculty?: number;
  gender?: string;
  phone_number?: string;
  address?: string;
  acd_year?: string;
  grade?: string;
  major?: string;
  profile_photo?: File;
}

