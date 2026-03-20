"use client";
import { useState } from "react";
import { inviteUser } from "./actions";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";

export default function InviteUserPage() {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (formData: FormData) => {
        setStatus("loading");
        const res = await inviteUser(null, formData);

        if (res.error) {
            setStatus("error");
            setMessage(res.error);
        } else if (res.success) {
            setStatus("success");
            setMessage(res.message);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto mt-10">
            <Link 
                href="/admin/users" 
                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-800 mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back to Users
            </Link>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Invite Team Member</h1>
                    <p className="text-gray-500 mt-2 text-sm text-balance">
                        Provision a new user account with a designated RBAC role. They will be immediately able to authenticate via their Google Account.
                    </p>
                </div>

                {status === "success" && (
                    <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-3 text-emerald-800">
                        <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                        <div className="text-sm font-medium">{message}</div>
                    </div>
                )}

                {status === "error" && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 text-red-800">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <div className="text-sm font-medium">{message}</div>
                    </div>
                )}

                <form action={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-1.5">
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                required
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-800 transition-all font-medium text-gray-900"
                                placeholder="e.g. Nane Guru"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-1.5">
                                Google Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                required
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-800 transition-all font-medium text-gray-900"
                                placeholder="team@gdifuture.works"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                Must be a valid Google Account if using Google OAuth.
                            </p>
                        </div>

                        <div>
                            <label htmlFor="role" className="block text-sm font-semibold text-gray-800 mb-1.5">
                                Assign Initial Role
                            </label>
                            <select
                                name="role"
                                id="role"
                                required
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-800 transition-all font-medium text-gray-900 appearance-none cursor-pointer"
                            >
                                <option value="Support">Viewer (Read-only)</option>
                                <option value="Sales Manager">Account Manager</option>
                                <option value="Instructor">Video Manager</option>
                                <option value="Owner">Super Administrator</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={status === "loading"}
                        className="w-full flex items-center justify-center gap-2 bg-[#1A1A1A] hover:bg-black text-white px-6 py-3 rounded-xl font-medium shadow-sm transition-all disabled:opacity-70"
                    >
                        {status === "loading" ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            "Provision User"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
