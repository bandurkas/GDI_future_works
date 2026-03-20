import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";
import LearningHubOnboarding from "./LearningHubOnboarding";

// Define the expected shape of our JWT payload
interface SessionPayload {
  clientId: string;
  email: string;
  name: string;
  role: string;
}

// Utility to get the current user session
async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("gdi_session")?.value;

  if (!token) return null;

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error("JWT_SECRET is not set");
    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload; // { clientId, email, name, role }
  } catch (err) {
    return null;
  }
}

export default async function DashboardPage() {
  const session = await getSession();
  
  if (!session) {
    redirect("/login");
  }

  const firstName = session.name.split(' ')[0];

  return <LearningHubOnboarding firstName={firstName} />;
}
