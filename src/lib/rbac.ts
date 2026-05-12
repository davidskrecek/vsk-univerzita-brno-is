import { AppSession, AuthError } from "@/lib/session";
import { sessionHasPermission, Permission } from "./permissions";

export function requirePermission(session: AppSession, permission: Permission) {
  if (!sessionHasPermission(session, permission)) {
    throw new AuthError(403, `Forbidden: missing permission ${permission}`);
  }
}

export function requireSportScope(session: AppSession, sportId: number) {
  if (sessionHasPermission(session, "sports:manage")) return; // Global managers can manage any sport
  if (!session.user.managedSportIds.includes(sportId)) {
    throw new AuthError(403, "Forbidden: sport scope mismatch");
  }
}

