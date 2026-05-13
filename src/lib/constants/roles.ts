export enum UserRole {
  SUPERADMIN = "superadmin",
  SPORT_MANAGER = "sport_manager",
  EDITOR = "editor",
}

export const isEditorialRole = (role?: string | null): boolean => {
  if (!role) return false;
  return [UserRole.SUPERADMIN, UserRole.SPORT_MANAGER, UserRole.EDITOR].includes(role as UserRole);
};

export const isSuperAdminRole = (role?: string | null): boolean => role === UserRole.SUPERADMIN;

