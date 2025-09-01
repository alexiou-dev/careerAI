// lib/auth.ts
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

/**
 * getCurrentUser
 * - Reads a cookie "auth-email" (set after login/signup)
 * - Looks up the user in the database
 * - Returns the user object or null
 */
export async function getCurrentUser() {
  try {
    const cookieStore = cookies();
    const email = cookieStore.get("auth-email")?.value;

    if (!email) return null;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true }, // minimal fields
    });

    return user;
  } catch (err) {
    console.error("getCurrentUser failed:", err);
    return null;
  }
}
