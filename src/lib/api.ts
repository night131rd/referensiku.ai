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
let baseApiUrl = process.env.NEXT_PUBLIC_API_URL || 'msdocs-python-webapp-quickstart-jurnalgpt-cygwdjf5bhfgdmeg.indonesiacentral-01.azurewebsites.net';

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
 * Check the status of a search task
 */
export async function checkSearchStatus(taskId: string): Promise<SearchStatusResponse> {
  try {
    const url = getProxyUrl(`/search/status/${taskId}`);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error checking search status: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Check if we got a fallback error from the proxy
    if (data.fallback === true && data.error) {
      throw new Error(data.error);
    }
    
    return data;
  } catch (error) {
    console.error(`Error checking status for task ${taskId}:`, error);
    throw error;
  }
}

/**
 * Get the answer for a completed search
 */
export async function getAnswer(taskId: string): Promise<AnswerResponse> {
  try {
    const url = getProxyUrl(`/answer/${taskId}`);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error getting answer: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Check if we got a fallback error from the proxy
    if (data.fallback === true && data.error) {
      throw new Error(data.error);
    }
    
    return data;
  } catch (error) {
    console.error(`Error getting answer for task ${taskId}:`, error);
    throw error;
  }
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
