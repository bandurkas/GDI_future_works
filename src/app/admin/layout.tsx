import { auth } from "@/auth";
import AuthProvider from "./AuthProvider";
import AdminSidebar from "./AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    return <>{children}</>;
  }

  return (
    <AuthProvider session={session}>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--gray)' }}>
        <AdminSidebar role={session.user.role} userName={session.user.name || ""} />
        <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}
