import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const config = {
  runtime: 'edge',
};

/**
 * Proxy API requests to the backend to avoid CORS issues
 */
export default async function handler(req: NextRequest) {
  try {
    // Extract the path from the URL (remove /api/proxy)
    const url = new URL(req.url);
    const path = url.pathname.replace('/api/proxy', '');
    const searchParams = url.search;
    
    // Construct the backend URL
    const backendUrl = `${API_URL}${path}${searchParams}`;
    
    // Forward the request headers
    const headers = new Headers();
    req.headers.forEach((value, key) => {
      // Skip host header to avoid conflicts
      if (key.toLowerCase() !== 'host') {
        headers.set(key, value);
      }
    });
    
    // Add content-type if not present
    if (!headers.has('content-type') && req.method !== 'GET') {
      headers.set('content-type', 'application/json');
    }
    
    // Forward the request to the backend
    const response = await fetch(backendUrl, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
    });
    
    // Get the response data
    const data = await response.json();
    
    // Return the response from the backend
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error('API proxy error:', error);
    
    return NextResponse.json(
      { error: 'Failed to connect to backend API' },
      { status: 500 }
    );
  }
}
