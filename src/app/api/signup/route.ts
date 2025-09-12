import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Check if user exists
    const { data: existingUser, error: getUserError } = await supabaseAdmin.auth.admin.getUserByEmail(email);

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'An account with this email already exists. Please try logging in.'
      });
    }

    // Create new user
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (error || !data.user) {
      return NextResponse.json({
        success: false,
        message: error?.message || 'Could not create account. Please try again.'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. Please check your email to verify.'
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: err.message
    });
  }
}
