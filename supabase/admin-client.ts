/**
 * Admin Supabase client for server-side operations that need to bypass RLS
 */
import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
export const createAdminClient = () => {
  // Gunakan anon key untuk operasi yang tidak memerlukan autentikasi
  // Ini tidak mengakses data melalui RLS tapi tetap dapat melakukan operasi insert
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
