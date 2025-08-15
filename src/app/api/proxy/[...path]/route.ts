import { NextRequest, NextResponse } from 'next/server';

// Make sure API_URL is properly formatted with https:// if not present
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
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
    
    // Construct the backend URL, ensuring proper URL format
    let apiUrl = API_URL;
    
    // Check if API_URL is empty or undefined in Vercel environment
    if (!apiUrl || apiUrl.trim() === '') {
      // Hardcode the URL in production as a fallback
      apiUrl = 'http://0.0.0.0:8000';
      console.log('Empty API_URL, using hardcoded fallback:', apiUrl);
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
    });
    
    // Get the response data
    const data = await response.json();
    
    // Return the response from the backend
    return NextResponse.json(data, {
      status: response.status,
    });
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
