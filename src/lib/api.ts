/**
 * API client for interacting with the backend
 */

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
  fallback?: boolean;
  error?: string;
}

// Ensure API_URL has the correct format with https:// prefix
let baseApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
  }
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
