"use server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function inviteUser(prevState: any, formData: FormData) {
    // 1. Strictly verify the session is a Super Admin
    const session = await auth();
    if (!session || (session.user as any)?.role !== "Owner") {
        return { error: "Unauthorized access. Only super administrators can invite users." };
    }

    // 2. Extract FormData
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const role = formData.get("role") as string;

    if (!name || !email || !role) {
        return { error: "Missing required fields. Please fill out the entire form." };
    }

    try {
        // 3. Upsert the User
        // If the user already logged in via Dashboard once, they exist but as 'Support'.
        // Upserting upgrades their scope seamlessly.
        await prisma.appUser.upsert({
            where: { email: email.toLowerCase() },
            update: {
                role,
            },
            create: {
                email: email.toLowerCase(),
                name,
                role,
                is_active: true
            }
        });

        // 4. Force UI cache refresh to show new user immediately
        revalidatePath("/admin/users");
        
        return { success: true, message: `Successfully provisioned ${email} as ${role}.` };

    } catch (e: any) {
        console.error("Invite User Error:", e);
        return { error: "Failed to allocate the user in the database due to an internal error." };
    }
}
