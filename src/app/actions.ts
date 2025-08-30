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

///    MAIN SERVER ACTIONS

// Fungsi untuk memulai pencarian dengan backend streaming
export const startStreamingSearch = async (
  query: string,
  startYear: string,
  endYear: string,
  mode: string,
): Promise<{ taskId: string }> => {
  console.log(
    `Starting streaming search for: ${query}, years: ${startYear}-${endYear}, mode: ${mode}`,
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
    console.log(`Streaming search started with task ID: ${taskId}`);
    
    return { taskId };
  } catch (error) {
    console.error("Error starting streaming search:", error);
    throw error;
  }
};

// Fungsi legacy untuk backward compatibility
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
    
    // Phase-based polling (waiting -> sources -> answer -> completed)
    let phase: 'waiting' | 'sources' | 'answer' | 'completed' = 'waiting';
    let retries = 0;
    const maxRetries = 90; // ~90s
    let collectedSources: JournalReference[] = [];
    let answerMarkdown = '';
    let bibliography: string[] = [];

    // Helper to normalize a single raw source object from backend (handles varying field names)
    const normalizeSource = (s: any): JournalReference => {
      console.log('Normalizing source:', JSON.stringify(s, null, 2));
      
      // Ekstrak judul dengan berbagai kemungkinan field name
      const title = s.title || s.paper_title || s.document_title || s.name || s.Title || 'Unknown Title';
      
      // Ekstrak authors dengan berbagai kemungkinan format
      let authors: string[] = ['Unknown Author'];
      if (s.authors && typeof s.authors === 'string') {
        // Jika authors berupa string, split berdasarkan koma dan bersihkan
        authors = s.authors.split(',')
          .map((author: string) => author.trim())
          .filter((author: string) => author.length > 0);
      } else if (Array.isArray(s.authors) && s.authors.length > 0) {
        authors = s.authors.filter((author: any) => author && typeof author === 'string');
      } else if (s.author && typeof s.author === 'string') {
        authors = [s.author];
      } else if (s.creator && typeof s.creator === 'string') {
        authors = [s.creator];
      } else if (s.Authors && typeof s.Authors === 'string') {
        authors = s.Authors.split(',')
          .map((author: string) => author.trim())
          .filter((author: string) => author.length > 0);
      } else if (s.Authors && Array.isArray(s.Authors)) {
        authors = s.Authors.filter((author: any) => author && typeof author === 'string');
      } else if (s.Author && typeof s.Author === 'string') {
        authors = [s.Author];
      }
      
      // Pastikan minimal ada satu author yang valid
      if (authors.length === 0 || (authors.length === 1 && authors[0].trim() === '')) {
        authors = ['Unknown Author'];
      }
      
      // Ekstrak tahun
      const year = (() => {
        const y = s.year || s.published_year || s.publication_year || s.date_year || s.Year || s.PublishedYear;
        if (y) {
          const yearNum = parseInt(String(y).slice(0, 4));
          return isNaN(yearNum) ? new Date().getFullYear() : yearNum;
        }
        return new Date().getFullYear();
      })();
      
      // Ekstrak journal/publisher
      const journal = (s.publisher || s.journal || s.source || s.conference || s.Journal || s.Publisher || 'Unknown Journal').toString().toUpperCase();
      
      // Debug hasil normalisasi
      console.log('Normalized result:', { title, authors, year, journal });
      
      return {
        title,
        authors,
        year,
        journal,
        pdfUrl: s.pdfUrl || s.pdf_url || s.pdf || '',
        abstract: s.abstract || s.teks || s.summary || s.description || '',
      };
    };

    // Polling tingkat pertama: polling lebih cepat untuk mendapatkan hasil segera
    const maxInitialRetries = 2 ; // ~2.5s untuk menunggu hasil awal (lebih cepat)

    while (retries < maxInitialRetries) {
      await new Promise(r => setTimeout(r, 500)); // Lebih cepat: 500ms setiap poll
      const statusResp = await api.checkSearchStatus(taskId);
      phase = statusResp.phase;
      retries++;
      console.log(`Phase check ${retries}: ${phase}`);

      // Debug output untuk semua fase
      if (phase === 'sources' || phase === 'answer' || phase === 'completed') {
        console.log(`Phase ${phase} detected, sources count:`, statusResp.sources?.length || 0);
        if (statusResp.sources?.[0]) {
          console.log('Raw first source:', JSON.stringify(statusResp.sources[0], null, 2));
          console.log('Available source fields:', Object.keys(statusResp.sources[0]));
        }
        // Debug bibliography jika tersedia
        if (statusResp.bibliography && statusResp.bibliography.length > 0) {
          console.log('Bibliography data:', statusResp.bibliography.slice(0, 2)); // Show first 2 entries
        }
      }

      // Jika sources sudah ada, segera kembalikan untuk UI
      if (phase === 'sources' && statusResp.sources && statusResp.sources.length > 0) {
        collectedSources = statusResp.sources.map(normalizeSource);
        console.log(`Returning early with ${collectedSources.length} sources, answer still pending`);
        return {
          answer: '',
          references: collectedSources,
          bibliography: [],
          taskId,
          phase: 'sources',
          answerPending: true,
          bibliographyPending: true, // Bibliography masih dalam proses
        };
      }

      // Handle answer phase - answer ready but bibliography might not be complete
      if (phase === 'answer' && statusResp.answer) {
        answerMarkdown = statusResp.answer;
        // In answer phase, bibliography might be empty according to the backend
        bibliography = [];
        if (statusResp.sources && statusResp.sources.length > 0) {
          collectedSources = statusResp.sources.map(normalizeSource);
        }
        console.log(`Returning with answer, bibliography still pending`);
        return {
          answer: answerMarkdown,
          references: collectedSources,
          bibliography,
          taskId,
          phase: 'answer',
          answerPending: false,
          bibliographyPending: true, // Flag untuk bibliography masih pending
        };
      }
      
      // Handle completed phase - everything is ready (sources, answer, and bibliography)
      if (phase === 'completed' && statusResp.answer) {
        answerMarkdown = statusResp.answer;
        bibliography = (statusResp.bibliography || []).filter((b: any) => typeof b === 'string');
        if (statusResp.sources && statusResp.sources.length > 0) {
          collectedSources = statusResp.sources.map(normalizeSource);
        }
        console.log(`Returning with complete data including bibliography`);
        return {
          answer: answerMarkdown,
          references: collectedSources,
          bibliography,
          taskId,
          phase: 'completed',
          answerPending: false,
          bibliographyPending: false, // Bibliography sudah selesai
        };
      }
    }
    
    // Jika masih belum dapat sources setelah waktu awal
    console.log('Sources not available in initial window, returning taskId for client polling');
    return {
      answer: '',
      references: [],
      bibliography: [],
      taskId,
      phase: 'waiting',
      answerPending: true,
      bibliographyPending: true,
    };
  } catch (error) {
    console.error("Error searching journals:", error);
    
    // Fall back to the mock implementation if the backend fails
    console.log("Falling back to mock implementation");
    
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock references (contoh statis agar UI tidak kosong)
    const mockReferences: JournalReference[] = [
      {
        title: `Placeholder studi terkait \"${query}\"`,
        authors: ["Anonim"],
        year: new Date().getFullYear(),
        journal: "MOCK JOURNAL",
        doi: "",
        url: "https://example.com",
        pdfUrl: "",
        abstract: "Data tidak tersedia karena layanan pencarian sedang bermasalah. Ini hanya contoh placeholder untuk menjaga tampilan UI tetap konsisten." 
      }
    ];

    // Gunakan markdown (bukan HTML) agar konsisten dengan parser formatAnswerText
    const mockAnswer = [
      `**Pencarian gagal diproses**`,
      `Kueri: \"${query}\"`,
      "Kemungkinan penyebab:",
      "- Layanan backend sementara tidak dapat diakses",
      "- Timeout saat memproses pencarian",
      "- Gangguan jaringan sementara",
      "\nSilakan coba lagi beberapa saat lagi. Jika masalah berlanjut, hubungi admin.",
    ].join("\n\n");

    // Bibliografi placeholder
    const mockBibliography: string[] = [
      "Tidak dapat menampilkan sumber karena terjadi kesalahan pada server. Silakan coba lagi nanti."
    ];

    return {
      answer: mockAnswer,
      references: mockReferences,
      bibliography: mockBibliography,
      phase: 'answer',
      answerPending: false,
      bibliographyPending: false, // Dalam mode error/mock, bibliography langsung dianggap selesai
    };
  }
};
