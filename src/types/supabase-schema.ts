/**
 * Future Supabase Schema Compatibility Types
 * Clean TypeScript interface contracts matching future Supabase PostgreSQL tables.
 * NOTE: These are interface definitions only. No database migrations run in Sprint 5.
 */

export interface SupabaseProfileRow {
  id: string; // uuid primary key (references auth.users.id)
  user_code: string; // unique permanent student/professor code (e.g. G6001)
  display_name: string;
  avatar_url?: string;
  avatar_visual_id?: string;
  hero_class_id?: string;
  status: 'ACTIVE' | 'DISABLED' | 'EXPIRED';
  created_at: string;
  updated_at: string;
  last_sign_in_at?: string;
}

export interface SupabaseRoleRow {
  id: string; // 'LEARNER' | 'PROFESSOR' | 'ADMIN' | 'REVIEWER_DEV'
  name: string;
  description: string;
  created_at: string;
}

export interface SupabasePermissionRow {
  id: string; // e.g. 'VIEW_OWN_PROGRESS', 'CREATE_ARENA'
  description: string;
}

export interface SupabaseRolePermissionRow {
  role_id: string;
  permission_id: string;
}

export interface SupabaseMembershipRow {
  id: string;
  user_id: string;
  organization_id: string;
  role_id: string;
  created_at: string;
}

export interface SupabaseClassroomEnrollmentRow {
  id: string;
  classroom_id: string;
  student_user_id: string;
  academic_year: string;
  grade_level: string;
  enrolled_at: string;
}
