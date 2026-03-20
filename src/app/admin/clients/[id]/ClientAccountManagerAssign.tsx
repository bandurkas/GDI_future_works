"use client";
import { useState } from "react";
import { assignAccountManager } from "./actions";
import { UserCheck, Loader2 } from "lucide-react";

export function ClientAccountManagerAssign({ 
    clientId, 
    initialManagerId, 
    availableManagers 
}: { 
    clientId: string; 
    initialManagerId: string | null; 
    availableManagers: { id: string; name: string; role: string }[] 
}) {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (formData: FormData) => {
        setStatus("loading");
        formData.append("client_id", clientId);
        
        const res = await assignAccountManager(null, formData);

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
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '14px', margin: '0 0 16px', color: 'var(--dark)', borderBottom: '1px solid var(--border)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck size={16} />
                Assigned Account Manager
            </h3>

            {status === "success" && (
                <div style={{ padding: '12px', borderRadius: '8px', background: '#ecfdf5', color: '#065f46', fontSize: '13px', marginBottom: '16px', fontWeight: 500 }}>
                    {message}
                </div>
            )}
            
            {status === "error" && (
                <div style={{ padding: '12px', borderRadius: '8px', background: '#fef2f2', color: '#991b1b', fontSize: '13px', marginBottom: '16px', fontWeight: 500 }}>
                    {message}
                </div>
            )}

            <form action={handleSubmit}>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <select
                        name="manager_id"
                        defaultValue={initialManagerId || "unassigned"}
                        style={{
                            flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', 
                            fontSize: '14px', backgroundColor: '#f8f9fa', color: '#333', cursor: 'pointer'
                        }}
                    >
                        <option value="unassigned">— Unassigned (Global Visibility Only) —</option>
                        {availableManagers.map(am => (
                            <option key={am.id} value={am.id}>
                                {am.name} ({am.role.replace('_', ' ')})
                            </option>
                        ))}
                    </select>
                    
                    <button
                        type="submit"
                        disabled={status === "loading"}
                        style={{
                            padding: '10px 20px', background: '#1a1a1a', color: 'white', borderRadius: '8px', 
                            border: 'none', cursor: status === "loading" ? 'not-allowed' : 'pointer', 
                            fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px',
                            opacity: status === "loading" ? 0.7 : 1
                        }}
                    >
                        {status === "loading" ? <Loader2 size={14} className="animate-spin" /> : "Save Target"}
                    </button>
                </div>
                <p style={{ fontSize: '12px', color: '#888', marginTop: '12px', lineHeight: 1.4 }}>
                    Assigning a manager gives them absolute strict visibility into this client's profile and pipeline lifecycle.
                </p>
            </form>
        </div>
    );
}
