/**
 * Service for logging search queries to Supabase
 */
import { createClient } from '@supabase/supabase-js';

interface SearchLogEntry {
  query: string;
  year?: string | null;
  mode?: string | null;
  status: "success" | "error";
}

/**
 * Log a search query to Supabase without requiring user authentication
 * 
 * @param logEntry - The search log entry to be saved
 * @returns Promise that resolves when the log is saved
 */
export async function logSearchQuery(logEntry: SearchLogEntry): Promise<void> {
  try {
    // Gunakan direct client tanpa auth
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Insert log entry tanpa user_id untuk menghindari foreign key constraint
    const { error } = await supabase
      .from("search_logs")
      .insert({
        query: logEntry.query,
        year: logEntry.year || null,
        mode: logEntry.mode || null,
        status: logEntry.status
      });
    
    if (error) {
      console.error("Failed to log search query:", error);
    }
  } catch (error) {
    console.error("Error in logSearchQuery:", error);
  }
}
