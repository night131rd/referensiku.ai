"use server";

import { encodedRedirect } from "@/utils/utils";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "../../supabase/server";
import { SearchResult, JournalReference } from "@/types/search";
// Note: We import the API client dynamically in the searchJournals function
// to ensure it works with the "use server" directive


export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const fullName = formData.get("full_name")?.toString() || "";
  const supabase = await createClient();
  const origin = headers().get("origin");

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        full_name: fullName,
        email: email,
      },
    },
  });

  console.log("After signUp", error);

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  }

  if (user) {
    try {
      const { error: updateError } = await supabase.from("users").insert({
        id: user.id,
        name: fullName,
        full_name: fullName,
        email: email,
        user_id: user.id,
        token_identifier: user.id,
        created_at: new Date().toISOString(),
      });

      if (updateError) {
        console.error("Error updating user profile:", updateError);
      }
    } catch (err) {
      console.error("Error in user profile creation:", err);
    }
  }

  return encodedRedirect(
    "success",
    "/sign-up",
    "Thanks for signing up! Please check your email for a verification link.",
  );
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/dashboard");
};

export const signInWithGoogleAction = async () => {
  try {
    const supabase = await createClient();
    const origin = headers().get("origin") || "https://chatjurnal.vercel.app/";
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
      return encodedRedirect("error", "/sign-in", `Failed to sign in with Google: ${error.message}`);
    }

    if (!data?.url) {
      console.error("No URL returned from signInWithOAuth");
      return encodedRedirect("error", "/sign-in", "Authentication URL not returned");
    }

    console.log("Redirecting to Google sign-in page:", data.url);
    // Redirect user to the Google sign-in page
    return redirect(data.url);
  } catch (e) {
    console.error("Unexpected error during Google sign-in:", e);
    return encodedRedirect("error", "/sign-in", `An unexpected error occurred: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = headers().get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

// Search journals action
export const searchJournals = async (
  query: string,
  startYear: string,
  endYear: string,
  mode: string,
): Promise<SearchResult> => {
  console.log(
    `Searching for: ${query}, years: ${startYear}-${endYear}, mode: ${mode}`,
  );

  try {
    // Import API client
    const api = await import('@/lib/api');

    // Format years as a single string
    const yearString = `${startYear}-${endYear}`;
    
    // Start the search on the backend
    const searchResponse = await api.startSearch(query, yearString, mode);
    
    // Check if we got a fallback response
    if (searchResponse.fallback === true) {
      console.log("Received fallback response from search API, using mock data");
      throw new Error(searchResponse.error || "Search service unavailable");
    }
    
    const taskId = searchResponse.task_id;
    console.log(`Search started with task ID: ${taskId}`);
    
    // Poll for status until completed or error
    let status;
    let retries = 0;
    const maxRetries = 60; // Maximum number of polling attempts (30 * 3 seconds = 90 seconds)
    
    do {
      // Wait a bit between status checks
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      status = await api.checkSearchStatus(taskId);
      retries++;
      
      console.log(`Status check ${retries}: ${status.status} - ${status.message}`);
      
      // Check if status check returned a fallback response
      if (status.fallback === true) {
        console.log("Received fallback response from status API, using mock data");
        throw new Error(status.error || "Search status check failed");
      }
      
      // If we've been waiting too long, consider it failed
      if (retries >= maxRetries) {
        throw new Error("Search timed out after 90 seconds");
      }
      
    } while (!status.completed);
    
    // Get the answer and references
    const answerData = await api.getAnswer(taskId);
    
    // Check if answer retrieval returned a fallback response
    if (answerData.fallback === true) {
      console.log("Received fallback response from answer API, using mock data");
      throw new Error(answerData.error || "Failed to retrieve answer");
    }
    
    // Convert sources to the JournalReference format
    const references: JournalReference[] = answerData.sources.map((source: any) => ({
      title: source.title || "Unknown Title",
      authors: source.author ? [source.author] : ["Unknown Author"],
      year: source.year ? parseInt(source.year) : new Date().getFullYear(),
      journal: (source.publisher || "Unknown Journal").toUpperCase(), // Convert journal name to uppercase
      doi: source.doi || "",
      url: source.url || "",
      pdfUrl: source.pdfUrl || "",
      abstract: source.teks || "",
    }));

    // Pastikan bibliography adalah array of strings
    let bibliography: string[] = [];
    if (answerData.bibliography && Array.isArray(answerData.bibliography)) {
      bibliography = answerData.bibliography
        .filter(item => item && typeof item === 'string')
        .map(item => item.toString());
    }
    
    return {
      answer: answerData.answer,
      references: references,
      bibliography: bibliography,
      taskId: taskId, // Store task ID for potential future needs
    };
  } catch (error) {
    console.error("Error searching journals:", error);
    
    // Fall back to the mock implementation if the backend fails
    console.log("Falling back to mock implementation");
    33
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock references
    const mockReferences: JournalReference[] = [
      
    ];

    // Generate an error log for user
    const mockAnswer = `
      <p> Pencarian ${query} mengalami error. Silakan coba lagi nanti.</p>
    `;

    // Create mock bibliography entries for fallback
    const mockBibliography: string[] = [
      "Tidak dapat menampilkan sumber karena terjadi kesalahan pada server. Silakan coba lagi nanti."
    ];

    return {
      answer: mockAnswer,
      references: mockReferences,
      bibliography: mockBibliography,
    };
  }
};
