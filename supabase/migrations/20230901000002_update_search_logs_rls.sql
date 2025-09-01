-- Update search_logs RLS policies to allow anonymous insertions
-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow anonymous insertions" ON public.search_logs;

-- Create policy to allow insertions without authentication
CREATE POLICY "Allow anonymous insertions" 
ON public.search_logs
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Make user_id nullable if it isn't already
ALTER TABLE public.search_logs ALTER COLUMN user_id DROP NOT NULL;

-- Drop foreign key constraint if causing issues
ALTER TABLE public.search_logs DROP CONSTRAINT IF EXISTS search_logs_user_id_fkey;
