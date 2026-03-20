"use server";
import { PrismaClient, UserRole } from "@prisma/client";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function updateUserPermissions(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "Owner") {
        return { error: "Unauthorized access." };
    }

    const userId = formData.get("user_id") as string;
    const role = formData.get("role") as string;
    const isActive = formData.get("isActive") === "true";

    if (!userId || !role) {
        return { error: "Missing required fields." };
    }

    try {
        const permissions: Record<string, boolean> = {};
        for (const [key, value] of formData.entries()) {
            if (key.startsWith("perm_") && value === "on") {
                permissions[key.replace("perm_", "")] = true;
            }
        }

        await prisma.user.update({
            where: { id: userId },
            data: { 
                role: role as UserRole, 
                isActive,
                permissions: permissions
            }
        });

        revalidatePath(`/admin/users`);
        revalidatePath(`/admin/users/${userId}`);
        
        return { success: true, message: "User permissions explicitly updated." };

    } catch (e: any) {
        console.error("Update Permissions Error:", e);
        return { error: "Failed to persist granular RBAC settings to the database." };
    }
}
