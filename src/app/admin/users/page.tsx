import { PrismaClient } from "@prisma/client";
import { UserTable } from "./UserTable";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export default async function UsersPage() {
    // Zero-trust Server-Side Verification
    const session = await auth();
    const role = (session?.user as any)?.role;
    
    if (!session || role !== "Owner") {
         redirect("/admin?error=unauthorized");
    }

    // Fetch all System Users and their boolean overrides
    const users = await prisma.appUser.findMany({
        include: {
           permissions: true,
        },
        orderBy: {
           created_at: 'desc'
        }
    });

    return (
        <div className="p-6 max-w-[1400px] mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                   <h1 className="text-3xl font-bold text-gray-900 tracking-tight">System Users</h1>
                   <p className="text-gray-500 mt-1">Manage RBAC roles, invites, and granular staff permissions.</p>
                </div>
            </div>
            
            {/* Client Component mounting Interactive Table */}
            <UserTable initialUsers={users} />
        </div>
    );
}
