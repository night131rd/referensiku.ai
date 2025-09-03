# Implementasi Fitur Feedback dan Laporan Bug

Dokumen ini berisi petunjuk untuk mengimplementasikan fitur feedback dan laporan bug pada Referensiku.ai.

## Langkah 1: Membuat Tabel di Supabase

1. Buka dashboard Supabase untuk proyek Referensiku.ai
2. Navigasi ke tab "SQL Editor"
3. Buat query baru
4. Salin dan tempel SQL berikut:

```sql
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
```

5. Klik tombol "Run" untuk mengeksekusi SQL

## Langkah 2: Fitur yang Sudah Diimplementasikan

1. **Tombol Floating**: Tombol mengambang di pojok kanan bawah untuk melaporkan bug atau kirim feedback
2. **Form Dialog**: Dialog modal dengan form untuk memilih jenis feedback, mengisi pesan, dan email (opsional)
3. **Integrasi dengan Supabase**: Menyimpan feedback ke tabel `user_feedback` di Supabase

## Langkah 3: Cara Mengakses Feedback

Untuk melihat feedback yang masuk:

1. Buka dashboard Supabase
2. Navigasi ke tab "Table Editor"
3. Pilih tabel "user_feedback"
4. Gunakan filter untuk melihat berdasarkan jenis (bug, suggestion, general)
5. Perbarui kolom "status" sesuai kebutuhan (new, in-progress, resolved, etc.)

## Catatan Tambahan

- Feedback dapat diakses melalui SQL query jika Anda ingin mengintegrasikannya dengan dashboard admin
- Pastikan untuk secara rutin memeriksa dan menindaklanjuti feedback
- Pertimbangkan untuk mengirim email notifikasi saat ada feedback bug baru (dapat diimplementasikan dengan Supabase Edge Functions)
