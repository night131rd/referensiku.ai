"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../../supabase/client";
import { getAnonymousId } from "@/lib/utils";

export default function DebugPage() {
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [anonymousInfo, setAnonymousInfo] = useState<any>(null);
  const [quotaInfo, setQuotaInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDebugInfo() {
      try {
        setIsLoading(true);
        const supabase = createClient();
        
        // Get session info
        const { data: sessionData } = await supabase.auth.getSession();
        setSessionInfo(sessionData);
        
        // Get anonymous ID
        const anonymousId = getAnonymousId();
        
        // Get anonymous user info from Supabase
        if (anonymousId) {
          const { data: anonData, error: anonError } = await supabase
            .from('anonymous_quota')
            .select('*')
            .eq('anonymous_id', anonymousId)
            .single();
            
          if (anonError && anonError.code !== 'PGRST116') {
            console.error('Error fetching anonymous data:', anonError);
            setError(`Anonymous data error: ${anonError.message}`);
          } else {
            setAnonymousInfo({
              anonymousId,
              record: anonData || null
            });
          }
        }
        
        // Get quota info from localStorage
        if (typeof window !== 'undefined') {
          const quotaLimit = localStorage.getItem('searchQuotaLimit');
          const quotaRemaining = localStorage.getItem('searchQuotaRemaining');
          const quotaLastUpdated = localStorage.getItem('searchQuotaLastUpdated');
          
          setQuotaInfo({
            limit: quotaLimit,
            remaining: quotaRemaining,
            lastUpdated: quotaLastUpdated
          });
        }
      } catch (err) {
        console.error('Error in debug page:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchDebugInfo();
  }, []);
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Debug Information</h1>
      
      {isLoading ? (
        <p>Loading debug information...</p>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="text-xl font-semibold mb-2">Session Information</h2>
            <pre className="bg-white p-3 rounded overflow-auto max-h-64">
              {JSON.stringify(sessionInfo, null, 2)}
            </pre>
          </div>
          
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="text-xl font-semibold mb-2">Anonymous User Information</h2>
            <pre className="bg-white p-3 rounded overflow-auto max-h-64">
              {JSON.stringify(anonymousInfo, null, 2)}
            </pre>
          </div>
          
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="text-xl font-semibold mb-2">Quota Information (LocalStorage)</h2>
            <pre className="bg-white p-3 rounded overflow-auto max-h-64">
              {JSON.stringify(quotaInfo, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}