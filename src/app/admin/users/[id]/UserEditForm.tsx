"use client";
import { useState } from "react";
import { updateUserPermissions } from "./actions";
import { Loader2, Save, UserX, UserCheck } from "lucide-react";
import { PermissionKey } from "@/hooks/usePermissions";

const ALL_PERMISSIONS: { key: PermissionKey; label: string; desc: string }[] = [
    { key: "view_all_enrollments", label: "View All Enrollments", desc: "Read-only access to every enrollment globally." },
    { key: "view_assigned_enrollments", label: "View Assigned Enrollments", desc: "Access limited strictly to managed clients." },
    { key: "manage_enrollments", label: "Manage Enrollments", desc: "Can edit, update, or refund enrollments." },
    { key: "view_all_dashboards", label: "View All Dashboards", desc: "Unrestricted visibility to all CRM dashboard metrics." },
    { key: "view_assigned_dashboards", label: "View Assigned Dashboards", desc: "Read-only reporting restricted to their pipeline." },
    { key: "manage_video", label: "Manage Video Content", desc: "Can upload, delete, or rename course videos." },
    { key: "view_customers", label: "View Customer Directory", desc: "Access the global client list and PII." },
    { key: "create_users", label: "Create Users", desc: "Can invite external or internal staff." },
    { key: "edit_users", label: "Edit Users", desc: "Can modify user profiles (excluding roles)." },
    { key: "assign_roles", label: "Assign Roles & Permissions", desc: "Can escalate or de-escalate privileges." },
    { key: "delete_users", label: "Delete Users", desc: "Can deactivate or permanently remove staff." },
    { key: "view_logs", label: "View System Logs", desc: "Access to webhook logs, errors, and audit footprints." },
];

export function UserEditForm({ targetUser }: { targetUser: any }) {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");
    const [isActive, setIsActive] = useState(targetUser.is_active);

    const handleSubmit = async (formData: FormData) => {
        setStatus("loading");
        
        formData.append("user_id", targetUser.id);
        formData.append("is_active", String(isActive));
        
        const res = await updateUserPermissions(null, formData);

        if (res.error) {
            setStatus("error");
            setMessage(res.error);
        } else if (res.success) {
            setStatus("success");
            setMessage(res.message);
            
            setTimeout(() => setStatus("idle"), 3000);
        }
    };

    return (
        <form action={handleSubmit} className="space-y-8">
            {status === "success" && (
                <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-sm font-medium border border-emerald-100">
                    {message}
                </div>
            )}
            
            {status === "error" && (
                <div className="p-4 rounded-xl bg-red-50 text-red-800 text-sm font-medium border border-red-100">
                    {message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* General Settings */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Account Configuration</h3>
                    
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-1.5">Primary Role Level</label>
                        <select
                            name="role"
                            defaultValue={targetUser.role}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-800 transition-all font-medium text-gray-900 appearance-none cursor-pointer"
                        >
                            <option value="Owner">Super Administrator</option>
                            <option value="Sales Manager">Account Manager</option>
                            <option value="Instructor">Video Manager</option>
                            <option value="Support">Viewer (Read-only)</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-2">
                            The primary role defines the default permissions. Overrides below are explicit grants that bypass these defaults.
                        </p>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <label className="block text-sm font-semibold text-gray-800 mb-3">System Access</label>
                        <button
                            type="button"
                            onClick={() => setIsActive(!isActive)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors border
                                ${isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'}
                            `}
                        >
                            {isActive ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                            {isActive ? 'Account Active (Click to Suspend)' : 'Account Suspended (Click to Reactivate)'}
                        </button>
                    </div>
                </div>

                {/* Granular Overrides */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Explicit Overrides</h3>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {ALL_PERMISSIONS.map(perm => {
                            const isGranted = targetUser.permissions?.some((p: any) => p.permission_key === perm.key && p.granted);
                            
                            return (
                                <label key={perm.key} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer group">
                                    <div className="relative flex items-center pt-0.5">
                                        <input
                                            type="checkbox"
                                            name={`perm_${perm.key}`}
                                            defaultChecked={isGranted}
                                            className="peer w-4 h-4 border-gray-300 rounded text-black focus:ring-black/20"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-semibold text-gray-900">{perm.label}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">{perm.desc}</div>
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="pt-8 border-t border-gray-100 flex justify-end">
                <button
                    type="submit"
                    disabled={status === "loading"}
                    className="flex items-center gap-2 bg-[#1A1A1A] hover:bg-black text-white px-8 py-2.5 rounded-xl font-medium shadow-sm transition-all disabled:opacity-70"
                >
                    {status === "loading" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    Commit Policy Changes
                </button>
            </div>
        </form>
    );
}
