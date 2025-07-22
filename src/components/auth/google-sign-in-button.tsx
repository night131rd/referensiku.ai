"use client";

import { Button } from "@/components/ui/button";
import { signInWithGoogleAction } from "@/app/actions";
import { useState } from "react";

export function GoogleSignInButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent the default form submission

    try {
      setIsLoading(true);
      console.log("Starting Google sign-in process...");
      // Using window.location.href directly instead of waiting for the action to redirect
      // This avoids the NEXT_REDIRECT error
      window.location.href = "/api/auth/google";
    } catch (error) {
      console.error("Google sign-in error:", error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full flex items-center gap-2 border-gray-300 hover:bg-gray-50"
      onClick={handleGoogleSignIn}
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" />
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
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
      Sign in with Google
    </Button>
  );
}
