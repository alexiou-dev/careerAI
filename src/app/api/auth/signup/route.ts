import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // check if already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ success: false, message: "Email already exists." }, { status: 400 });
    }

    // hash password
    const hashed = await bcrypt.hash(password, 10);

    // create user
    const user = await prisma.user.create({
      data: { email, password: hashed },
    });

    return NextResponse.json({ success: true, user: { email: user.email } });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Signup failed." }, { status: 500 });
  }
}
