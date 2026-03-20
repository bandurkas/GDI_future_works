import { PrismaClient } from "@prisma/client";
import { UserEditForm } from "./UserEditForm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const prisma = new PrismaClient();

export default async function UserEditPage({ params }: { params: { id: string } }) {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "Owner") {
         redirect("/admin?error=unauthorized");
    }

    const user = await prisma.appUser.findUnique({
        where: { id: params.id },
        include: {
           permissions: true,
        }
    });

    if (!user) {
        redirect("/admin/users?error=not_found");
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <Link 
                href="/admin/users" 
                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-800 mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back to Directory
            </Link>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                <div className="mb-6 pb-6 border-b border-gray-100">
                    <h1 className="text-2xl font-bold text-gray-900">Configure Identity: {user.name}</h1>
                    <p className="text-gray-500 mt-1">
                        Bound to Google via <span className="font-semibold text-gray-700">{user.email}</span>
                    </p>
                </div>

                <UserEditForm targetUser={user} />
            </div>
        </div>
    );
}
