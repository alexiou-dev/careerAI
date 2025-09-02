import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ success: false, message: "Account does not exist." }, { status: 404 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ success: false, message: "Invalid password." }, { status: 401 });
    }

    return NextResponse.json({ success: true, user: { email: user.email } });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Login failed." }, { status: 500 });
  }
}
