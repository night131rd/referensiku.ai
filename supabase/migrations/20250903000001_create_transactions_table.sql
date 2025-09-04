-- Create transactions table for storing Midtrans payment notifications
CREATE TABLE IF NOT EXISTS public.transactions (
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

-- Create index on order_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON public.transactions(order_id);

-- Create index on received_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_transactions_received_at ON public.transactions(received_at);

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read their own transactions
CREATE POLICY "Users can view their own transactions" ON public.transactions
    FOR SELECT USING (
        auth.uid()::text = split_part(order_id, ':', 2)
    );

-- Create policy to allow service role to insert/update transactions (for webhook)
CREATE POLICY "Service role can manage transactions" ON public.transactions
    FOR ALL USING (
        auth.role() = 'service_role'
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
