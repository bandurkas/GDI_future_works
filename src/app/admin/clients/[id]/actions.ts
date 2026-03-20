"use server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function assignAccountManager(prevState: any, formData: FormData) {
    const session = await auth();
    const role = (session?.user as any)?.role;
    const permissions = (session?.user as any)?.permissions || {};

    // Only super_admin or users with specific assign_roles override can do this
    if (role !== "Owner" && !permissions["assign_roles"] && role !== 'Admin') {
        return { error: "Unauthorized. You do not have permission to assign Account Managers." };
    }

    const clientId = formData.get("client_id") as string;
    const managerId = formData.get("manager_id") as string;

    if (!clientId) {
        return { error: "Missing Client identifier." };
    }

    try {
        await prisma.client.update({
            where: { id: clientId },
            data: { 
                account_manager_id: managerId === "unassigned" ? null : managerId 
            }
        });

        revalidatePath(`/admin/clients`);
        revalidatePath(`/admin/clients/${clientId}`);

        return { success: true, message: "Account Manager assigned successfully." };
    } catch (e: any) {
        console.error("Assign Account Manager Error:", e);
        return { error: "Failed to allocate the Account Manager in the database." };
    }
}
