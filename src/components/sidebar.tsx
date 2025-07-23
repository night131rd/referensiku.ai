"use client";

import Link from "next/link";
import { User, History, Search, Clock, Trash2 } from "lucide-react";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { useEffect, useState } from "react";

interface SidebarProps {
  user?: any;
}

export default function Sidebar({ user }: SidebarProps) {
  const { searchHistory, clearSearchHistory, getFormattedTimestamp } = useSearchHistory();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Don't show sidebar if not mounted
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-16 bg-gradient-to-b from-indigo-50 to-purple-50 border-r border-gray-200 flex flex-col items-center py-4 z-40">
      {/* User Profile Section */}
      <div className="mb-6">
        {user ? (
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group">
            <User className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
          </div>
        ) : (
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group relative">
            <User className="h-5 w-5 text-gray-500 group-hover:scale-110 transition-transform" />
            
            {/* Login Prompt Tooltip */}
            <div className="absolute left-full ml-2 top-0 w-48 bg-white rounded-lg shadow-xl border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-3">
                <div className="text-sm font-medium text-gray-800 mb-2">
                  Please Login
                </div>
                <div className="text-xs text-gray-600 mb-3">
                  Sign in to access your profile and search history
                </div>
                <Link
                  href="/sign-in"
                  className="block w-full text-center px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Login Now
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Icons */}
      <div className="flex flex-col gap-3">
        {/* Search Icon */}
        <Link href="/search">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group border hover:border-indigo-200">
            <Search className="h-4 w-4 text-gray-600 group-hover:text-indigo-600 transition-colors" />
          </div>
        </Link>

        {/* History Icon */}
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group border hover:border-indigo-200 relative">
          <History className="h-4 w-4 text-gray-600 group-hover:text-indigo-600 transition-colors" />
          
          {/* History Tooltip/Dropdown - appears on hover */}
          <div className="absolute left-full ml-2 top-0 w-64 bg-white rounded-lg shadow-xl border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="p-3">
              <div className="flex items-center gap-2 mb-3 border-b pb-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Search History</span>
              </div>
              {user ? (
                <>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {searchHistory.map((item) => (
                      <Link
                        key={item.id}
                        href={`/search?query=${encodeURIComponent(item.query)}${item.mode ? `&mode=${item.mode}` : ''}${item.startYear ? `&startYear=${item.startYear}` : ''}${item.endYear ? `&endYear=${item.endYear}` : ''}`}
                        className="block p-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors"
                      >
                        <div className="text-xs font-medium text-gray-800 truncate">
                          {item.query}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {getFormattedTimestamp(item.timestamp)}
                        </div>
                      </Link>
                    ))}
                  </div>
                  {searchHistory.length > 0 && (
                    <div className="border-t pt-2 mt-2">
                      <button
                        onClick={clearSearchHistory}
                        className="w-full text-xs text-red-500 hover:text-red-700 flex items-center justify-center gap-1 py-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        Clear History
                      </button>
                    </div>
                  )}
                  {searchHistory.length === 0 && (
                    <div className="text-xs text-gray-500 text-center py-4">
                      No search history yet
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="text-sm font-medium text-gray-800 mb-2">
                    Login Required
                  </div>
                  <div className="text-xs text-gray-600 mb-3">
                    Sign in to view your search history
                  </div>
                  <Link
                    href="/sign-in"
                    className="inline-block px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dashboard Icon */}
        <Link href="/dashboard">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group border hover:border-indigo-200">
            <div className="w-3 h-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-sm group-hover:scale-110 transition-transform"></div>
          </div>
        </Link>
      </div>

      {/* Bottom spacing */}
      <div className="flex-1"></div>
    </aside>
  );
}
