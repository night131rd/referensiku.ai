"use client";

import { useState, useEffect } from "react";

// Definisi tipe untuk data kuota
export interface QuotaData {
  remaining: number;
  total: number;
  reset_at?: string;
}

// Global state untuk menyimpan informasi kuota
let globalQuotaData: QuotaData | null = null;

export function useSearchQuota() {
  const [quotaData, setQuotaData] = useState<QuotaData | null>(globalQuotaData);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fungsi untuk memperbarui informasi kuota
  const updateQuota = (newData: QuotaData) => {
    globalQuotaData = newData;
    setQuotaData(newData);
    
    // Juga update localStorage jika perlu
    try {
      localStorage.setItem('searchQuotaLimit', newData.total.toString());
      localStorage.setItem('searchQuotaRemaining', newData.remaining.toString());
      localStorage.setItem('searchQuotaLastUpdated', new Date().toISOString());
    } catch (e) {
      console.warn('Failed to save quota info to localStorage:', e);
    }
  };

  // Ambil data quota dari localStorage - we're no longer handling user roles here
  useEffect(() => {
    const fetchQuotaData = async () => {
      setIsLoading(true);
      
      try {
        // Get quota from localStorage
        const quotaLimit = localStorage.getItem('searchQuotaLimit');
        const quotaRemaining = localStorage.getItem('searchQuotaRemaining');
        
        // Update the state if we have quota data
        if (quotaLimit && quotaRemaining) {
          const newQuotaData: QuotaData = {
            total: parseInt(quotaLimit, 10),
            remaining: parseInt(quotaRemaining, 10),
          };
          
          globalQuotaData = newQuotaData;
          setQuotaData(newQuotaData);
          console.log('Loaded quota data from localStorage:', newQuotaData);
        } else {
          // Set default quota values if none found
          const defaultQuota: QuotaData = {
            total: 5,  // Default for guest users
            remaining: 5,
          };
          globalQuotaData = defaultQuota;
          setQuotaData(defaultQuota);
          console.log('Using default quota data:', defaultQuota);
        }
      } catch (e) {
        console.error('Error in fetchQuotaData:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuotaData();
    
    // Listen for storage changes (when quota is updated by other components)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'searchQuotaRemaining' || event.key === 'searchQuotaLimit') {
        const quotaLimit = localStorage.getItem('searchQuotaLimit');
        const quotaRemaining = localStorage.getItem('searchQuotaRemaining');
        
        if (quotaLimit && quotaRemaining) {
          const newQuotaData: QuotaData = {
            total: parseInt(quotaLimit, 10),
            remaining: parseInt(quotaRemaining, 10),
          };
          
          globalQuotaData = newQuotaData;
          setQuotaData(newQuotaData);
          console.log('Quota updated from localStorage:', newQuotaData);
        }
      }
    };
    
    // Listen for custom quota updated event
    const handleQuotaUpdated = (event: CustomEvent<{total: number, remaining: number}>) => {
      const newQuotaData: QuotaData = {
        total: event.detail.total,
        remaining: event.detail.remaining,
      };
      
      console.log('Quota updated via custom event:', newQuotaData);
      globalQuotaData = newQuotaData;
      setQuotaData(newQuotaData);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('quotaUpdated', handleQuotaUpdated as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('quotaUpdated', handleQuotaUpdated as EventListener);
    };
  }, []);

  return {
    quotaData,
    updateQuota,
    isLoading
  };
}
