# Setting Up Google Authentication with Supabase

This guide will help you enable Google authentication for your Referensiku.ai application using Supabase.

## Step 1: Set Up a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Navigate to "APIs & Services" > "Credentials".
4. Click on "Configure Consent Screen" and select "External" as the user type.
5. Fill out the required information for your app.
6. On the scopes step, add the following scopes:
   - `./auth/userinfo.email`
   - `./auth/userinfo.profile`
7. Complete the OAuth consent screen setup.

## Step 2: Create OAuth Credentials

1. In the Google Cloud Console, navigate to "APIs & Services" > "Credentials".
2. Click "Create Credentials" and select "OAuth client ID".
3. Select "Web application" as the application type.
4. Add a name for your OAuth client, like "Referensiku.ai Web App".
5. Under "Authorized JavaScript origins", add your application's URL (e.g., `http://localhost:3000` for local development).
6. Under "Authorized redirect URIs", add your Supabase authentication callback URL:
   - `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
7. Click "Create" to generate your OAuth client ID and client secret.

## Step 3: Configure Supabase Auth

1. Go to your [Supabase dashboard](https://app.supabase.com/).
2. Select your project for Referensiku.ai.
3. Navigate to "Authentication" > "Providers".
4. Find "Google" in the list of providers and click "Edit".
5. Toggle the switch to enable Google authentication.
6. Enter the OAuth client ID and client secret from the Google Cloud Console.
7. Save the changes.

## Step 4: Update Your Application's Redirect URLs

Ensure your application's callback URL is correctly set up in your Supabase project settings:

1. In your Supabase dashboard, go to "Authentication" > "URL Configuration".
2. Set the "Site URL" to your application's base URL (e.g., `http://localhost:3000`).
3. Add any additional redirect URLs as needed for different environments.

## Testing

To test the integration:

1. Run your application locally.
2. Navigate to the sign-in page.
3. Click the "Sign in with Google" button.
4. You should be redirected to Google's authentication page.
5. After successful authentication, you should be redirected back to your application.

## Troubleshooting

### Common Issues and Solutions

- **Redirect URI Mismatch**: 
  - Error message: "Error 400: redirect_uri_mismatch"
  - Solution: Ensure your redirect URI `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback` is exactly as listed in the Google Cloud Console. Check for any typos or trailing slashes.

- **Missing or Invalid Client ID/Secret**:
  - Error message: "Invalid OAuth client ID" or "Invalid Credentials"
  - Solution: Double-check that you've correctly copied your Client ID and Client Secret from Google Cloud Console to Supabase.

- **Domain Verification**:
  - Issue: Your app is in testing mode and only authorized users can sign in
  - Solution: Add test users in the Google Cloud Console or complete the verification process for your domain.

- **Supabase Configuration**:
  - Issue: Google login button doesn't redirect to Google
  - Solution: Verify that Google provider is enabled in Supabase Authentication settings.

- **Callback Processing**:
  - Issue: Successfully redirected to Google but get errors after authentication
  - Solution: Check the browser console and server logs for specific errors. Verify that your code correctly handles the callback parameters.

- **React Form Submission Error**:
  - Error message: "Uncaught Error: A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead."
  - Issue: This occurs when the Google sign-in button is inside another form element or when it's a form itself inside another form
  - Solution: Change the Google sign-in button to use onClick handler with preventDefault() instead of wrapping it in a form. Make sure to use type="button" instead of type="submit".

- **NEXT_REDIRECT Error**:
  - Error message: "POST /sign-in?error=An%20unexpected%20error%20occurred%3A%20NEXT_REDIRECT 303"
  - Issue: This error occurs when using Next.js server actions for redirects in client components
  - Solution: Use a dedicated API route for handling the OAuth flow instead of calling the server action directly from the client. Set up an API endpoint (e.g., `/api/auth/google`) and redirect to it using `window.location.href`.

### Advanced Debugging

1. **Enable Debug Logging**: The application has debug logging enabled to help diagnose issues. Check your console logs for messages starting with "Auth callback" or "Google sign-in".

2. **Check Cookies**: Authentication issues can sometimes be related to cookies. Try clearing your browser cookies and cache.

3. **Network Requests**: Use your browser's developer tools to inspect network requests, particularly focusing on:
   - The initial redirect to Google
   - The callback to your application
   - Any API calls to Supabase

4. **Environment Variables**: Ensure all required environment variables are set:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

5. **Database Schema**: Make sure your database has a 'users' table with all the fields expected in the callback code.

If you continue experiencing issues after trying these steps, check the Supabase documentation for any updates or known issues with Google OAuth integration.
