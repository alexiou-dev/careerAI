import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email || !name) {
      return NextResponse.json({ message: 'Email and name are required' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'A user with this email already exists.' }, { status: 409 });
    }

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Signup API Error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
