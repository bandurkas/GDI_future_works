"use server";
import { PrismaClient } from "@prisma/client";
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
    const is_active = formData.get("is_active") === "true";

    if (!userId || !role) {
        return { error: "Missing required fields." };
    }

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Update core AppUser config
            await tx.appUser.update({
                where: { id: userId },
                data: { role, is_active }
            });

            // 2. Clear all existing boolean overrides to avoid dangling permissions
            await tx.userPermission.deleteMany({
                where: { user_id: userId }
            });

            // 3. Process new boolean overrides
            // All checkboxes pass their name as a key and "on" as the value
            const inserts: { user_id: string; permission_key: string; granted: boolean }[] = [];
            
            for (const [key, value] of formData.entries()) {
                if (key.startsWith("perm_") && value === "on") {
                    inserts.push({
                        user_id: userId,
                        permission_key: key.replace("perm_", ""),
                        granted: true
                    });
                }
            }

            if (inserts.length > 0) {
                await tx.userPermission.createMany({
                    data: inserts
                });
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
