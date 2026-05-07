/**
 * Type definitions for Families module
 */

export interface ProgramFamily {
  id: number;
  title: string;
  subtitle: string;
  place: string;
  views: string;
  createdAt?: string;
  description: string;
  image: string;
  type: string;
  memberStatus: string;
  memberRole?: string;
}

export interface ApiFamily {
  family_id: number;
  name: string;
  description: string;
  faculty_name: string;
  type: string;
  status: string;
  member_status: string;
  role?: string;
  member_count: number;
  joined_at?: string;
}

export type View = 'home' | 'requestDetails' | 'createForm' | 'trackRequest' | 'familyDetails';
