// app/api/auth/delete/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    await prisma.user.delete({ where: { email } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
