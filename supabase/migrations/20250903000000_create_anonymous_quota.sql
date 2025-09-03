-- Create a table for tracking anonymous users' search quota
CREATE TABLE IF NOT EXISTS public.anonymous_quota (
  anonymous_id TEXT PRIMARY KEY NOT NULL,
  role TEXT NOT NULL DEFAULT 'guest',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  sisa_quota INTEGER NOT NULL DEFAULT 3,
  constraint anonymous_id_unique UNIQUE (anonymous_id)
);

-- Update last_active whenever an anonymous user's quota is accessed
CREATE OR REPLACE FUNCTION update_anonymous_last_active()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_active = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_anonymous_last_active
BEFORE UPDATE ON public.anonymous_quota
FOR EACH ROW
EXECUTE FUNCTION update_anonymous_last_active();

-- Set quota based on role (same logic as for authenticated users)
CREATE OR REPLACE FUNCTION set_anonymous_quota_based_on_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Set default quota based on role
  IF NEW.role = 'guest' THEN
    NEW.sisa_quota = 3;  -- Guest users get 3 searches
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_anonymous_quota
BEFORE INSERT OR UPDATE OF role ON public.anonymous_quota
FOR EACH ROW
EXECUTE FUNCTION set_anonymous_quota_based_on_role();

-- Allow public access to the anonymous_quota table
ALTER TABLE public.anonymous_quota ENABLE ROW LEVEL SECURITY;

-- Create role for anonymous access
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon;
  END IF;
END
$$;

-- Grant permissions to the anonymous role
GRANT SELECT, INSERT, UPDATE ON public.anonymous_quota TO anon;

-- Policy to allow anyone to insert into anonymous_quota
CREATE POLICY "Anyone can insert anonymous quota" ON public.anonymous_quota
  FOR INSERT TO public WITH CHECK (true);

-- Policy to allow reading own anonymous quota by ID
CREATE POLICY "Anyone can read anonymous quota" ON public.anonymous_quota
  FOR SELECT USING (true);

-- Policy to allow updating own anonymous quota by ID
CREATE POLICY "Anyone can update anonymous quota" ON public.anonymous_quota
  FOR UPDATE USING (true) WITH CHECK (true);

-- Allow authenticated users to access the anonymous_quota table
CREATE POLICY "Authenticated users can access anonymous quota" ON public.anonymous_quota
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_anonymous_quota_id ON public.anonymous_quota (anonymous_id);
CREATE INDEX IF NOT EXISTS idx_anonymous_quota_last_active ON public.anonymous_quota (last_active);
