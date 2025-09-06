-- Create newsletter_subscriptions table
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text NOT NULL UNIQUE,
    subscribed_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (for newsletter signup)
CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscriptions
    FOR INSERT WITH CHECK (true);

-- Create policy to allow service role to manage subscriptions
CREATE POLICY "Service role can manage subscriptions" ON public.newsletter_subscriptions
    FOR ALL USING (auth.role() = 'service_role');

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_email ON public.newsletter_subscriptions(email);

-- Create index on subscribed_at for analytics
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_subscribed_at ON public.newsletter_subscriptions(subscribed_at);
