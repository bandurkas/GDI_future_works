"use client";
import { useState } from "react";
import { Role } from "@/hooks/usePermissions";
import { Search, Filter, UserPlus, MoreVertical, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export function UserTable({ initialUsers }: { initialUsers: any[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    
    // Filter logic
    const filteredUsers = initialUsers.filter((u) => {
        const matchesName = u.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesEmail = u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
        return (matchesName || matchesEmail) && matchesRole;
    });

    const formatRole = (r: string) => {
        return r.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    };

    return (
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between bg-gray-50/50">
                <div className="flex gap-4 flex-1">
                    <div className="relative max-w-md w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-800 transition-all"
                        />
                    </div>
                    <div className="relative min-w-[150px]">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-800 appearance-none cursor-pointer"
                        >
                            <option value="ALL">All Roles</option>
                            <option value="Owner">Super Admin</option>
                            <option value="Sales Manager">Account Manager</option>
                            <option value="Instructor">Video Manager</option>
                            <option value="Support">Viewer</option>
                        </select>
                    </div>
                </div>
                
                <Link
                    href="/admin/users/invite"
                    className="flex items-center gap-2 bg-[#1A1A1A] text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-black transition-colors"
                >
                    <UserPlus className="h-4 w-4" />
                    Invite User
                </Link>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50/50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Last Login</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                    No users found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {user.avatarUrl ? (
                                                <img src={user.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover border border-gray-200" />
                                            ) : (
                                                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-semibold border border-gray-200">
                                                    {user.name?.charAt(0) || user.email.charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-semibold text-gray-900">{user.name || 'No Name'}</div>
                                                <div className="text-gray-500 text-xs mt-0.5">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border
                                            ${user.role === 'Owner' ? 'bg-purple-50 text-purple-700 border-purple-100' : 
                                              user.role === 'Sales Manager' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                                              user.role === 'Instructor' ? 'bg-orange-50 text-orange-700 border-orange-100' : 
                                              'bg-gray-50 text-gray-700 border-gray-200'}`}
                                        >
                                            {user.role === 'Owner' && <ShieldAlert className="w-3 h-3" />}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border
                                            ${user.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {user.lastLogin ? format(new Date(user.lastLogin), "MMM d, yyyy • h:mm a") : 'Never'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/admin/users/${user.id}`}
                                            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                                        >
                                            Edit User
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
