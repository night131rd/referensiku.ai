# Payment System Documentation

This document explains how the payment system for upgrading users from free to premium works.

## Overview

The payment system integrates with Midtrans payment gateway to allow users to upgrade their accounts from free to premium. The system consists of:

1. **Frontend Components**: Upgrade button and payment success page
2. **API Routes**: Payment creation and notification handling
3. **Database**: Transactions table for storing payment records
4. **Backend Integration**: Your existing FastAPI backend with Midtrans integration

## Components

### 1. UpgradeButton Component (`src/components/upgrade-button.tsx`)

- Displays "Upgrade ke Premium" button next to the sign-in button
- Checks if user is authenticated before allowing payment
- Shows dialog asking user to sign in if not authenticated
- Creates payment request and redirects to Midtrans payment page
- Handles errors and loading states

### 2. Payment API Route (`src/app/api/payment/create/route.ts`)

- Receives payment creation requests from frontend
- Forwards requests to your backend `/payment/create` endpoint
- Handles authentication and error responses
- Returns redirect URL for Midtrans payment page

### 3. Notification Handler (`src/app/api/payment/notification/route.ts`)

- Receives webhook notifications from Midtrans
- Validates notification signatures
- Stores transaction data in Supabase `transactions` table
- Updates user role to 'premium' when payment is successful

### 4. Payment Success Page (`src/app/payment/success/page.tsx`)

- Checks user's premium status after payment
- Displays success message if user is now premium
- Shows processing message if payment is still being processed
- Provides navigation options

## Database Schema

### Transactions Table

```sql
CREATE TABLE public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id TEXT NOT NULL UNIQUE,
    transaction_status TEXT,
    status_code TEXT,
    gross_amount INTEGER,
    payment_type TEXT,
    signature_key TEXT,
    raw JSONB,
    received_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Profiles Table Updates

The system updates the `role` field in the existing `profiles` table:
- `free` → `premium` when payment is successful

## Flow

1. **User clicks "Upgrade ke Premium"**
   - System checks if user is authenticated
   - If not authenticated: shows sign-in dialog
   - If authenticated: proceeds to payment creation

2. **Payment Creation**
   - Frontend calls `/api/payment/create`
   - API route forwards to backend `/payment/create`
   - Backend creates Midtrans Snap transaction
   - User is redirected to Midtrans payment page

3. **Payment Processing**
   - User completes payment on Midtrans
   - Midtrans sends webhook to `/api/payment/notification`
   - System validates notification and updates user role
   - User is redirected to success page

4. **Success Handling**
   - Success page checks user's premium status
   - Displays appropriate message based on payment status

## Environment Variables

Add these to your `.env.local` file:

```env
# Midtrans Configuration
MIDTRANS_SERVER_KEY=your_midtrans_server_key_here
MIDTRANS_IS_PRODUCTION=false

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Supabase (if not already set)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Backend Requirements

Your FastAPI backend needs to have these endpoints:

1. **POST `/payment/create`** - Creates Midtrans Snap transaction
2. **POST `/payment/notification`** - Handles Midtrans webhooks

The backend code you provided should work with these endpoints.

## Testing

1. **Development Testing**:
   - Set `MIDTRANS_IS_PRODUCTION=false` in environment
   - Use Midtrans sandbox credentials
   - Test with test payment methods

2. **Production Deployment**:
   - Set `MIDTRANS_IS_PRODUCTION=true`
   - Use production Midtrans credentials
   - Configure webhook URL in Midtrans dashboard

## Security Considerations

1. **Webhook Validation**: The notification handler validates Midtrans signatures
2. **Row Level Security**: Database policies restrict access to transaction data
3. **Authentication**: Payment creation requires user authentication
4. **Order ID Encoding**: User IDs are encoded in order IDs for security

## Troubleshooting

### Common Issues

1. **"Cannot find module" errors**: Check import paths are correct
2. **Payment creation fails**: Check API URL and backend connectivity
3. **Webhook not received**: Verify webhook URL in Midtrans dashboard
4. **User role not updated**: Check notification handler logs

### Debug Steps

1. Check browser console for frontend errors
2. Check server logs for API route errors
3. Verify environment variables are set correctly
4. Test backend endpoints directly with tools like Postman
