/**
 * Standardized system roles.
 * Use these constants instead of hardcoded strings to avoid typos and logic desync.
 */

export const ROLES = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  SALES_MANAGER: 'SALES_MANAGER',
  INSTRUCTOR: 'INSTRUCTOR',
  SUPPORT: 'SUPPORT',
  STUDENT: 'STUDENT',
  TUTOR: 'TUTOR', // Added
} as const;

export type UserRole = keyof typeof ROLES;

/** Legacy aliases preserved for backward compatibility during transition */
export const LEGACY_ROLES = {
  Owner: 'OWNER',
  SalesManager: 'SALES_MANAGER',
  Instructor: 'INSTRUCTOR',
  Tutor: 'TUTOR', // Added
  Support: 'SUPPORT',
} as const;

/** All roles that can access any part of the admin panel */
export const ALL_ADMIN_ROLES = [
  ROLES.OWNER,
  ROLES.ADMIN,
  ROLES.SALES_MANAGER,
  ROLES.INSTRUCTOR,
  ROLES.SUPPORT,
  ROLES.TUTOR, // Added
  'Owner', 'SalesManager', 'Instructor', 'Support', 'Tutor', // legacy
];

/** Roles with full system access (Users, Audit Log, Settings) */
export const SYSTEM_ADMIN_ROLES = [ROLES.OWNER, ROLES.ADMIN, 'Owner'];

/** Roles specifically for tutor management */
export const TUTOR_MANAGER_ROLES = [ROLES.OWNER, ROLES.ADMIN, 'Owner'];

/** Roles for student/lead and payment management */
export const STUDENT_MANAGER_ROLES = [
  ROLES.OWNER,
  ROLES.ADMIN,
  ROLES.SALES_MANAGER,
  ROLES.SUPPORT,
  'Owner', 'SalesManager', 'Support',
];
