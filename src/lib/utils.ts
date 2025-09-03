import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates a random ID for anonymous users
 */
export function generateAnonymousId(): string {
  // Generate a random string with timestamp to make it unique
  return 'anon_' + Math.random().toString(36).substring(2, 15) + 
         '_' + Date.now().toString(36);
}

/**
 * Gets the anonymous ID from localStorage or creates a new one if it doesn't exist
 */
export function getAnonymousId(): string {
  if (typeof window === 'undefined') {
    return 'server_generated_id';
  }
  
  let anonId = localStorage.getItem('anonymousId');
  
  if (!anonId) {
    anonId = generateAnonymousId();
    try {
      localStorage.setItem('anonymousId', anonId);
    } catch (e) {
      console.warn('Failed to save anonymous ID to localStorage:', e);
    }
  }
  
  return anonId;
}
