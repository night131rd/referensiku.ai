-- Create profiles table with role-based quota management
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL,
  email text NULL,
  role text NULL DEFAULT 'free'::text,
  created_at timestamp with time zone NULL DEFAULT timezone('utc'::text, now()),
  sisa_quota integer NULL DEFAULT 10,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Create policy for users to update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create policy for service role to manage all profiles
CREATE POLICY "Service role can manage all profiles" ON public.profiles
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create function to set quota based on role
CREATE OR REPLACE FUNCTION public.set_quota_based_on_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Set quota based on role
  CASE NEW.role
    WHEN 'guest' THEN
      NEW.sisa_quota := 3;
    WHEN 'free' THEN
      NEW.sisa_quota := 10;
    WHEN 'premium' THEN
      NEW.sisa_quota := 100;
    ELSE
      NEW.sisa_quota := 10; -- Default to free tier
  END CASE;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically set quota when role changes
CREATE OR REPLACE TRIGGER trigger_set_quota
  BEFORE INSERT OR UPDATE OF role
  ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_quota_based_on_role();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'free');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile for new users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
