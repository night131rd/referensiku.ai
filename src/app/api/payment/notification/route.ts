import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../../supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the notification payload from Midtrans
    const payload = await request.json();

    console.log('Received Midtrans notification:', payload);

    // Basic validation: compute signature_key according to Midtrans docs
    const orderId = payload.order_id;
    const statusCode = String(payload.status_code || '');
    const grossAmount = String(payload.gross_amount || payload.gross_amount || '');
    const signature = payload.signature_key;

    if (!orderId || !statusCode || !grossAmount || !signature) {
      console.warn('Notification missing required fields');
      return NextResponse.json({ status: 'error', message: 'Missing required fields' }, { status: 400 });
    }

    // Get server key from environment
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      console.error('MIDTRANS_SERVER_KEY not configured');
      return NextResponse.json({ status: 'error', message: 'Server configuration error' }, { status: 500 });
    }

    // Compute signature for validation
    const toHash = orderId + statusCode + grossAmount + serverKey;
    const crypto = await import('crypto');
    const computed = crypto.default.createHash('sha512').update(toHash).digest('hex');

    if (computed !== signature) {
      console.warn('Invalid signature in Midtrans notification');
      return NextResponse.json({ status: 'error', message: 'Invalid signature' }, { status: 400 });
    }

    // Upsert transaction record to Supabase
    const insertPayload = {
      order_id: orderId,
      transaction_status: payload.transaction_status,
      status_code: payload.status_code,
      gross_amount: payload.gross_amount,
      payment_type: payload.payment_type,
      signature_key: payload.signature_key,
      raw: payload,
      received_at: new Date().toISOString()
    };

    const { error: upsertError } = await supabase
      .from('transactions')
      .upsert(insertPayload, { onConflict: 'order_id' });

    if (upsertError) {
      console.error('Failed to upsert notification into Supabase:', upsertError);
      return NextResponse.json({ status: 'error', message: 'Database error' }, { status: 500 });
    }

    // Business logic: if transaction settled, grant premium
    const txStatus = payload.transaction_status;
    if (txStatus === 'settlement' || txStatus === 'capture') {
      // Try to extract user id from order_id if encoded like 'user:{user_id}:{timestamp}'
      let userId = null;
      if (orderId && orderId.startsWith('user:')) {
        try {
          userId = orderId.split(':')[1];
        } catch (error) {
          console.error('Error parsing user ID from order_id:', error);
        }
      }

      if (userId) {
        try {
          // Update user's role to premium
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ role: 'premium' })
            .eq('id', userId);

          if (updateError) {
            console.error('Failed to update user role to premium:', updateError);
            return NextResponse.json({ status: 'error', message: 'Failed to update user role' }, { status: 500 });
          }

          console.log(`Set user ${userId} to premium based on payment ${orderId}`);
        } catch (error) {
          console.error(`Failed to update user role to premium for user ${userId}:`, error);
          return NextResponse.json({ status: 'error', message: 'Failed to update user role' }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ status: 'ok' });

  } catch (error) {
    console.error('Error processing Midtrans notification:', error);
    return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 500 });
  }
}
