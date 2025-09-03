# Anonymous Quota Tracking System

This system tracks search quota usage for both authenticated and anonymous users.

## Overview

- **Authenticated users**: Quota tracked in the `profiles` table with direct link to auth.users
- **Anonymous users**: Quota tracked in the `anonymous_quota` table using a client-generated ID

## Implementation Details

### Database Tables

1. **profiles**: Stores data for authenticated users
   - `id`: UUID linked to auth.users
   - `email`: User's email address
   - `role`: User role ('free', 'premium')
   - `sisa_quota`: Remaining search quota
   - ...other fields

2. **anonymous_quota**: Stores data for guest users
   - `anonymous_id`: Client-generated ID stored in localStorage
   - `role`: Always 'guest'
   - `sisa_quota`: Remaining search quota (default: 3)
   - `last_active`: Last activity timestamp

### Frontend Implementation

1. The system checks if a user is authenticated:
   - If authenticated, quota is retrieved from the `profiles` table
   - If not authenticated, quota is retrieved from the `anonymous_quota` table

2. Quota tracking:
   - For authenticated users, the backend updates `profiles.sisa_quota`
   - For anonymous users, the backend updates `anonymous_quota.sisa_quota`

3. Anonymous ID tracking:
   - The frontend generates a random ID for each browser instance
   - This ID is stored in localStorage as 'anonymousId'
   - The ID is included in all API requests as 'X-Anonymous-Id' header

### Quota Refreshing

The frontend periodically polls Supabase to get the latest quota information:
- Polls every 30 seconds
- Updates the UI with the latest quota information
- Ensures consistency with the backend

## Usage Flow

1. User opens the website
2. System checks authentication status:
   - If authenticated, gets quota from profiles
   - If anonymous, gets or creates entry in anonymous_quota
3. User makes search requests
4. Backend decrements quota and returns updated values
5. Frontend refreshes quota display

## Conversion from Anonymous to Authenticated

When an anonymous user registers or logs in, their search history and quota can be preserved by:
1. Backend linking the anonymous_id to the new user account
2. Setting initial quota based on previous anonymous usage
