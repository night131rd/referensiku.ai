import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../../supabase/server';

// Get base URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user using getUser() for security
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();

    // Prepare payment request to our backend
    const paymentRequest = {
      order_id: `user:${user.id}:${Date.now()}`,
      description: body.description || "ReferensikuAI Premium Subscription",
      user_id: user.id
    };

    // Check if backend URL is configured
    if (!API_URL) {
      console.error('NEXT_PUBLIC_API_URL not configured');
      return NextResponse.json(
        { error: 'Payment service not configured' },
        { status: 500 }
      );
    }

    // Make request to our backend payment endpoint with timeout
    const backendUrl = `${API_URL}/payment/create`;
    console.log('Making payment request to:', backendUrl);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}` // Use user ID for backend auth
        },
        body: JSON.stringify(paymentRequest),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Payment gateway error:', errorText);
        return NextResponse.json(
          { error: 'Failed to initialize payment', details: errorText },
          { status: response.status }
        );
      }

      // Return the response from our backend
      const paymentData = await response.json();
      return NextResponse.json(paymentData);

    } catch (fetchError) {
      clearTimeout(timeoutId);

      if ((fetchError as Error).name === 'AbortError') {
        console.error('Payment request timed out');
        return NextResponse.json(
          { error: 'Payment service timeout. Please try again.' },
          { status: 504 }
        );
      }

      console.error('Payment request failed:', fetchError);
      return NextResponse.json(
        { error: 'Failed to contact payment gateway' },
        { status: 502 }
      );
    }

  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}