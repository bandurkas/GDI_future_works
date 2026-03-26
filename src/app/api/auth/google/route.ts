import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

// Use the client ID injected into the container securely
const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const jwtSecret = process.env.JWT_SECRET as string;

const client = new OAuth2Client(clientId);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { credential } = body;

    if (!credential) {
      return NextResponse.json(
        { error: "Missing credential token" },
        { status: 400 }
      );
    }

    // 1. Verify the ID token against Google's servers securely
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return NextResponse.json({ error: "Invalid token payload" }, { status: 401 });
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return NextResponse.json({ error: "Google account missing email" }, { status: 400 });
    }

    // 2. Upsert the User and Student records
    const dbUser = await prisma.user.upsert({
      where: { email: email.toLowerCase() },
      update: {
        lastLogin: new Date(),
        avatarUrl: picture,
      },
      create: {
        email: email.toLowerCase(),
        name: name || "New User",
        role: "STUDENT",
        isActive: true,
        avatarUrl: picture,
        lastLogin: new Date(),
      },
    });

    const student = await prisma.student.upsert({
      where: { userId: dbUser.id },
      update: {},
      create: {
        userId: dbUser.id,
        status: "ACTIVE",
      }
    });

    // 3. Generate our internal session JWT
    const token = jwt.sign(
      { 
        studentId: student.id,
        userId: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: "student" 
      },
      jwtSecret as string,
      { expiresIn: "7d" }
    );

    // 4. Attach the JWT as an HttpOnly secure cookie
    const response = NextResponse.json({ 
        success: true, 
        user: { id: student.id, name: dbUser.name } 
    });
    
    response.cookies.set("gdi_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Auth API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error during authentication" },
      { status: 500 }
    );
  }
}
