"use client";

import { useEffect, useState } from "react";
import { useSearchQuota } from "@/hooks/useSearchQuota";
import { createClient } from "../../supabase/client";

interface SearchQuotaProps {
  // Opsional props jika dikirim langsung oleh parent
  remainingQuota?: number;
  totalQuota?: number;
}

export default function SearchQuotaDisplay({ 
  remainingQuota: propsRemainingQuota, 
  totalQuota: propsTotalQuota
}: SearchQuotaProps) {
  // States for user role and authentication status
  const [userRole, setUserRole] = useState<string>("guest");
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  
  // Use the search quota hook just for quota data, not for user role
  const { quotaData, isLoading: isQuotaLoading } = useSearchQuota();
  
  // Check Supabase authentication and anonymous_quota table
  useEffect(() => {
    const checkUserAuth = async () => {
      setIsAuthChecking(true);
      
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
            // User is authenticated - try to get role from profiles
            console.log('Found authenticated user:', session.user.email);
            
            const { data: profileData, error } = await supabase
              .from('profiles')
              .select('role, sisa_quota')
              .eq('id', session.user.id)
              .single();
              
            if (!error && profileData && profileData.role) {
              setUserRole(profileData.role);
              console.log('Found user role in profiles:', profileData.role);
              
              // Update quota data from profiles
              if (profileData.sisa_quota !== undefined) {
                const quotaLimit = profileData.role === 'premium' ? 50 : 
                                 profileData.role === 'free' ? 10 : 3;
                                 
                // Update the quota data
                localStorage.setItem('searchQuotaLimit', quotaLimit.toString());
                localStorage.setItem('searchQuotaRemaining', profileData.sisa_quota.toString());
                localStorage.setItem('searchQuotaLastUpdated', new Date().toISOString());
                
                // Dispatch event to update the quota display
                const event = new CustomEvent('quotaUpdated', {
                  detail: {
                    total: quotaLimit,
                    remaining: profileData.sisa_quota
                  }
                });
                window.dispatchEvent(event);
              }
            } else {
              setUserRole("free"); // Default for authenticated users
              console.log('User authenticated but no role found, setting to free');
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
              console.log('Found anonymous user data:', anonymousData);
              
              // Update quota data
              const quotaLimit = anonymousData.role === 'guest' ? 3 : 5;
              
              // Update the quota data
              localStorage.setItem('searchQuotaLimit', quotaLimit.toString());
              localStorage.setItem('searchQuotaRemaining', anonymousData.sisa_quota.toString());
              localStorage.setItem('searchQuotaLastUpdated', new Date().toISOString());
              
              // Dispatch event to update the quota display
              const event = new CustomEvent('quotaUpdated', {
                detail: {
                  total: quotaLimit,
                  remaining: anonymousData.sisa_quota
                }
              });
              window.dispatchEvent(event);
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
              
              // Set default quota for new guest user
              localStorage.setItem('searchQuotaLimit', '3');
              localStorage.setItem('searchQuotaRemaining', '3');
              localStorage.setItem('searchQuotaLastUpdated', new Date().toISOString());
              
              // Dispatch event to update the quota display
              const event = new CustomEvent('quotaUpdated', {
                detail: {
                  total: 3,
                  remaining: 3
                }
              });
              window.dispatchEvent(event);
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
        setIsAuthChecking(false);
      }
    };
    
    checkUserAuth();
  }, []);
  
  // Add debugging to console
  useEffect(() => {
    console.log('SearchQuotaDisplay - Current role and quota:', {
      userRole,
      quotaData,
      isAuthChecking,
      isQuotaLoading
    });
  }, [userRole, quotaData, isAuthChecking, isQuotaLoading]);
  
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
            
            // Update the quota data if it changed
            const currentRemaining = localStorage.getItem('searchQuotaRemaining');
            if (!currentRemaining || parseInt(currentRemaining) !== profileData.sisa_quota) {
              console.log('Refreshed quota data for authenticated user:', {
                remaining: profileData.sisa_quota,
                total: quotaLimit
              });
              
              // Update localStorage
              localStorage.setItem('searchQuotaLimit', quotaLimit.toString());
              localStorage.setItem('searchQuotaRemaining', profileData.sisa_quota.toString());
              localStorage.setItem('searchQuotaLastUpdated', new Date().toISOString());
              
              // Dispatch event to update the quota display
              const event = new CustomEvent('quotaUpdated', {
                detail: {
                  total: quotaLimit,
                  remaining: profileData.sisa_quota
                }
              });
              window.dispatchEvent(event);
            }
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
            
            // Update the quota data if it changed
            const currentRemaining = localStorage.getItem('searchQuotaRemaining');
            if (!currentRemaining || parseInt(currentRemaining) !== anonData.sisa_quota) {
              console.log('Refreshed quota data for anonymous user:', {
                remaining: anonData.sisa_quota,
                total: quotaLimit
              });
              
              // Update localStorage
              localStorage.setItem('searchQuotaLimit', quotaLimit.toString());
              localStorage.setItem('searchQuotaRemaining', anonData.sisa_quota.toString());
              localStorage.setItem('searchQuotaLastUpdated', new Date().toISOString());
              
              // Dispatch event to update the quota display
              const event = new CustomEvent('quotaUpdated', {
                detail: {
                  total: quotaLimit,
                  remaining: anonData.sisa_quota
                }
              });
              window.dispatchEvent(event);
            }
          }
        }
      } catch (error) {
        console.error('Error refreshing quota data:', error);
      }
    };
    
    // Initial refresh
    refreshQuotaData();
    
    // Set up periodic refresh (every 30 seconds)
    const refreshInterval = setInterval(refreshQuotaData, 30000);
    
    return () => clearInterval(refreshInterval);
  }, [userRole]);
  
  // Gunakan nilai dari props atau dari quotaData hook
  const displayRemainingQuota = propsRemainingQuota !== undefined ? 
    propsRemainingQuota : 
    quotaData?.remaining;
  const displayTotalQuota = propsTotalQuota !== undefined ? 
    propsTotalQuota : 
    quotaData?.total;
  
  // Map role untuk label yang ditampilkan
  const getRoleLabel = (role: string) => {
    switch(role.toLowerCase()) {
      case 'guest': return 'Tamu';
      case 'free': return 'Gratis';
      case 'premium': return 'Premium';
      default: return role;
    }
  };
  
  // Map role untuk warna badge
  const getRoleBadgeColor = (role: string) => {
    switch(role.toLowerCase()) {
      case 'guest': return 'bg-gray-100 text-gray-800';
      case 'free': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  // Untuk role premium, tampilkan label berbeda
  const getQuotaLabel = (role: string) => {
    if (role.toLowerCase() === 'premium') {
      return "Premium";
    }
    return "Harian";
  };

  // Special debug function to show detailed information
  const showDebugInfo = () => {
    try {
      const storedLimit = localStorage.getItem('searchQuotaLimit');
      const storedRemaining = localStorage.getItem('searchQuotaRemaining');
      
      console.log('DEBUG INFO - Search Quota Display:');
      console.log('- Current user role from Supabase:', userRole);
      console.log('- Current quota remaining:', displayRemainingQuota);
      console.log('- Current quota total:', displayTotalQuota);
      console.log('- Stored quota in localStorage:', {
        limit: storedLimit,
        remaining: storedRemaining
      });
      console.log('- Full quotaData:', quotaData);
    } catch (e) {
      console.error('Error in debug info:', e);
    }
  };
  
  // Call debug on mount
  useEffect(() => {
    showDebugInfo();
  }, [userRole, displayRemainingQuota, displayTotalQuota]);
  
  // Jika loading atau tidak ada informasi kuota sama sekali, tampilkan skeleton
  if (isAuthChecking || isQuotaLoading) {
    return (
      <div className="flex items-center justify-between text-xs text-gray-500 mt-4 px-1">
        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-40 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  // Check if quota is depleted (0 remaining)
  const isQuotaDepleted = displayRemainingQuota !== undefined && displayRemainingQuota <= 0;
  
  return (
    <>
      {/* Improved quota display with role and reset information */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between text-xs mt-4 px-1">
        <div className="flex items-center space-x-2 mb-2 md:mb-0">
          <span 
            className={`${getRoleBadgeColor(userRole)} px-2 py-0.5 rounded-full font-medium cursor-pointer`}
            onClick={showDebugInfo}
            title="Click to show debug info in console"
          >
            {getRoleLabel(userRole)}
          </span>
          {userRole.toLowerCase() === 'premium' && (
            <span className="text-green-600">
              ✓ Akses Premium
            </span>
          )}
        </div>
        
        <div className="text-right text-gray-600">
          {displayRemainingQuota !== undefined && displayTotalQuota !== undefined ? (
            <div className="flex flex-col items-end">
              <span>
                Sisa pencarian: <span className={`font-medium ${isQuotaDepleted ? 'text-red-600' : 'text-blue-600'}`}>{displayRemainingQuota}</span>
                <span className="font-medium text-gray-600">/{displayTotalQuota}</span>
                <span className="ml-1 text-gray-500">({getQuotaLabel(userRole)})</span>
              </span>
              {userRole === "guest" && (
                <span className="text-gray-500 text-xs mt-1">
                  Login untuk mendapat kuota lebih banyak
                </span>
              )}
            </div>
          ) : (
            <span className="text-gray-400">
              {userRole === "guest" ? "Login untuk mendapat kuota lebih" : "Informasi kuota tidak tersedia"}
            </span>
          )}
        </div>
      </div>
      
      {/* Warning banner when quota is depleted */}
      {isQuotaDepleted && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          <p className="font-semibold mb-1">Batas Pencarian {userRole === "premium" ? "Premium" : "Harian"} Tercapai</p>
          <p className="text-xs">
            {userRole === "premium" 
              ? "Kuota pencarian premium Anda telah habis. Silahkan hubungi admin untuk informasi lebih lanjut."
              : "Kuota pencarian harian Anda telah habis. Kuota akan direset pada hari berikutnya atau Anda dapat mengupgrade ke paket premium untuk kuota yang lebih banyak."}
          </p>
        </div>
      )}
    </>
  );
}
