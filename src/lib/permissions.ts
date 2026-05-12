export type Permission = 
    | "users:view" 
    | "users:manage" 
    | "posts:write" 
    | "posts:full" 
    | "events:write" 
    | "events:full"
    | "sports:manage";

export type RolePermissions = Record<string, boolean>;

export function hasPermission(permissions: RolePermissions | null | undefined, required: Permission): boolean {
    if (!permissions) return false;
    
    if (permissions["all"] === true) return true;
    
    if (permissions[required] === true) return true;
    
    if (required.endsWith(":view")) {
        const entity = required.split(":")[0];
        if (permissions[`${entity}:manage`] === true) return true;
    }
    
    return false;
}

export function sessionHasPermission(session: { user?: { permissions?: Record<string, boolean> } } | null | undefined, required: Permission): boolean {
    const permissions = session?.user?.permissions;
    return hasPermission(permissions, required);
}

