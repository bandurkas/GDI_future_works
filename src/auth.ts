import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

console.log("Loading auth.ts -> NextAuth configuration");

const prisma = new PrismaClient();

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "admin@gdifuture.works" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                console.log("Authorize called with email:", credentials?.email);
                if (!credentials?.email || !credentials?.password) return null;

                try {
                    console.log("Finding user in database...");
                    const user = await prisma.user.findUnique({
                        where: { email: credentials?.email as string }
                    });
                    
                    console.log("User found:", user ? "Yes" : "No");

                    if (!user || user.deletedAt || !user.passwordHash) {
                        console.log("User invalid, deleted, or no passwordHash");
                        return null;
                    }

                    console.log("Comparing passwords...");
                    const isValid = await bcrypt.compare((credentials?.password as string) || "", user.passwordHash);
                    console.log("Password valid:", isValid);

                    if (!isValid) {
                        return null;
                    }

                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    };
                } catch (error) {
                    console.error("Error in NextAuth authorize:", error);
                    throw error;
                }
            }
        })
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            console.log("Sign-in callback called for carrier:", account?.provider);
            if (account?.provider === "google") {
                const email = user.email?.toLowerCase();
                if (!email) {
                    console.error("No email found in Google profile");
                    return false;
                }
                
                console.log("Upserting Google user:", email);
                const dbUser = await prisma.user.upsert({
                    where: { email },
                    update: {
                        name: user.name || "Student",
                        avatarUrl: user.image,
                    },
                    create: {
                        email,
                        name: user.name || "Student",
                        role: "STUDENT",
                        isActive: true,
                        avatarUrl: user.image,
                    }
                });

                await prisma.student.upsert({
                    where: { userId: dbUser.id },
                    update: {},
                    create: {
                        userId: dbUser.id,
                        status: "ACTIVE",
                    }
                });
            }
            return true;
        },
        async jwt({ token, user }: any) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (session?.user) {
                (session.user as any).role = token.role;
                session.user.id = token.id;
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
    trustHost: true,
});

export const { GET, POST } = handlers;
