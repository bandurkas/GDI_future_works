import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import crypto from 'crypto';

const prisma = new PrismaClient();

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "admin@gdifuture.works" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await prisma.appUser.findUnique({
                    where: { email: credentials?.email as string }
                });

                if (!user || !user.is_active || !user.password_hash) {
                    return null;
                }

                const isValid = await bcrypt.compare((credentials?.password as string) || "", user.password_hash);

                if (!isValid) {
                    return null;
                }

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
                let appUser = await prisma.appUser.findUnique({
                    where: { email: user.email as string }
                });

                if (!appUser) {
                    appUser = await prisma.appUser.create({
                        data: {
                            email: user.email as string,
                            name: user.name || "New Viewer",
                            role: "Instructor",
                            google_id: profile?.sub as string,
                            avatar_url: profile?.picture as string,
                            last_login: new Date()
                        }
                    });
                } else {
                     appUser = await prisma.appUser.update({
                         where: { email: user.email as string },
                         data: { 
                             google_id: profile?.sub as string, 
                             avatar_url: profile?.picture as string, 
                             last_login: new Date() 
                         }
                     });
                }
                
                (user as any).role = appUser.role;
                user.id = appUser.id;
                
                return true;
            }
            return true;
        },
        async jwt({ token, user }: any) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
                
                // Fetch granular permissions
                const perms = await prisma.userPermission.findMany({
                    where: { user_id: user.id }
                });
                
                token.permissions = perms.reduce((acc: any, p: any) => {
                    acc[p.permission_key] = p.granted;
                    return acc;
                }, {});
            }
            return token;
        },
        async session({ session, token }: any) {
            if (session?.user) {
                (session.user as any).role = token.role;
                session.user.id = token.id;
                (session.user as any).permissions = token.permissions || {};
            }
            return session;
        }
    },
    pages: {
        signIn: "/admin/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 8 * 60 * 60, // 8 hours as requested
    },
    secret: process.env.NEXTAUTH_SECRET,
    trustHost: true,
});

export const { GET, POST } = handlers;
