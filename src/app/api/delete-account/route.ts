// /app/api/delete-account/route.ts
import { NextResponse } from "next/server";

const USERS_KEY = "careerai-users";

export async function DELETE(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Load users
    const raw = globalThis.localStorage?.getItem(USERS_KEY);
    const users = raw ? JSON.parse(raw) : [];

    // Remove user
    const updatedUsers = users.filter((u: any) => u.id !== userId);

    // Save back
    globalThis.localStorage?.setItem(USERS_KEY, JSON.stringify(updatedUsers));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete account error:", err);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
