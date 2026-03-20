import { PrismaClient } from "@prisma/client";
import { UserTable } from "./UserTable";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export default async function UsersPage() {
    // Zero-trust Server-Side Verification
    const session = await auth();
    const role = (session?.user as any)?.role;
    
    if (!session || role !== "Owner") {
         redirect("/admin?error=unauthorized");
    }

    // Fetch all System Users
    const users = await prisma.user.findMany({
        orderBy: {
           createdAt: 'desc'
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
