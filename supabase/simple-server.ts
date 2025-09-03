"use strict";

// Khusus untuk server-side tanpa next/headers
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Function to create a simple supabase client for server-side contexts
// that doesn't rely on next/headers
export const createSimpleServerClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};
