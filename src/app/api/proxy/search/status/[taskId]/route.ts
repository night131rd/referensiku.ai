import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const taskId = params.taskId;
  
  try {
    // Proxy to backend - gunakan endpoint yang konsisten /search/stream
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://127.0.0.1:8000';
    const url = `${backendUrl}/search/stream/${encodeURIComponent(taskId)}`;
    
    console.log(`Proxying GET request to: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error(`Backend responded with status: ${response.status}`);
      return NextResponse.json(
        { error: 'Backend error', status: response.status },
        { status: response.status }
      );
    }

    // Untuk stream endpoint, kita perlu memparsing data SSE
    const reader = response.body?.getReader();
    if (!reader) {
      return NextResponse.json(
        { error: 'No reader available for stream response' },
        { status: 500 }
      );
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let eventData = null;

    try {
      // Baca satu event saja
      const { done, value } = await reader.read();
      if (!done && value) {
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              eventData = JSON.parse(line.slice(6));
              break;
            } catch (e) {
              console.warn('Failed to parse SSE data:', line);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    if (eventData) {
      return NextResponse.json(eventData);
    } else {
      return NextResponse.json(
        { 
          phase: "waiting", 
          message: "Belum ada data dari endpoint stream",
          sources: [],
          bibliography: [] 
        },
        { status: 202 }
      );
    }
    
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Proxy request failed' },
      { status: 500 }
    );
  }
}
