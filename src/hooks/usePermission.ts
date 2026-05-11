import { useSession } from "next-auth/react";
import { hasPermission, Permission } from "@/lib/permissions";

export function usePermission() {
    const { data: session } = useSession();
    
    const check = (required: Permission) => {
        return hasPermission(session?.user?.permissions, required);
    };

    return {
        hasPermission: check,
        role: session?.user?.role,
        permissions: session?.user?.permissions,
        isSuperadmin: session?.user?.role === "superadmin" // Still useful for UI shortcuts
    };
}

