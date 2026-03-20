"use client";
import { useSession } from "next-auth/react";

export type Role = "Owner" | "Sales Manager" | "Instructor" | "Support";

export type PermissionKey =
    | "view_all_enrollments"
    | "view_assigned_enrollments"
    | "manage_enrollments"
    | "view_all_dashboards"
    | "view_assigned_dashboards"
    | "manage_video"
    | "view_customers"
    | "create_users"
    | "edit_users"
    | "assign_roles"
    | "delete_users"
    | "view_logs";

export function usePermissions() {
    const { data: session } = useSession();
    
    const userRole = ((session?.user as any)?.role || "Support") as Role;
    const permissionsMap = (session?.user as any)?.permissions || {};

    const can = (permission: PermissionKey): boolean => {
        // 1. Super Admin absolute bypass
        if (userRole === "Owner") return true;

        // 2. Explicit Database Overrides via user_permissions table
        if (permissionsMap[permission] !== undefined) {
             return permissionsMap[permission] === true;
        }
        
        // 3. Base Role Defaults (derived from Permissions Matrix)
        if (userRole === "Sales Manager") {
            const base: PermissionKey[] = [
                "view_assigned_enrollments",
                "manage_enrollments",
                "view_assigned_dashboards",
                "view_customers"
            ];
            return base.includes(permission);
        }

        if (userRole === "Instructor") {
            const base: PermissionKey[] = [
                "view_assigned_dashboards",
                "manage_video"
            ];
            return base.includes(permission);
        }

        if (userRole === "Support") {
            const base: PermissionKey[] = ["view_assigned_dashboards"];
            return base.includes(permission);
        }

        return false;
    };

    return { role: userRole, can };
}
