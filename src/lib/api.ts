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

// Get the API URL based on environment (server vs client)
function getBaseApiUrl(): string {
  // When running in a server environment like Vercel
  if (typeof window === 'undefined') {
    // On server side in production, always use the HTTPS URL
    if (process.env.NODE_ENV === 'production') {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      // Format the URL properly
      if (!apiUrl) return 'https://referensiku-backend-production.up.railway.app';
      if (!apiUrl.startsWith('http')) return `https://${apiUrl.replace(/\/+$/, '')}`;
      return apiUrl.replace(/\/+$/, '');
    }
    // In development server, use localhost
    return 'http://localhost:8000';
  }
  
  // Client-side: always use the API proxy route to avoid CORS
  return '';
}

/**
 * Start a search request to the backend
 */
export async function startSearch(query: string, year?: string, mode: string = 'quick'): Promise<SearchResponse> {
  try {
    // Server-side fallback in production to prevent attempting localhost connections
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
      console.log('Server-side search detected in production, using mock response');
      // Return a mock response for server-side rendering in production
      return {
        task_id: 'mock-task-' + Date.now(),
        status: 'pending',
        message: 'Search started',
      };
    }
    
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
    console.error('API URL used:', getBaseApiUrl());
    
    // In production, return a fallback response instead of crashing
    if (process.env.NODE_ENV === 'production') {
      return {
        task_id: 'error-task-' + Date.now(),
        status: 'error',
        message: 'Failed to connect to search service',
        fallback: true,
        error: error instanceof Error ? error.message : String(error)
      };
    }
    
    throw error;
  }
}

/**
 * Check the status of a search task
 */
export async function checkSearchStatus(taskId: string): Promise<SearchStatusResponse> {
  try {
    // Handle mock task IDs from server-side rendering
    if (taskId.startsWith('mock-task-') && process.env.NODE_ENV === 'production') {
      return {
        status: 'completed',
        message: 'Search completed',
        completed: true,
        answer: 'This is a mock answer for server-side rendering.',
        sources: []
      };
    }
    
    // Handle error task IDs
    if (taskId.startsWith('error-task-')) {
      return {
        status: 'error',
        message: 'Search failed',
        completed: true,
        answer: 'Sorry, we could not complete your search. Please try again later.',
        sources: []
      };
    }
    
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
    
    // In production, return a fallback response instead of crashing
    if (process.env.NODE_ENV === 'production') {
      return {
        status: 'error',
        message: 'Failed to check search status',
        completed: true,
        answer: 'Sorry, we could not retrieve your search results. Please try again later.',
        sources: [],
        fallback: true,
        error: error instanceof Error ? error.message : String(error)
      };
    }
    
    throw error;
  }
}

/**
 * Get the answer for a completed search
 */
export async function getAnswer(taskId: string): Promise<AnswerResponse> {
  try {
    // Handle mock task IDs from server-side rendering
    if (taskId.startsWith('mock-task-') && process.env.NODE_ENV === 'production') {
      return {
        answer: 'This is a mock answer for server-side rendering.',
        sources: [
          {
            title: "Server-side Rendering in Next.js",
            author: "Next.js Team",
            year: "2025",
            journal: "WEB DEVELOPMENT JOURNAL",
            abstract: "A mock reference for server-side rendering fallback."
          }
        ]
      };
    }
    
    // Handle error task IDs
    if (taskId.startsWith('error-task-')) {
      return {
        answer: 'Sorry, we could not complete your search. Please try again later.',
        sources: []
      };
    }
    
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
    
    // In production, return a fallback response instead of crashing
    if (process.env.NODE_ENV === 'production') {
      return {
        answer: 'Sorry, we could not retrieve your answer. Please try again later.',
        sources: [],
        fallback: true,
        error: error instanceof Error ? error.message : String(error)
      };
    }
    
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
  
  // For server-side code, use the direct URL with the base API URL
  const baseUrl = getBaseApiUrl();
  return `${baseUrl}${formattedPath}`;
}
