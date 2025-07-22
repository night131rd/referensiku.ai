"use client";

import { Button } from "@/components/ui/button";
import { signInWithGoogleAction } from "@/app/actions";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function GoogleOnlySignIn() {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    // The form action will handle the redirect
  };

  return (
    <div className="flex flex-col items-center space-y-4 w-full max-w-md mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Welcome to Referensiku</h1>
        <p className="text-muted-foreground">Sign in with your Google account to continue</p>
      </div>
      
      <form action={signInWithGoogleAction} onSubmit={handleGoogleSignIn} className="w-full">
        <Button
          type="submit"
          className="w-full flex items-center gap-2 py-6"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M15.547 8.303A5.148 5.148 0 0 0 12.11 7C9.287 7 7 9.239 7 12s2.287 5 5.11 5c3.627 0 4.942-2.66 4.942-4.641 0-.452-.043-.783-.13-1.128H12.11v1.647h2.837c-.115.75-.86 2.17-2.837 2.17-1.708 0-3.101-1.426-3.101-3.143s1.393-3.142 3.1-3.142c.961 0 1.605.408 1.971.762l1.467-1.45Z" />
              <path d="M16.742 11.106c0-.835-.16-1.33-.317-1.67h4.267c.337.534.308 1.157.308 1.67 0 1.637-.592 3.728-2.469 5.494-1.864 1.757-4.242 2.695-7.413 2.695-5.839 0-10.59-4.657-10.59-10.384S5.279 1.28 11.118 1.28c3.284 0 5.63 1.276 7.39 2.96L16.363 6.2c-1.007-.935-2.37-1.67-5.245-1.67-4.296 0-7.333 3.484-7.333 7.384s3.037 7.383 7.333 7.383c2.556 0 4.477-1.055 5.522-2.006.85-.76 1.415-1.84 1.65-3.317l-1.548.169Z" />
            </svg>
          )}
          {isLoading ? "Signing in..." : "Sign in with Google"}
        </Button>
      </form>
      
      <div className="text-sm text-center text-muted-foreground mt-6">
        <p>By continuing, you agree to Referensiku's Terms of Service and Privacy Policy.</p>
      </div>
    </div>
  );
}
