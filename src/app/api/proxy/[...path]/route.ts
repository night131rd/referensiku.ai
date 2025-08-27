import { NextRequest, NextResponse } from 'next/server';

// Make sure API_URL is properly formatted with https:// if not present
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
console.log('Proxy route using API_URL:', API_URL);

// Replace deprecated config with the new runtime directive
export const runtime = "edge";

// Force dynamic rendering to fix the static generation error
export const dynamic = 'force-dynamic';

/**
 * Proxy API requests to the backend to avoid CORS issues
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(req, params);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(req, params);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(req, params);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(req, params);
}

async function handleRequest(req: NextRequest, { path }: { path: string[] }) {
  try {
    // Extract the path from the URL
    const url = new URL(req.url);
    const pathSegment = '/' + path.join('/');
    const searchParams = url.search;
    
    // Create a cache key for GET requests
    const isCacheable = req.method === 'GET';
    const cacheKey = isCacheable ? `api-${pathSegment}${searchParams}` : '';
    
    // Construct the backend URL, ensuring proper URL format
    let apiUrl = API_URL;
    
    // Check if API_URL is empty or undefined in Vercel environment
    if (!apiUrl || apiUrl.trim() === '') {
      // Use a safe local default to avoid proxying to Next.js pages
      apiUrl = 'http://127.0.0.1:8000';
      console.log('Empty API_URL, using local default:', apiUrl);
    }
    
    // Remove trailing slashes from API_URL
    apiUrl = apiUrl.replace(/\/+$/, '');
    
    // Make sure URL has proper protocol
    if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
      apiUrl = `https://${apiUrl}`;
    }

    const backendUrl = `${apiUrl}${pathSegment}${searchParams}`;
    console.log('Final backend URL:', backendUrl);
    
    console.log(`Proxying ${req.method} request to: ${backendUrl}`);
    
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
      // Prevent caching in the fetch call itself to avoid stale data
      cache: 'no-store',
    });

    // Detect SSE endpoint either by path or by Accept header/content-type
    const acceptHeader = req.headers.get('accept') || '';
    const contentType = response.headers.get('content-type') || '';
    const isSsePath = pathSegment.includes('/search/stream');
    const isSse = isSsePath || acceptHeader.includes('text/event-stream') || contentType.includes('text/event-stream');

    if (isSse) {
      // Pass-through streaming response for SSE
      const sseHeaders = new Headers();
      sseHeaders.set('Content-Type', 'text/event-stream');
      sseHeaders.set('Cache-Control', 'no-cache');
      sseHeaders.set('Connection', 'keep-alive');

      // Preserve CORS if present from backend
      const allowOrigin = response.headers.get('access-control-allow-origin');
      if (allowOrigin) sseHeaders.set('Access-Control-Allow-Origin', allowOrigin);

      return new Response(response.body, {
        status: response.status,
        headers: sseHeaders,
      });
    }
    
    // Get the response data (non-SSE)
    const data = await response.json();
    
    // Create the response object
    const jsonResponse = NextResponse.json(data, {
      status: response.status,
      // Add cache-control header for client-side caching
      headers: isCacheable ? {
        'Cache-Control': 'public, max-age=60, s-maxage=60', // Cache for 60 seconds
      } : {}
    });
    
    // Return the response from the backend
    return jsonResponse;
  } catch (error) {
    console.error('API proxy error:', error);
    
    // Return detailed error information in development
    const errorMessage = process.env.NODE_ENV === 'development'
      ? `Failed to connect to backend API: ${error instanceof Error ? error.message : String(error)}`
      : 'Failed to connect to backend API';
    
    // Include API URL in logs for debugging
    console.error(`API URL used: ${API_URL}`);
    
    return NextResponse.json(
      { 
        error: errorMessage,
        fallback: true
      },
      { status: 500 }
    );
  }
}
