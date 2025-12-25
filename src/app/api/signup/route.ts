import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Admin Client
 * Creates a Supabase client with SERVICE ROLE key
 */
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, // Supabase project URL
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Admin service role key
);

/**
 * POST Request handles user registration requests:
 * - Validates request body
 * - Checks for existing user (prevents duplicates)
 * - Creates new user account
 * - Returns appropriate response
 */
export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const { email, password } = await req.json();

    // Check if email already exists
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      return NextResponse.json({
        success: false,
        message: listError.message
      });
    }

    // Check if user exists
    const userExists = usersData.users.some(u => u.email === email);

    // User-friendly error message
    if (userExists) {
      return NextResponse.json({
        success: false,
        message: 'An account with this email already exists. Please try logging in.'
      });
    }

    // Create new user
    const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password
    });

    if (createError || !data.user) {
      return NextResponse.json({
        success: false,
        message: createError?.message || 'Could not create account. Please try again.'
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
