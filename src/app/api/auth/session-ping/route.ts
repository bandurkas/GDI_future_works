import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
    try {
        // 1. Check NextAuth CRM Session
        const session = await auth();
        if (session?.user) {
            return NextResponse.json({ user: session.user, type: "admin" }, { status: 200 });
        }

        // 2. Check Custom Client JWT Session
        const token = req.cookies.get("gdi_session")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) throw new Error("JWT_SECRET is not set");
        const secret = new TextEncoder().encode(jwtSecret);
        const { payload } = await jwtVerify(token, secret);

        return NextResponse.json({ user: payload, type: "client" }, { status: 200 });
    } catch (error) {
        console.error("Session Ping Error:", error);
        return NextResponse.json({ error: "Invalid Session" }, { status: 401 });
    }
}
