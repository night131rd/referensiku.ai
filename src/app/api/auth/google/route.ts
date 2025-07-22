import { createClient } from "../../../../../supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const supabase = await createClient();
    const origin = requestUrl.origin;

    console.log("Starting Google sign-in flow with origin:", origin);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      console.error("Google sign in error:", error);
      return NextResponse.redirect(
        new URL(`/sign-in?error=${encodeURIComponent(`Failed to sign in with Google: ${error.message}`)}`, origin)
      );
    }

    if (!data?.url) {
      console.error("No URL returned from signInWithOAuth");
      return NextResponse.redirect(
        new URL(`/sign-in?error=${encodeURIComponent("Authentication URL not returned")}`, origin)
      );
    }

    console.log("Redirecting to Google sign-in page:", data.url);
    // Redirect user to the Google sign-in page
    return NextResponse.redirect(new URL(data.url));
  } catch (e) {
    console.error("Unexpected error during Google sign-in:", e);
    const requestUrl = new URL(request.url);
    return NextResponse.redirect(
      new URL(`/sign-in?error=${encodeURIComponent(`An unexpected error occurred: ${e instanceof Error ? e.message : 'Unknown error'}`)}`, requestUrl.origin)
    );
  }
}
