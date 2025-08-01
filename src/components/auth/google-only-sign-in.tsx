"use client";

import { useState } from "react";

export function GoogleOnlySignIn() {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      // Direct redirect for better UX
      window.location.href = "/api/auth/google";
    } catch (error) {
      console.error("Google sign-in error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 w-full max-w-md mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Selamat Datang di Referensiku</h1>
        <p className="text-muted-foreground">Masuk dengan akun Google Anda untuk melanjutkan</p>
      </div>
      
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="flex items-center justify-center gap-3 w-full px-6 py-5 bg-white hover:bg-gray-50 text-gray-800 rounded-lg shadow-md transition-all border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        {isLoading ? (
          <div className="w-5 h-5 rounded-full border-2 border-t-transparent border-blue-500 animate-spin" />
        ) : (
          <>
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 48 48"
            >
              <path 
                fill="#EA4335" 
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path 
                fill="#4285F4" 
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path 
                fill="#FBBC05" 
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path 
                fill="#34A853" 
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
            </svg>
            <span className="text-base font-medium">Masuk dengan Google</span>
          </>
        )}
      </button>
      
      <div className="text-sm text-center text-muted-foreground mt-6">
        <p>Dengan melanjutkan, Anda menyetujui Ketentuan Layanan dan Kebijakan Privasi Referensiku.</p>
      </div>
    </div>
  );
}
