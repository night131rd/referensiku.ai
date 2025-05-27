"use server";

import { encodedRedirect } from "@/utils/utils";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "../../supabase/server";
import { SearchResult, JournalReference } from "@/types/search";

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

  // This is a mock implementation - in a real app, you would call your actual APIs here
  // For now, we'll return mock data to demonstrate the UI

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Mock references
  const mockReferences: JournalReference[] = [
    {
      title: "The Impact of Climate Change on Global Biodiversity",
      authors: ["Smith, J.", "Johnson, A.", "Williams, R."],
      year: 2022,
      journal: "Journal of Environmental Science",
      doi: "10.1234/jes.2022.1234",
      url: "https://example.com/journal/climate-change",
      pdfUrl: "https://example.com/pdf/climate-change.pdf",
      abstract:
        "This study examines the wide-ranging effects of climate change on biodiversity across different ecosystems worldwide. The findings suggest significant impacts on species distribution and ecosystem functioning.",
    },
    {
      title: "Machine Learning Approaches to Climate Prediction",
      authors: ["Chen, L.", "Garcia, M."],
      year: 2021,
      journal: "Computational Environmental Science",
      doi: "10.1234/ces.2021.5678",
      url: "https://example.com/journal/ml-climate",
      abstract:
        "This paper presents novel machine learning techniques for predicting climate patterns and extreme weather events with improved accuracy.",
    },
    {
      title: "Policy Frameworks for Climate Adaptation in Coastal Regions",
      authors: ["Brown, K.", "Miller, S.", "Davis, T.", "Wilson, P."],
      year: 2023,
      journal: "Environmental Policy Review",
      doi: "10.1234/epr.2023.9012",
      pdfUrl: "https://example.com/pdf/policy-climate.pdf",
    },
  ];

  // Generate a mock answer with citations
  const mockAnswer = `
    <p>Research on ${query} has shown significant developments in recent years. Smith et al. (2022) demonstrated that climate change has profound effects on global biodiversity, with particular impact on marine ecosystems. Their findings indicate a 15% reduction in species diversity in affected areas.</p>
    
    <p>Furthermore, computational approaches have revolutionized how we understand climate patterns. Chen and Garcia (2021) developed machine learning models that improve prediction accuracy by 23% compared to traditional methods. These models are particularly effective at identifying early warning signs of extreme weather events.</p>
    
    <p>From a policy perspective, Brown et al. (2023) proposed a comprehensive framework for climate adaptation in coastal regions that integrates scientific findings with practical governance structures. Their approach has been implemented in several coastal communities with promising initial results.</p>
    
    <p>The consensus across these studies suggests that interdisciplinary approaches combining technological innovation, policy reform, and community engagement offer the most promising path forward for addressing climate-related challenges.</p>
  `;

  return {
    answer: mockAnswer,
    references: mockReferences,
  };
};
