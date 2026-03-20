import { PrismaClient } from '@prisma/client';
import { auth } from "@/auth";
import { redirect } from 'next/navigation';
import { 
  BookOpen, 
  Plus, 
  MoreVertical,
  Layers,
  CheckCircle2
} from "lucide-react";

const prisma = new PrismaClient();

export default async function ProgramsAdminPage() {
    const session = await auth();
    if (!session) redirect('/admin/login');

    const programs = await prisma.program.findMany({
        include: { 
            _count: { select: { courses: true } }
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'var(--font-body)', color: '#1a1a1a' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '8px', letterSpacing: '-1px' }}>
                        Programs & Catalog
                    </h1>
                    <p style={{ color: '#666', fontSize: '14px' }}>Define top-level study programs and manage course categories.</p>
                </div>
                <button style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    padding: '12px 20px', 
                    borderRadius: '12px', 
                    background: '#1a1a1a', 
                    color: 'white', 
                    border: 'none', 
                    fontSize: '14px', 
                    fontWeight: 700, 
                    cursor: 'pointer'
                }}>
                    <Plus size={18} /> Create Program
                </button>
            </header>

            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #eee', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #eee', background: '#fafafa' }}>
                            <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Program Title</th>
                            <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Category</th>
                            <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Courses</th>
                            <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Status</th>
                            <th style={{ padding: '16px', textAlign: 'right' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {programs.map((p) => (
                            <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Layers size={18} color="#e43a3d" />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '14px' }}>{p.title}</div>
                                            <div style={{ fontSize: '12px', color: '#888' }}>/{p.slug}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '16px', fontSize: '14px' }}>
                                    <span style={{ padding: '4px 8px', borderRadius: '6px', background: '#f5f5f5', fontSize: '12px', fontWeight: 600 }}>
                                        {p.category}
                                    </span>
                                </td>
                                <td style={{ padding: '16px', fontSize: '14px', fontWeight: 600 }}>
                                    {p._count.courses} Courses
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{ 
                                        padding: '4px 8px', 
                                        borderRadius: '6px', 
                                        fontSize: '11px', 
                                        fontWeight: 700,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        background: p.isActive ? '#ECFDF5' : '#f5f5f5',
                                        color: p.isActive ? '#059669' : '#666'
                                    }}>
                                        {p.isActive ? <CheckCircle2 size={10} /> : null}
                                        {p.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td style={{ padding: '16px', textAlign: 'right' }}>
                                    <button style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}>
                                        <MoreVertical size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {programs.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: '60px', textAlign: 'center' }}>
                                    <div style={{ color: '#999', fontSize: '14px' }}>No programs defined in the catalog.</div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
