/**
 * API client for interacting with the backend
 */

// Track active requests to avoid duplicates
const activeRequests = new Map<string, Promise<any>>();

export interface SearchResponse {
  task_id: string;
  status: string;
  message: string;
  fallback?: boolean;
  error?: string;
}

export interface SearchStatusResponse {
  status: string;
  message: string;
  completed: boolean;
  answer?: string;
  sources?: any[];
  fallback?: boolean;
  error?: string;
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
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          year: year || '-',
          mode
        }),
      });

      if (!response.ok) {
        throw new Error(`Error starting search: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Check if we got a fallback error from the proxy
      if (data.fallback === true && data.error) {
        throw new Error(data.error);
      }
      
      return data;
    } catch (error) {
      console.error('Search request failed:', error);
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
 */
export async function checkSearchStatus(taskId: string): Promise<NewSearchStatusResponse> {
  const url = getProxyUrl(`/search/status/${taskId}`);
  const res = await fetch(url, { cache: 'no-store' });

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
 * This function uses Server-Sent Events to get real-time updates
 */
export async function* streamSearchStatus(taskId: string): AsyncGenerator<any, void, unknown> {
  const url = getProxyUrl(`/search/stream/${taskId}`);
  console.log(`Starting SSE stream for task: ${taskId}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
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
    throw error;
  }
}

/**
 * Get the final answer for a completed search
 * This may return a more polished answer compared to the initial response
 */
export async function getFinalAnswer(taskId: string): Promise<AnswerResponse> {
  const url = getProxyUrl(`/answer/${taskId}`);
  const res = await fetch(url, { cache: 'no-store' });
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
    
    const response = await fetch(url);

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

/**
 * Utility function to debounce repeated calls
 * @param func The function to debounce
 * @param wait Time to wait in milliseconds before executing
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}
