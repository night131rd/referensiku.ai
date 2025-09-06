"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../supabase/client";

interface SearchQuotaProps {
  // Optional props if sent directly by parent
  remainingQuota?: number;
  totalQuota?: number;
}

export default function SearchQuotaDisplay({ 
  remainingQuota: propsRemainingQuota, 
  totalQuota: propsTotalQuota
}: SearchQuotaProps) {
  // States for user data and loading
  const [userRole, setUserRole] = useState<string>("guest");
  const [quotaRemaining, setQuotaRemaining] = useState<number | null>(null);
  const [quotaTotal, setQuotaTotal] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Check Supabase for authentication and quota
  useEffect(() => {
    const fetchQuotaFromSupabase = async () => {
      setIsLoading(true);
      
      try {
        if (typeof window !== 'undefined') {
          // Import the utils to get anonymous ID
          const { getAnonymousId } = await import('@/lib/utils');
          const anonymousId = getAnonymousId();
          console.log('Current anonymous ID:', anonymousId);
          
          // For client-side - use properly configured client
          const supabase = createClient();
          
          // Get current session
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            // User is authenticated - get quota from profiles
            console.log('Found authenticated user:', session.user.email);
            
            const { data: profileData, error } = await supabase
              .from('profiles')
              .select('role, sisa_quota')
              .eq('id', session.user.id)
              .single();
              
            if (!error && profileData && profileData.role) {
              setUserRole(profileData.role);
              console.log('Found user role in profiles:', profileData.role);
              
              // Set quota data directly from Supabase
              if (profileData.sisa_quota !== undefined) {
                const quotaLimit = profileData.role === 'premium' ? 100 : 
                                  profileData.role === 'free' ? 10 : 3;
                
                setQuotaRemaining(profileData.sisa_quota);
                setQuotaTotal(quotaLimit);
                console.log('Set quota from profiles:', {
                  remaining: profileData.sisa_quota,
                  total: quotaLimit
                });
              }
            } else {
              setUserRole("free"); // Default for authenticated users
              setQuotaTotal(10); // Default quota for free users
              setQuotaRemaining(10); // Assume full quota if not found
              console.log('User authenticated but no role found, setting to free with default quota');
            }
          } else {
            // No session, user is a guest - check anonymous_quota table
            console.log('No authenticated session, checking anonymous_quota table');
            
            // Try to get quota info from anonymous_quota table
            const { data: anonymousData, error: anonymousError } = await supabase
              .from('anonymous_quota')
              .select('role, sisa_quota')
              .eq('anonymous_id', anonymousId)
              .single();
            
            if (!anonymousError && anonymousData) {
              // Found existing anonymous user
              setUserRole(anonymousData.role);
              const quotaLimit = anonymousData.role === 'guest' ? 3 : 5;
              
              setQuotaRemaining(anonymousData.sisa_quota);
              setQuotaTotal(quotaLimit);
              console.log('Found anonymous user data:', {
                role: anonymousData.role,
                remaining: anonymousData.sisa_quota,
                total: quotaLimit
              });
            } else {
              // Anonymous user not found - insert a new entry
              console.log('Anonymous user not found, creating new entry');
              const { error: insertError } = await supabase
                .from('anonymous_quota')
                .insert({
                  anonymous_id: anonymousId,
                  role: 'guest',
                  sisa_quota: 3
                });
                
              if (insertError) {
                console.error('Error creating anonymous user:', insertError);
              } else {
                console.log('Created new anonymous user with quota');
              }
              
              setUserRole("guest");
              setQuotaRemaining(3);
              setQuotaTotal(3);
            }
          }
        } else {
          // Server-side rendering
          setUserRole("guest"); // Default to guest for SSR
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setUserRole("guest"); // Default to guest on error
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuotaFromSupabase();
  }, []);
  
  // Periodically refresh quota data from Supabase
  useEffect(() => {
    const refreshQuotaData = async () => {
      try {
        if (typeof window === 'undefined') return;
        
        const supabase = createClient();
        const { getAnonymousId } = await import('@/lib/utils');
        const anonymousId = getAnonymousId();
        
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Authenticated user - get quota from profiles
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role, sisa_quota')
            .eq('id', session.user.id)
            .single();
            
          if (profileData && profileData.sisa_quota !== undefined) {
            const quotaLimit = profileData.role === 'premium' ? 50 : 
                              profileData.role === 'free' ? 10 : 3;
            
            // Update the state directly with fresh Supabase data
            setQuotaRemaining(profileData.sisa_quota);
            setQuotaTotal(quotaLimit);
            console.log('Refreshed quota data for authenticated user:', {
              remaining: profileData.sisa_quota,
              total: quotaLimit
            });
          }
        } else {
          // Anonymous user - get quota from anonymous_quota
          const { data: anonData } = await supabase
            .from('anonymous_quota')
            .select('role, sisa_quota')
            .eq('anonymous_id', anonymousId)
            .single();
            
          if (anonData && anonData.sisa_quota !== undefined) {
            const quotaLimit = anonData.role === 'guest' ? 3 : 5;
            
            // Update the state directly with fresh Supabase data
            setQuotaRemaining(anonData.sisa_quota);
            setQuotaTotal(quotaLimit);
            console.log('Refreshed quota data for anonymous user:', {
              remaining: anonData.sisa_quota,
              total: quotaLimit
            });
          }
        }
      } catch (error) {
        console.error('Error refreshing quota data:', error);
      }
    };
    
    // Set up periodic refresh (every 30 seconds)
    const refreshInterval = setInterval(refreshQuotaData, 30000);
    
    return () => clearInterval(refreshInterval);
  }, []);
  
  // Use props values if provided, otherwise use state values from Supabase
  const displayRemainingQuota = propsRemainingQuota !== undefined ? 
    propsRemainingQuota : 
    quotaRemaining;
  const displayTotalQuota = propsTotalQuota !== undefined ? 
    propsTotalQuota : 
    quotaTotal;
  
  // Map role for display label
  const getRoleLabel = (role: string) => {
    switch(role.toLowerCase()) {
      case 'guest': return 'Tamu';
      case 'free': return 'Gratis';
      case 'premium': return 'Premium';
      default: return role;
    }
  };
  
  // Map role for badge color
  const getRoleBadgeColor = (role: string) => {
    switch(role.toLowerCase()) {
      case 'guest': return 'bg-gray-100 text-gray-800';
      case 'free': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  // For premium role, show different label
  const getQuotaLabel = (role: string) => {
    if (role.toLowerCase() === 'premium') {
      return "Premium";
    }
    return "";
  };

  // Special debug function to show detailed information
  const showDebugInfo = () => {
    console.log('DEBUG INFO - Search Quota Display:');
    console.log('- Current user role from Supabase:', userRole);
    console.log('- Current quota remaining:', displayRemainingQuota);
    console.log('- Current quota total:', displayTotalQuota);
  };
  
  // If loading, show skeleton
  if (isLoading) {
    return (
      <div className="flex items-center justify-between text-xs text-gray-500 mt-4 px-1">
        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-40 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  // Check if quota is depleted (0 remaining)
  const isQuotaDepleted = displayRemainingQuota !== undefined && displayRemainingQuota !== null && displayRemainingQuota <= 0;
  
  return (
    <>
      {/* Role display only */}
      <div className="flex items-center justify-start text-xs mt-4 px-1">
        {/* Role badge */}
        <div className="flex items-center">
          <span 
            className={`${getRoleBadgeColor(userRole)} px-2 py-0.5 rounded-full font-medium cursor-pointer`}
            onClick={showDebugInfo}
            title="Click to show debug info in console"
          >
            {getRoleLabel(userRole)}
          </span>
        </div>
      </div>
      
      {/* Warning banner when quota is depleted */}
      {isQuotaDepleted && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          <p className="font-semibold mb-1">Batas Pencarian {userRole === "premium" ? "Premium" : ""} Tercapai</p>
          <p className="text-xs">
            {userRole === "premium" 
              ? "Kuota pencarian premium Anda telah habis. Silahkan hubungi admin untuk informasi lebih lanjut."
              : "Kuota pencarian Anda telah habis. Anda dapat mengupgrade ke paket premium untuk kuota yang lebih banyak."}
          </p>
        </div>
      )}
    </>
  );
}
