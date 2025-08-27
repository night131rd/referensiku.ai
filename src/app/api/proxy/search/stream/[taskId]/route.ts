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
  
  const backendUrl = `${baseApiUrl}/search/stream/${taskId}`;
  
  try {
    console.log(`Proxying stream request to: ${backendUrl}`);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      console.error(`Backend stream error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `Backend error: ${response.statusText}` },
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
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
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
