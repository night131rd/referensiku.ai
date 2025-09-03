import { createClient } from "../../../../supabase/server";
import { NextResponse } from "next/server";

// Force dynamic rendering to fix the static generation error
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    console.log("Auth callback received with URL:", request.url);
    const code = requestUrl.searchParams.get("code");
    const redirect_to = requestUrl.searchParams.get("redirect_to");
    const error = requestUrl.searchParams.get("error");
    const error_description = requestUrl.searchParams.get("error_description");
    
    // Check if there's an error in the URL
    if (error) {
      console.error(`Auth error: ${error} - ${error_description}`);
      return NextResponse.redirect(
        new URL(`/sign-in?error=${encodeURIComponent(error_description || error)}`, requestUrl.origin)
      );
    }

    if (!code) {
      console.error("No auth code provided in callback");
      return NextResponse.redirect(
        new URL(`/sign-in?error=${encodeURIComponent("No authorization code provided")}`, requestUrl.origin)
      );
    }
    
    console.log("Exchanging code for session");
    const supabase = await createClient();
    const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (sessionError) {
      console.error("Error exchanging code for session:", sessionError);
      return NextResponse.redirect(
        new URL(`/sign-in?error=${encodeURIComponent(sessionError.message)}`, requestUrl.origin)
      );
    }
    
    // If this is a new user signing up with OAuth, update their profile in the database
    if (data?.user) {
      const user = data.user;
      console.log("User authenticated:", user.email);
      
      // Check if user was created with OAuth (Google)
      if (user.app_metadata?.provider === 'google') {
        try {
          console.log("Google user authenticated, checking if user exists in database");
          // Extract user information from the user object
          const { data: existingUser } = await supabase
            .from('profiles')
            .select()
            .eq('id', user.id)
            .single();
            
          // Only insert if the user doesn't already exist in the users table
          if (!existingUser) {
            console.log("Creating new user profile in database");
            const userData = {
              id: user.id,
              name: user.user_metadata?.full_name || user.user_metadata?.name || "Google User",
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || "Google User",
              email: user.email,
              user_id: user.id,
              token_identifier: user.id,
              avatar_url: user.user_metadata?.avatar_url || null,
              created_at: new Date().toISOString(),
            };
            
            console.log("User data to insert:", userData);
            const { error: insertError } = await supabase.from("users").insert(userData);
            
            if (insertError) {
              console.error("Error creating user profile:", insertError);
            } else {
              console.log("User profile created successfully");
            }
          } else {
            console.log("User already exists in database");
          }
        } catch (err) {
          console.error("Error in user profile creation:", err);
        }
      }
    }
    
    // URL to redirect to after sign in process completes
    const redirectTo = redirect_to || "/dashboard";
    console.log("Auth callback successful, redirecting to:", redirectTo);
    return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
  } catch (err) {
    console.error("Unexpected error in auth callback:", err);
    const requestUrl = new URL(request.url);
    return NextResponse.redirect(
      new URL(`/sign-in?error=${encodeURIComponent("An unexpected error occurred during authentication")}`, requestUrl.origin)
    );
  }
}