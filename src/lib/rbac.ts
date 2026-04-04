import { AppSession, AuthError } from "@/lib/session";

export function requireRole(session: AppSession, ...roles: string[]) {
  if (!roles.includes(session.user.role)) {
    throw new AuthError(403, "Forbidden");
  }
}

export function requireSportScope(session: AppSession, sportId: number) {
  if (session.user.role === "superadmin") return;
  if (!session.user.managedSportIds.includes(sportId)) {
    throw new AuthError(403, "Forbidden: sport scope mismatch");
  }
}
