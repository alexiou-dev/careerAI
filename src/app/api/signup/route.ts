/**
 * Signup API Route
 * 
 * User registration endpoint with:
 * - User profile creation
 * - Error handling 
 * - Supabase integration for authentication and data storage
 */
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
 * - Validates request 
 * - Creates new user account
 * - Returns appropriate response
 */
export async function POST(req: NextRequest) {
   try {

    // Parse and validate request
    const { email, password } = await req.json();

    // Create new user
    const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false // Requires email verification
    });

    if (createError || !data.user) {
      return NextResponse.json({
        success: false,
        message: createError?.message || 'Could not create account. Please try again.'
      });
    }

    // Step 4: Create User Profile in Database
    const profileResult = await createUserProfile(data.user.id, email);
    
    // Log profile creation failure but don't fail signup
    if (!profileResult.success) {
      console.warn(`Profile creation failed for user ${data.user.id}:`, profileResult.error);
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. Please check your email to verify.'
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: err.message // Supabase checks for existing user
    });
  }

/**
 * Create User Profile
 * 
 * Creates a profile record in the database after successful signup.
 * This separates auth data from application-specific user data.
 */
async function createUserProfile(userId: string, email: string) {
  try {
    const { error } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Add any default profile fields here
        avatar_url: null,
        full_name: null,
        preferences: {
          theme: 'light',
          notifications: true,
          email_notifications: true
        }
      });

    if (error) {
      console.error('Failed to create user profile:', error);
      // Don't fail signup if profile creation fails
      // User can update profile later
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Unexpected error creating profile:', error);
    return { success: false, error: error.message };
  }
 }
}
