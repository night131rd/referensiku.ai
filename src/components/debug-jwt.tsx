"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getAnonymousId } from "@/lib/utils";

export default function DebugJWT() {
  const [tokenData, setTokenData] = useState<{
    isAuthenticated: boolean;
    anonymousId: string | null;
    jwt: string | null;
    decodedJWT: any | null;
    userId: string | null;
    userEmail: string | null;
    userRole: string | null;
  }>({
    isAuthenticated: false,
    anonymousId: null,
    jwt: null,
    decodedJWT: null,
    userId: null,
    userEmail: null,
    userRole: null,
  });
  
  const getAuthInfo = async () => {
    try {
      // Get anonymous ID
      let anonymousId = null;
      try {
        anonymousId = getAnonymousId();
      } catch (e) {
        console.error("Error getting anonymous ID:", e);
      }
      
      // Get JWT and user info - using the properly configured client
      const { createClient } = await import('../../supabase/client');
      const supabase = createClient();
      
      const { data: { session } } = await supabase.auth.getSession();
      
      // Default values
      let isAuthenticated = false;
      let jwt = null;
      let decodedJWT = null;
      let userId = null;
      let userEmail = null;
      let userRole = null;
      
      if (session?.access_token) {
        isAuthenticated = true;
        jwt = session.access_token;
        
        // Decode JWT (just the payload part)
        try {
          const base64Url = jwt.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          decodedJWT = JSON.parse(window.atob(base64));
          userId = decodedJWT.sub;
          
          // Get user email and role from Supabase
          const { data: user } = await supabase.auth.getUser();
          if (user) {
            userEmail = user.user?.email || null;
          }
          
          // Get user role from profiles table
          if (userId) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', userId)
              .single();
              
            if (profileData) {
              userRole = profileData.role;
            }
          }
        } catch (e) {
          console.error("Error decoding JWT:", e);
        }
      }
      
      setTokenData({
        isAuthenticated,
        anonymousId,
        jwt,
        decodedJWT,
        userId,
        userEmail,
        userRole,
      });
    } catch (e) {
      console.error("Error getting auth info:", e);
    }
  };
  
  useEffect(() => {
    getAuthInfo();
  }, []);
  
  return (
    <div className="p-4 border rounded-md bg-gray-50">
      <h2 className="font-bold text-lg mb-2">Auth Debugging</h2>
      
      <div className="space-y-2">
        <div>
          <span className="font-semibold">Status:</span> 
          {tokenData.isAuthenticated ? (
            <span className="text-green-600 ml-1">Authenticated</span>
          ) : (
            <span className="text-amber-600 ml-1">Guest</span>
          )}
        </div>
        
        {/* Selalu tampilkan Anonymous ID untuk semua pengguna */}
        <div>
          <span className="font-semibold">Anonymous ID:</span> 
          <span className="ml-1 font-mono text-sm">{tokenData.anonymousId || "None"}</span>
        </div>
        
        {/* Tampilkan informasi user jika sudah login */}
        {tokenData.isAuthenticated && (
          <>
            <div>
              <span className="font-semibold">User ID:</span> 
              <span className="ml-1 font-mono text-sm">{tokenData.userId || "None"}</span>
            </div>
            
            <div>
              <span className="font-semibold">Email:</span> 
              <span className="ml-1">{tokenData.userEmail || "None"}</span>
            </div>
            
            <div>
              <span className="font-semibold">Role:</span> 
              <span className="ml-1 font-medium">
                {tokenData.userRole === 'premium' ? (
                  <span className="text-purple-600">{tokenData.userRole}</span>
                ) : tokenData.userRole === 'free' ? (
                  <span className="text-blue-600">{tokenData.userRole}</span>
                ) : (
                  <span className="text-gray-500">Not Set</span>
                )}
              </span>
            </div>
            
            <div className="mt-2">
              <details>
                <summary className="cursor-pointer font-semibold">JWT Payload</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(tokenData.decodedJWT, null, 2)}
                </pre>
              </details>
            </div>
          </>
        )}
      </div>
      
      <Button 
        onClick={getAuthInfo} 
        className="mt-4"
        size="sm"
      >
        Refresh Auth Info
      </Button>
    </div>
  );
}
