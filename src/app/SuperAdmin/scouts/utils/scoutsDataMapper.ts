/**
 * Data mapping utilities for Scouts integration
 * Maps backend data structures to frontend expectations
 */

// ============================================
// Role Constants (from backend models.py)
// ============================================
export const SCOUT_ROLES = {
  // Clan Level Roles
  CLAN_LEADER: 'قائد العشيرة',
  ASSISTANT_MALE: 'مساعد قائد',
  ASSISTANT_FEMALE: 'مساعدة قائد',
  HEAD_ROVER: 'رائد أكبر',
  SECRETARY: 'سكرتير',
  EQUIPMENT_MANAGER: 'مسؤول عهدة',
  VETERAN: 'قائد السواعد',
  
  // Group Level Roles
  GROUP_LEADER_MALE: 'رائد رهط',
  GROUP_LEADER_FEMALE: 'رائدة رهط',
  GROUP_ASSISTANT_MALE: 'مساعد رائد',
  GROUP_ASSISTANT_FEMALE: 'مساعدة رائد',
  
  // Member
  MEMBER: 'عضو',
} as const;

export const CLAN_LEVEL_ROLES = [
  SCOUT_ROLES.CLAN_LEADER,
  SCOUT_ROLES.ASSISTANT_MALE,
  SCOUT_ROLES.ASSISTANT_FEMALE,
  SCOUT_ROLES.HEAD_ROVER,
  SCOUT_ROLES.SECRETARY,
  SCOUT_ROLES.EQUIPMENT_MANAGER,
  SCOUT_ROLES.VETERAN,
];

export const GROUP_LEVEL_ROLES = [
  SCOUT_ROLES.GROUP_LEADER_MALE,
  SCOUT_ROLES.GROUP_LEADER_FEMALE,
  SCOUT_ROLES.GROUP_ASSISTANT_MALE,
  SCOUT_ROLES.GROUP_ASSISTANT_FEMALE,
];

export const ALL_ROLES = [...CLAN_LEVEL_ROLES, ...GROUP_LEVEL_ROLES, SCOUT_ROLES.MEMBER];

// ============================================
// Status Constants
// ============================================
export const SCOUT_STATUS = {
  PENDING: 'منتظر',
  ACCEPTED: 'مقبول',
  REJECTED: 'مرفوض',
} as const;

export const CLAN_STATUS = {
  ACTIVE: 'نشط',
  INACTIVE: 'غير نشط',
} as const;

// ============================================
// Type Definitions
// ============================================
export type BackendClan = {
  clan_id: number;
  name: string;
  description?: string;
  faculty: number;
  faculty_name: string;
  status: string;
  min_members: number;
  members_count: number;
  accepted_count: number;
  pending_count: number;
  groups_count: number;
  is_structure_complete: boolean;
  created_at: string;
};

export type BackendMember = {
  scout_member_id: number;
  student: number;
  student_name: string;
  student_email: string;
  student_gender: string;
  student_phone: string;
  clan: number;
  group: number | null;
  group_name: string | null;
  role: string;
  status: string;
  joined_at: string;
  created_at: string;
};

export type BackendGroup = {
  group_id: number;
  name: string;
  clan: number;
  display_order: number;
  members_count: number;
  created_at: string;
};

export type BackendClanDetail = {
  clan_id: number;
  name: string;
  description: string;
  faculty: number;
  faculty_name: string;
  status: string;
  min_members: number;
  members_count: number;
  groups: BackendGroup[];
  structure: {
    clan_level: Record<string, any>;
    group_level: Record<string, any>;
  };
  created_at: string;
};

export type BackendStats = {
  total_members: number;
  accepted_count: number;
  pending_count: number;
  rejected_count: number;
  groups_count: number;
  unassigned_count: number;
};

// ============================================
// Response Extractors
// ============================================

/**
 * Extract data from backend success response
 * Backend format: { success: true, message: "...", data: {...} }
 */
export function extractResponseData<T>(response: any): T {
  if (response?.success && response?.data !== undefined) {
    return response.data as T;
  }
  // Fallback for direct data
  return response as T;
}

/**
 * Extract clans list from backend response
 */
export function extractClansList(response: any): {
  clans: BackendClan[];
  summary: any;
} {
  const data = extractResponseData<{ clans: BackendClan[]; summary: any }>(response);
  return {
    clans: data.clans || [],
    summary: data.summary || {},
  };
}

/**
 * Extract clan detail from backend response
 */
export function extractClanDetail(response: any): {
  clan: BackendClanDetail;
  stats: BackendStats;
  structure: any;
} {
  const data = extractResponseData<{
    clan: BackendClanDetail;
    stats: BackendStats;
    structure: any;
  }>(response);
  
  return {
    clan: data.clan,
    stats: data.stats,
    structure: data.structure,
  };
}

/**
 * Extract members list from backend response
 */
export function extractMembersList(response: any): BackendMember[] {
  const data = extractResponseData<BackendMember[]>(response);
  return Array.isArray(data) ? data : [];
}

/**
 * Extract groups list from backend response
 */
export function extractGroupsList(response: any): BackendGroup[] {
  const data = extractResponseData<BackendGroup[]>(response);
  return Array.isArray(data) ? data : [];
}

// ============================================
// Data Mappers
// ============================================

/**
 * Map backend member to frontend format
 */
export function mapMemberToFrontend(member: BackendMember) {
  return {
    member_id: member.scout_member_id,
    user_id: member.student,
    name: member.student_name,
    email: member.student_email,
    gender: member.student_gender,
    phone: member.student_phone,
    role: member.role,
    status: member.status,
    group_id: member.group,
    group_name: member.group_name,
    joined_at: member.joined_at,
    created_at: member.created_at,
  };
}

/**
 * Map backend clan to frontend format
 */
export function mapClanToFrontend(clan: BackendClan) {
  return {
    clan_id: clan.clan_id,
    name: clan.name,
    description: clan.description || '',
    faculty: clan.faculty,
    faculty_name: clan.faculty_name,
    status: clan.status,
    min_members: clan.min_members,
    members_count: clan.members_count,
    accepted_count: clan.accepted_count,
    pending_count: clan.pending_count,
    groups_count: clan.groups_count,
    is_structure_complete: clan.is_structure_complete,
    created_at: clan.created_at,
  };
}

/**
 * Map backend group to frontend format
 */
export function mapGroupToFrontend(group: BackendGroup) {
  return {
    group_id: group.group_id,
    name: group.name,
    clan: group.clan,
    display_order: group.display_order,
    members_count: group.members_count,
    created_at: group.created_at,
  };
}

// ============================================
// Status Helpers
// ============================================

/**
 * Get status badge text in Arabic
 */
export function getStatusText(status: string): string {
  switch (status) {
    case SCOUT_STATUS.ACCEPTED:
      return 'مقبول';
    case SCOUT_STATUS.PENDING:
      return 'معلق';
    case SCOUT_STATUS.REJECTED:
      return 'مرفوض';
    default:
      return status;
  }
}

/**
 * Get clan status text
 */
export function getClanStatusText(status: string): string {
  return status === CLAN_STATUS.ACTIVE ? 'نشط' : 'غير نشط';
}

/**
 * Check if status is accepted
 */
export function isAccepted(status: string): boolean {
  return status === SCOUT_STATUS.ACCEPTED;
}

/**
 * Check if status is pending
 */
export function isPending(status: string): boolean {
  return status === SCOUT_STATUS.PENDING;
}

/**
 * Check if clan is active
 */
export function isClanActive(status: string): boolean {
  return status === CLAN_STATUS.ACTIVE;
}

// ============================================
// API Helpers
// ============================================

/**
 * Build query string from params
 */
export function buildQueryString(params: Record<string, any>): string {
  const filtered = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  
  return filtered ? `?${filtered}` : '';
}

/**
 * Build API URL with query params
 */
export function buildApiUrl(baseUrl: string, endpoint: string, params?: Record<string, any>): string {
  const queryString = params ? buildQueryString(params) : '';
  return `${baseUrl}${endpoint}${queryString}`;
}
