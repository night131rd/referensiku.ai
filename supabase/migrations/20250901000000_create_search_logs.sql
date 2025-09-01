-- Create search_logs table to track search queries
CREATE TABLE IF NOT EXISTS public.search_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query TEXT NOT NULL,
    year TEXT,
    mode TEXT,
    status TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.search_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to insert their own logs
CREATE POLICY "Users can insert their own logs" 
ON public.search_logs 
FOR INSERT 
TO authenticated
USING (auth.uid() = user_id);

-- Create policy to allow service role to insert logs for any user
CREATE POLICY "Service role can insert any logs" 
ON public.search_logs 
FOR INSERT 
TO service_role
USING (true);

-- Create policy to allow authenticated users to view their own logs
CREATE POLICY "Users can view their own logs" 
ON public.search_logs 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Create policy to allow service role to view all logs
CREATE POLICY "Service role can view all logs" 
ON public.search_logs 
FOR SELECT 
TO service_role
USING (true);
