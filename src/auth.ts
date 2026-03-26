import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

import { ALL_ADMIN_ROLES } from "@/lib/roles";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        // ... (providers stay the same)
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string }
                });

                if (!user || user.deletedAt || !user.passwordHash) return null;

                const isValid = await bcrypt.compare(credentials.password as string, user.passwordHash);
                if (!isValid) return null;

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                };
            }
        })
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "google") {
                const email = user.email?.toLowerCase();
                console.log("[DEBUG AUTH] email:", email);
                if (!email) return false;

                // Sync Google user with our DB
                const dbUser = await prisma.user.upsert({
                    where: { email },
                    update: {
                        name: user.name || "User",
                        avatarUrl: user.image,
                    },
                    create: {
                        email,
                        name: user.name || "User",
                        role: "STUDENT",
                        isActive: true,
                        avatarUrl: user.image,
                    }
                });

                // Block inactive accounts
                if (!dbUser.isActive) return false;

                // Attach DB role + id to user object for the JWT callback
                (user as any).role = dbUser.role;
                (user as any).id = dbUser.id;

                // Admin gate: if signing in from /admin, only admin roles allowed
                const redirectTo = (account as any).callbackUrl || '';
                const isAdminLogin = redirectTo.includes('/admin');
                if (isAdminLogin && !ALL_ADMIN_ROLES.includes(dbUser.role)) {
                    return '/admin/login?error=not_authorized';
                }
            }
            return true;
        },
        async jwt({ token, user, trigger, session }: any) {
            // Initial sign in
            if (user) {
                token.role = user.role;
                token.id = user.id;
            } 
            
            // Refresh role from DB on every JWT check to ensure session stays in sync with role changes
            if (token.email) {
                const dbUser = await prisma.user.findUnique({
                    where: { email: token.email },
                    select: { role: true, id: true }
                });
                if (dbUser) {
                    token.role = dbUser.role;
                    token.id = dbUser.id;
                }
            }

            return token;
        },
        async session({ session, token }: any) {
            if (session.user) {
                (session.user as any).role = token.role || "STUDENT";
                (session.user as any).id = token.id;
            }
            return session;
        }
    },
    pages: {
        signIn: "/admin/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
    trustHost: true,
});

export const { GET, POST } = handlers;
