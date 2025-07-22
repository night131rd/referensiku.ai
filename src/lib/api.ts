/**
 * API client for interacting with the backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface SearchResponse {
  task_id: string;
  status: string;
  message: string;
}

export interface SearchStatusResponse {
  status: string;
  message: string;
  completed: boolean;
  answer?: string;
  sources?: any[];
}

export interface AnswerResponse {
  answer: string;
  sources: any[];
}

/**
 * Start a search request to the backend
 */
export async function startSearch(query: string, year?: string, mode: string = 'quick'): Promise<SearchResponse> {
  const response = await fetch(`${API_URL}/search`, {
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

  return response.json();
}

/**
 * Check the status of a search task
 */
export async function checkSearchStatus(taskId: string): Promise<SearchStatusResponse> {
  const response = await fetch(`${API_URL}/search/status/${taskId}`);

  if (!response.ok) {
    throw new Error(`Error checking search status: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get the answer for a completed search
 */
export async function getAnswer(taskId: string): Promise<AnswerResponse> {
  const response = await fetch(`${API_URL}/answer/${taskId}`);

  if (!response.ok) {
    throw new Error(`Error getting answer: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Create a proxy URL for API requests from the browser
 * This helps avoid CORS issues by routing through Next.js API routes
 */
export function getProxyUrl(path: string): string {
  // For client-side code, use the API route
  if (typeof window !== 'undefined') {
    return `/api/proxy${path}`;
  }
  
  // For server-side code, use the direct URL
  return `${API_URL}${path}`;
}
