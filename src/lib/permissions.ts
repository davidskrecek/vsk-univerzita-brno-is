export type Permission = 
    | "users:view" 
    | "users:manage" 
    | "posts:write" 
    | "posts:full" 
    | "events:write" 
    | "events:full"
    | "sports:manage";

export type RolePermissions = Record<string, boolean>;

/**
 * Checks if a set of permissions allows a specific action.
 * Handles the "all" wildcard for superadmins.
 */
export function hasPermission(permissions: any, required: Permission): boolean {
    if (!permissions) return false;
    
    // Superadmin wildcard
    if (permissions["all"] === true) return true;
    
    // Direct check
    if (permissions[required] === true) return true;
    
    // Hierarchy checks (e.g., manage implies view)
    if (required.endsWith(":view")) {
        const entity = required.split(":")[0];
        if (permissions[`${entity}:manage`] === true) return true;
    }
    
    return false;
}

/**
 * Utility to check permissions from a NextAuth session object.
 */
export function sessionHasPermission(session: any, required: Permission): boolean {
    const permissions = session?.user?.permissions;
    return hasPermission(permissions, required);
}

