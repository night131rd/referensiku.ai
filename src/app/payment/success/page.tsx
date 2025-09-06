"use client";

import { useEffect, useState, Suspense } from "react";
import { createClient } from "../../../../supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, AlertCircle, Clock } from "lucide-react";

function PaymentSuccessContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'processing' | 'failed'>('loading');
  const [retryCount, setRetryCount] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const checkPaymentAndRole = async () => {
      try {
        // Get payment status from URL parameters
        const transactionStatus = searchParams.get('transaction_status');
        const statusCode = searchParams.get('status_code');

        console.log('Payment callback:', { transactionStatus, statusCode });

        // Check authentication
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          router.push('/sign-in?redirect=/payment/success');
          return;
        }

        // If payment failed
        if (transactionStatus === 'deny' || transactionStatus === 'cancel' || transactionStatus === 'expire') {
          setStatus('failed');
          return;
        }

        // If payment successful, check role (with retry logic)
        if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
          await checkUserRoleWithRetry(user.id, supabase);
        } else {
          // Payment still processing
          setStatus('processing');
        }

      } catch (error) {
        console.error('Error in payment success page:', error);
        setStatus('failed');
      }
    };

    const checkUserRoleWithRetry = async (userId: string, supabase: any, maxRetries = 5) => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();

          if (!error && profileData?.role === 'premium') {
            setStatus('success');
            return;
          }

          // Wait before retry (increasing delay)
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, attempt * 2000));
          }
        } catch (error) {
          console.error(`Role check attempt ${attempt} failed:`, error);
        }
      }

      // If all retries failed, still show processing status
      setStatus('processing');
      setRetryCount(maxRetries);
    };

    checkPaymentAndRole();
  }, [router, searchParams]);

  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  if (status === 'loading') {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center min-h-[70vh] py-8">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mb-4" />
          <h1 className="text-2xl font-bold mb-4">Memverifikasi Pembayaran...</h1>
          <p className="text-lg text-gray-600">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center min-h-[70vh] py-8">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Pembayaran Gagal</h1>
          <p className="text-lg mb-6">
            Pembayaran Anda tidak berhasil diproses. Silakan coba lagi atau hubungi support.
          </p>
          <div className="space-x-4">
            <Button onClick={handleRetry} variant="outline">
              Coba Lagi
            </Button>
            <Button onClick={handleGoHome}>
              Kembali ke Beranda
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center min-h-[70vh] py-8">
        <div className="text-center max-w-md">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Selamat! 🎉</h1>
          <p className="text-lg mb-6">
            Akun Anda telah berhasil diupgrade ke <span className="font-semibold text-purple-600">Premium</span>!
          </p>
          <div className="bg-purple-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-purple-800 mb-2">Fitur Premium Anda:</h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>✅ Kuota pencarian unlimited</li>
              <li>✅ Akses ke semua fitur advanced</li>
              <li>✅ Prioritas dukungan teknis</li>
              <li>✅ Export data tanpa batas</li>
            </ul>
          </div>
          <Button onClick={handleGoHome} className="bg-purple-600 hover:bg-purple-700">
            Mulai Eksplorasi Premium
          </Button>
        </div>
      </div>
    );
  }

  // Processing status
  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[70vh] py-8">
      <div className="text-center max-w-md">
        <Clock className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Pembayaran Sedang Diproses</h1>
        <p className="text-lg mb-6">
          Pembayaran Anda berhasil, namun status premium sedang diaktifkan.
          Biasanya memakan waktu 1-2 menit.
        </p>
        {retryCount > 0 && (
          <p className="text-sm text-gray-600 mb-4">
            Sudah dicoba {retryCount} kali. Sistem akan terus memeriksa status secara otomatis.
          </p>
        )}
        <div className="space-x-4">
          <Button onClick={handleRetry} variant="outline">
            Periksa Status
          </Button>
          <Button onClick={handleGoHome}>
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto flex flex-col items-center justify-center min-h-[70vh] py-8">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mb-4" />
          <h1 className="text-2xl font-bold mb-4">Memuat...</h1>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
