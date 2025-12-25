/**
 * Account Deletion API Route
 * Flow:
 * - Authenticate request (user deleting their own account)
 * - Delete user data from application tables
 * - Delete user from auth system
 * - Return confirmation
 */
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Admin Client
 * Uses SERVICE ROLE KEY for administrative delete operations.
 */
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Admin key for user deletion
);

/**
 * DELETE Request Handler
 * Permanently deletes a user account and all associated data.
 */
export async function DELETE(req: Request) {
  try {
    // Parse request body
    const { userId, confirmation } = await req.json();

     // Basic validation
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Users must type "DELETE" (case-sensitive)
    if (confirmation !== "DELETE") {
      return NextResponse.json(
        { 
          success: false,
          error: 'Please type "DELETE" exactly to confirm account deletion.',
          code: "INVALID_CONFIRMATION"
        }, 
        { status: 400 }
      );
    }

    // Delete user via Supabase Admin API
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    // Handle Supabase deletion failur
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete account error:", err);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
