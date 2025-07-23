import { useState, useEffect } from 'react';

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: string;
  mode?: string;
  startYear?: string;
  endYear?: string;
}

export function useSearchHistory() {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);

  // Load search history from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('searchHistory');
      if (saved) {
        try {
          setSearchHistory(JSON.parse(saved));
        } catch (error) {
          console.error('Error parsing search history:', error);
        }
      }
    }
  }, []);

  // Save search history to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }
  }, [searchHistory]);

  const addSearchToHistory = (query: string, mode?: string, startYear?: string, endYear?: string) => {
    const newSearch: SearchHistoryItem = {
      id: Date.now().toString(),
      query,
      mode,
      startYear,
      endYear,
      timestamp: new Date().toISOString(),
    };

    setSearchHistory(prev => {
      // Remove duplicate searches and limit to 20 items
      const filtered = prev.filter(item => item.query !== query);
      return [newSearch, ...filtered].slice(0, 20);
    });
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
  };

  const getFormattedTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) {
      return `${minutes} minutes ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (days < 7) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return {
    searchHistory,
    addSearchToHistory,
    clearSearchHistory,
    getFormattedTimestamp,
  };
}
