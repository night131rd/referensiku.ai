-- Create user_feedback table
CREATE TABLE IF NOT EXISTS public.user_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- 'bug', 'suggestion', 'general'
    message TEXT NOT NULL,
    email TEXT,
    page_url TEXT,
    user_agent TEXT,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    status TEXT DEFAULT 'new'
);

-- Allow anonymous insertions (no authentication required)
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert feedback
CREATE POLICY "Anyone can insert feedback" 
ON public.user_feedback 
FOR INSERT 
TO authenticated, anon
USING (true);

-- Only allow service role and admin to view feedback
CREATE POLICY "Only service role can view feedback" 
ON public.user_feedback 
FOR SELECT 
TO service_role
USING (true);
