import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Replace deprecated config with the new runtime directive
export const runtime = "edge";

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
    
    // Construct the backend URL
    const backendUrl = `${API_URL}${pathSegment}${searchParams}`;
    
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
    
    return NextResponse.json(
      { error: 'Failed to connect to backend API' },
      { status: 500 }
    );
  }
}
