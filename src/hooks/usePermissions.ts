"use client";
import { useSession } from "next-auth/react";

export type Role =
  | "OWNER" | "Owner"               // legacy alias
  | "ADMIN"
  | "SALES_MANAGER" | "SalesManager" // legacy alias
  | "INSTRUCTOR"   | "Instructor"    // legacy alias
  | "SUPPORT"      | "Support"       // legacy alias
  | "TUTOR"
  | "STUDENT";

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

    const userRole = ((session?.user as any)?.role || "SUPPORT") as Role;
    const permissionsMap = (session?.user as any)?.permissions || {};

    const isOwner = userRole === "OWNER" || userRole === "Owner";
    const isAdmin = isOwner || userRole === "ADMIN";

    const can = (permission: PermissionKey): boolean => {
        if (isOwner) return true;

        if (permissionsMap[permission] !== undefined) {
            return permissionsMap[permission] === true;
        }

        if (userRole === "SALES_MANAGER" || userRole === "SalesManager") {
            const base: PermissionKey[] = [
                "view_assigned_enrollments",
                "manage_enrollments",
                "view_assigned_dashboards",
                "view_customers",
            ];
            return base.includes(permission);
        }

        if (userRole === "INSTRUCTOR" || userRole === "Instructor") {
            const base: PermissionKey[] = [
                "view_assigned_dashboards",
                "manage_video",
            ];
            return base.includes(permission);
        }

        if (userRole === "SUPPORT" || userRole === "Support") {
            const base: PermissionKey[] = ["view_assigned_dashboards"];
            return base.includes(permission);
        }

        return false;
    };

    return { role: userRole, isAdmin, isOwner, can };
}
