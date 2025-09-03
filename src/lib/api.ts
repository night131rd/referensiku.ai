/**
 * API client for interacting with the backend
 */
import { logSearchQuery } from "./logging";

// Track active requests to avoid duplicates
const activeRequests = new Map<string, Promise<any>>();

export interface SearchResponse {
  task_id: string;
  status: string;
  message: string;
  percentage?: number;
  fallback?: boolean;
  error?: string;
  // Header untuk kuota yang dikirim oleh backend
  headers?: {
    "X-RateLimit-Limit-Daily": string;
    "X-RateLimit-Remaining-Daily": string;
  };
}

export interface SearchStatusResponse {
  status: string;
  message: string;
  completed: boolean;
  percentage?: number;
  answer?: string;
  sources?: any[];
  fallback?: boolean;
  error?: string;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Get authentication headers for API requests
 * Will include JWT token if user is logged in, otherwise will include anonymous ID
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  let authHeader: Record<string, string> = {};
  let isAuthenticated = false;
  
  if (typeof window !== 'undefined') {
    try {
      // For client-side - use properly configured client
      const { createClient } = await import('../../supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        authHeader = { 'Authorization': `Bearer ${session.access_token}` };
        isAuthenticated = true;
        console.log('Added JWT authorization to request (client-side)');
        
        // Debugging: Log partial token info to help diagnose
        const tokenPreview = session.access_token.substring(0, 10) + '...';
        console.log(`Token preview: ${tokenPreview}, Length: ${session.access_token.length}`);
      } else {
        console.log('No active session found on client-side');
      }
    } catch (error) {
      console.error('Failed to get JWT token on client:', error);
    }
  } else {
    // For server-side (using simple client that doesn't rely on next/headers)
    try {
      const { createSimpleServerClient } = await import('../../supabase/simple-server');
      const supabase = createSimpleServerClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        authHeader = { 'Authorization': `Bearer ${session.access_token}` };
        isAuthenticated = true;
        console.log('Added JWT authorization to request (server-side)');
      } else {
        console.log('No active session found on server-side');
      }
    } catch (error) {
      console.error('Failed to get JWT token on server:', error);
    }
  }
  
    // Always add anonymous ID header for all requests, even for authenticated users
  // This helps maintain continuity when a guest logs in
  if (typeof window !== 'undefined') {
    try {
      const { getAnonymousId } = await import('./utils');
      const anonymousId = getAnonymousId();
      
      // Add to request headers
      authHeader = { 
        ...authHeader,
        'X-Anonymous-Id': anonymousId
      };
      console.log('Added anonymous ID to request:', anonymousId, isAuthenticated ? '(authenticated)' : '(guest)');
      
      // If not authenticated, ensure this anonymous ID is in the Supabase table
      if (!isAuthenticated) {
        const { createClient } = await import('../../supabase/client');
        const supabase = createClient();
        
        // Check if this anonymous ID exists in the table
        const { data, error } = await supabase
          .from('anonymous_quota')
          .select('anonymous_id')
          .eq('anonymous_id', anonymousId)
          .single();
          
        if (error && error.code === 'PGRST116') {  // Record not found
          // Insert new anonymous user
          console.log('Anonymous user not in database, adding to anonymous_quota table');
          const { error: insertError } = await supabase
            .from('anonymous_quota')
            .insert({
              anonymous_id: anonymousId,
              role: 'guest',
              sisa_quota: 3
            });
            
          if (insertError) {
            console.error('Failed to insert anonymous user:', insertError);
          } else {
            console.log('Successfully added anonymous user to database');
          }
        }
      }
    } catch (error) {
      console.warn('Failed to handle anonymous ID:', error);
    }
  }
  
  return authHeader;
}

export interface AnswerResponse {
  answer: string;
  sources: any[];
  bibliography?: string[]; // Bibliography entries from the backend
  fallback?: boolean;
  error?: string;
}

// Ensure API_URL has the correct format with https:// prefix
let baseApiUrl = process.env.NEXT_PUBLIC_API_URL || '';

// Add https:// if it doesn't have a protocol
if (!baseApiUrl.startsWith('http://') && !baseApiUrl.startsWith('https://')) {
  baseApiUrl = `https://${baseApiUrl}`;
}

// Remove any trailing slashes
baseApiUrl = baseApiUrl.replace(/\/+$/, '');

/**
 * Start a search request to the backend
 */
export async function startSearch(query: string, year?: string, mode: string = 'quick'): Promise<SearchResponse> {
  // Create a unique key for this request
  const requestKey = `search-${query}-${year}-${mode}`;
  
  // If we already have an active request for this exact query, return the existing promise
  if (activeRequests.has(requestKey)) {
    console.log(`🔄 CACHE HIT: Returning existing request for ${requestKey}`);
    return activeRequests.get(requestKey)!;
  }
  
  console.log(`🚀 NEW REQUEST: Starting search for ${requestKey}`);
  
  // Create a new promise for this request
  const requestPromise = (async () => {
    try {
      const url = getProxyUrl('/search');
      console.log(`Starting search request to: ${url}`);
      
      // Get authentication headers (JWT or Anonymous ID)
      const authHeader = await getAuthHeaders();
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        },
        body: JSON.stringify({
          query,
          year: year || '-',
          mode
        }),
        // Pastikan untuk tidak menggunakan cache agar token selalu fresh
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Error starting search: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Check if we got a fallback error from the proxy
      if (data.fallback === true && data.error) {
        // Log failed search query
        await logSearchQuery({
          query,
          year,
          mode,
          status: "error"
        });
        throw new Error(data.error);
      }
      
      // Log successful search query
      await logSearchQuery({
        query,
        year,
        mode,
        status: "success"
      });
      
      // Extract quota information from headers
      const quotaHeaders = {
        "X-RateLimit-Limit-Daily": response.headers.get("X-RateLimit-Limit-Daily") || "",
        "X-RateLimit-Remaining-Daily": response.headers.get("X-RateLimit-Remaining-Daily") || ""
      };
      
      console.log('API response headers:', {
        daily: quotaHeaders["X-RateLimit-Limit-Daily"],
        remaining: quotaHeaders["X-RateLimit-Remaining-Daily"]
      });
      
      // Store quota information in localStorage for client-side access
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('searchQuotaLimit', quotaHeaders["X-RateLimit-Limit-Daily"]);
          localStorage.setItem('searchQuotaRemaining', quotaHeaders["X-RateLimit-Remaining-Daily"]);
          localStorage.setItem('searchQuotaLastUpdated', new Date().toISOString());
          
          // Update the global quota data using custom event
          const event = new CustomEvent('quotaUpdated', {
            detail: {
              total: parseInt(quotaHeaders["X-RateLimit-Limit-Daily"], 10),
              remaining: parseInt(quotaHeaders["X-RateLimit-Remaining-Daily"], 10)
              // No longer sending user_role in the event as we're getting it only from Supabase
            }
          });
          window.dispatchEvent(event);
        } catch (e) {
          console.warn('Failed to save quota info to localStorage:', e);
        }
      }
      
      // Add headers to response
      return {
        ...data,
        headers: quotaHeaders
      };
    } catch (error) {
      console.error('Search request failed:', error);
      
      // Log the error if it hasn't been logged already
      try {
        await logSearchQuery({
          query,
          year,
          mode,
          status: "error"
        });
      } catch (logError) {
        console.error('Failed to log search error:', logError);
      }
      
      throw error;
    } finally {
      // Remove this request from the active requests map after a delay
      // This allows some time before accepting identical requests again
      setTimeout(() => {
        activeRequests.delete(requestKey);
      }, 2000);
    }
  })();
  
  // Store the promise in our map
  activeRequests.set(requestKey, requestPromise);
  
  // Return the promise
  return requestPromise;
}

/**
 * New interface for search status response
 * Includes phase-based tracking for the search process as defined in the FastAPI backend
 * - waiting: Initial state, no data yet
 * - sources: Sources are available, answer is still being generated
 * - answer: Answer is available, bibliography might still be processing
 * - completed: Everything is ready (sources, answer, bibliography)
 */
export interface NewSearchStatusResponse {
  phase: 'waiting' | 'sources' | 'answer' | 'completed';
  answer: string | null;
  sources: any[];
  bibliography: string[];
}

/**
 * Check the status of a search task
 * This version supports the new phase-based status tracking
 * Menggunakan endpoint /search/stream yang konsisten
 */
export async function checkSearchStatus(taskId: string): Promise<NewSearchStatusResponse> {
  // Gunakan endpoint /search/stream yang sesuai dengan implementasi backend
  const url = getProxyUrl(`/search/stream/${taskId}`);
  
  // Get authentication headers (JWT or Anonymous ID)
  const authHeader = await getAuthHeaders();
  
  const res = await fetch(url, { 
    headers: authHeader,
    cache: 'no-store' 
  });

  // Handle accepted status (sources not ready yet)
  if (res.status === 202) {
    // Check if we have a more detailed response
    try {
      const data = await res.json();
      if (data.detail === "Sources not ready yet") {
        return { phase: 'waiting', answer: null, sources: [], bibliography: [] };
      }
      
      // Handle case where answer might be available but status code is 202
      if (data.answer) {
        return {
          phase: 'answer',
          answer: data.answer || '',
          sources: data.sources || [],
          bibliography: data.bibliography || [],
        };
      }
    } catch (e) {
      // If no valid JSON or parsing error, default to waiting
      return { phase: 'waiting', answer: null, sources: [], bibliography: [] };
    }
    
    return { phase: 'waiting', answer: null, sources: [], bibliography: [] };
  }

  if (!res.ok) {
    throw new Error(`Status error: ${res.status}`);
  }

  const data = await res.json();

  // Sources ready, answer not ready
  if (data.phase === 'sources') {
    return {
      phase: 'sources',
      answer: null,
      sources: data.sources || [],
      bibliography: [],
    };
  }

  // Answer ready
  if (data.phase === 'answer') {
    return {
      phase: 'answer',
      answer: data.answer || '',
      sources: data.sources || [],
      bibliography: data.bibliography || [],
    };
  }
  
  // Completed (answer + bibliography ready)
  if (data.phase === 'completed') {
    return {
      phase: 'completed',
      answer: data.answer || '',
      sources: data.sources || [],
      bibliography: data.bibliography || [],
    };
  }

  // Default case, return waiting phase
  return { phase: 'waiting', answer: null, sources: [], bibliography: [] };
}

/**
 * Stream search status updates from the backend
 * This function uses Server-Sent Events to get real-time updates from the /search/stream endpoint
 */
export async function* streamSearchStatus(taskId: string): AsyncGenerator<any, void, unknown> {
  // Gunakan endpoint /search/stream yang konsisten dengan backend
  const streamUrl = `/api/proxy/search/stream/${taskId}`;
  console.log(`Starting SSE stream for task: ${taskId}`);
  
  try {
    console.log(`Fetching stream from: ${streamUrl}`);
    
    // Get authentication headers (JWT or Anonymous ID)
    const authHeader = await getAuthHeaders();
    
    const response = await fetch(streamUrl, {
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
        ...authHeader,
      },
      // Make sure we don't cache this request
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`Stream error: ${response.status} ${response.statusText}`);
      throw new Error(`Stream error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No reader available');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('SSE stream completed');
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              yield data;
            } catch (e) {
              console.warn('Failed to parse SSE data:', line);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    console.error('SSE stream error:', error);
    
    // Log the streaming error
    try {
      await logSearchQuery({
        query: `Stream for task: ${taskId}`,
        year: null,
        mode: null,
        status: "error"
      });
    } catch (logError) {
      console.error('Failed to log streaming error:', logError);
    }
    
    // Jika stream gagal, coba kirim ulang permintaan dengan backoff exponential
    console.log(`Stream failed, retrying with exponential backoff for task: ${taskId}`);
    try {
      // Gunakan endpoint /search/stream yang konsisten dengan backend
      const streamUrl = `/api/proxy/search/stream/${taskId}`;
      
      // Implementasi backoff exponential (coba beberapa kali dengan jeda yang meningkat)
      for (let retryCount = 0; retryCount < 3; retryCount++) {
        // Tunggu sebelum mencoba lagi (exponential backoff)
        const waitMs = Math.pow(2, retryCount) * 1000;
        console.log(`Waiting ${waitMs}ms before retry ${retryCount + 1}...`);
        await new Promise(resolve => setTimeout(resolve, waitMs));
        
        console.log(`Retrying stream endpoint (attempt ${retryCount + 1}): ${streamUrl}`);
        
        // Fetch dengan header yang lebih lengkap
        const retryResponse = await fetch(streamUrl, { 
          cache: 'no-store',
          headers: {
            'Accept': 'text/event-stream',
            'Cache-Control': 'no-cache',
          }
        });
        
        if (retryResponse.ok) {
          // Jika kita mendapatkan respon OK, kita perlu memparsing data SSE
          const reader = retryResponse.body?.getReader();
          if (!reader) {
            console.error('No reader available for retry response');
            continue; // Coba lagi di iterasi berikutnya
          }

          const decoder = new TextDecoder();
          let buffer = '';

          try {
            const { done, value } = await reader.read();
            if (!done && value) {
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6));
                    console.log(`Retry successful, got data:`, data);
                    yield data;
                    return; // Berhasil mendapatkan data, keluar dari fungsi
                  } catch (e) {
                    console.warn('Failed to parse SSE data from retry:', line);
                  }
                }
              }
            }
          } finally {
            reader.releaseLock();
          }
        } else {
          console.error(`Retry attempt ${retryCount + 1} failed with status: ${retryResponse.status}`);
        }
      }
      
      console.error('All retry attempts failed for stream endpoint');
      
      // Jika semua percobaan gagal, beri tahu pengguna
      yield {
        phase: "error",
        message: "Tidak dapat terhubung ke endpoint streaming setelah beberapa percobaan",
        error: "Stream connection failed after multiple retries"
      };
    
    } catch (fallbackError) {
      console.error('Fallback status request failed:', fallbackError);
    }
    
    throw error;
  }
}

/**
 * Get the final answer for a completed search
 * This may return a more polished answer compared to the initial response
 */
export async function getFinalAnswer(taskId: string): Promise<AnswerResponse> {
  const url = getProxyUrl(`/answer/${taskId}`);
  
  // Get authentication headers (JWT or Anonymous ID)
  const authHeader = await getAuthHeaders();
  
  const res = await fetch(url, { 
    headers: authHeader,
    cache: 'no-store' 
  });
  
  if (!res.ok) throw new Error(`Answer error: ${res.status}`);
  return res.json();
}

/**
 * Interface for bibliography response from the API
 * Each entry in the bibliography array is a formatted citation string
 */
export interface BibliographyResponse {
  bibliography: string[];  // Array of formatted citation strings
  fallback?: boolean;      // Flag indicating if fallback mode is used
  error?: string;          // Optional error message
}

/**
 * Get bibliography data for a completed search task
 * @param taskId The ID of the search task
 * @param referenceData Optional reference data to match with bibliography entries
 * @returns Bibliography entries, filtered by reference data if provided
 */
export async function getBibliography(
  taskId: string, 
  referenceData?: { title?: string, authors?: string[], year?: number }
): Promise<BibliographyResponse> {
  try {
    const url = getProxyUrl(`/bibliography/${taskId}`);
    console.log(`Fetching bibliography from: ${url}`);
    
    // Get authentication headers (JWT or Anonymous ID)
    const authHeader = await getAuthHeaders();
    
    const response = await fetch(url, {
      headers: authHeader,
      cache: 'no-store'
    });

    if (!response.ok) {
      // If task not found or not completed, return empty bibliography
      if (response.status === 404 || response.status === 400) {
        console.warn(`Bibliography not available for task ${taskId}: ${response.statusText}`);
        return { bibliography: [] };
      }
      throw new Error(`Error getting bibliography: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Check if we got a fallback error from the proxy
    if (data.fallback === true && data.error) {
      console.warn(`Bibliography error: ${data.error}`);
      return { bibliography: [] };
    }

    // If reference data is provided, filter the bibliography to find matching entries
    if (referenceData && data.bibliography && Array.isArray(data.bibliography)) {
      // Filter bibliography entries that match the current reference
      const filteredBibliography = data.bibliography.filter((citation: string) => {
        // Convert to lowercase for case-insensitive matching
        const citationLower = citation.toLowerCase();
        
        // Check if the citation contains the reference title
        if (referenceData.title && citationLower.includes(referenceData.title.toLowerCase())) {
          return true;
        }
        
        // Check if the citation contains the reference year
        if (referenceData.year && citationLower.includes(referenceData.year.toString())) {
          return true;
        }
        
        // Check if the citation contains any of the authors
        if (referenceData.authors && referenceData.authors.length > 0) {
          const authorMatch = referenceData.authors.some(author => 
            citationLower.includes(author.toLowerCase())
          );
          if (authorMatch) return true;
        }
        
        return false;
      });
      
      return { bibliography: filteredBibliography };
    }
    
    return data;
  } catch (error) {
    console.error(`Error getting bibliography for task ${taskId}:`, error);
    // Return empty array instead of throwing to make this non-blocking
    return { bibliography: [] };
  }
}
/**
 * Create a proxy URL for API requests from the browser
 * This helps avoid CORS issues by routing through Next.js API routes
 */
export function getProxyUrl(path: string): string {
  // Make sure path starts with a slash
  const formattedPath = path.startsWith('/') ? path : `/${path}`;
  
  // For client-side code, use the API route
  if (typeof window !== 'undefined') {
    return `/api/proxy${formattedPath}`;
  }
  
  // For server-side code, use the direct URL
  return `${baseApiUrl}${formattedPath}`;
}
