import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const { taskId } = params;
  
  // Get the backend URL from environment variables
  let baseApiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  
  // Add https:// if it doesn't have a protocol
  if (!baseApiUrl.startsWith('http://') && !baseApiUrl.startsWith('https://')) {
    baseApiUrl = `https://${baseApiUrl}`;
  }
  
  // Remove any trailing slashes
  baseApiUrl = baseApiUrl.replace(/\/+$/, '');
  
  // Force local API URL for development if the environment variable is empty
  if (!baseApiUrl || baseApiUrl.trim() === '') {
    baseApiUrl = 'http://127.0.0.1:8000';
    console.log('Empty API_URL, using local default:', baseApiUrl);
  }
  
  // Gunakan endpoint /search/stream yang sesuai dengan implementasi backend
  const backendUrl = `${baseApiUrl}/search/stream/${taskId}`;
  
  try {
    console.log(`Proxying stream request to: ${backendUrl}`);
    
    // Fetch data dari endpoint /search/stream yang menggunakan Server-Sent Events
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
      // Make sure we don't cache this request
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`Backend stream error: ${response.status} ${response.statusText}`);
      
      // Jika endpoint stream menghasilkan error, kita tetap gunakan error code asli
      return NextResponse.json(
        { 
          error: `Backend error: ${response.statusText}`,
          message: "Tidak dapat terhubung ke endpoint stream"
        },
        { status: response.status }
      );
    }

    // Create a ReadableStream that proxies the backend stream
    const readable = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              controller.close();
              break;
            }
            
            controller.enqueue(value);
          }
        } catch (error) {
          console.error('Stream proxy error:', error);
          controller.error(error);
        } finally {
          reader.releaseLock();
        }
      }
    });

    // Return the stream response
    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    });

  } catch (error) {
    console.error('Proxy stream error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to backend stream' },
      { status: 500 }
    );
  }
}