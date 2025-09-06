"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Calendar, ArrowRight, ChevronDown } from "lucide-react";
import SearchQuotaDisplay from "@/components/search-quota-display";

interface SearchFormProps {
  defaultQuery?: string;
  defaultStartYear?: string;
  defaultEndYear?: string;
  defaultMode?: string;
}

export default function SearchForm({
  defaultQuery = "",
  defaultStartYear = "",
  defaultEndYear = "",
  defaultMode = "quick"
}: SearchFormProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);
  const [startYear, setStartYear] = useState(defaultStartYear || (new Date().getFullYear() - 5).toString());
  const [endYear, setEndYear] = useState(defaultEndYear || new Date().getFullYear().toString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedYearFilter, setSelectedYearFilter] = useState("5 tahun terakhir");
  const [showCustomYears, setShowCustomYears] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentYear = new Date().getFullYear();

  const yearFilterOptions = [
    { label: "Tahun ini", value: "thisyear" },
    { label: "5 tahun terakhir", value: "5years" },
    { label: "10 tahun terakhir", value: "10years" },
    { label: "Masukkan custom tahun", value: "custom" }
  ];

  // Handle year filter selection
  const handleYearFilterSelect = (option: typeof yearFilterOptions[0]) => {
    setSelectedYearFilter(option.label);
    setIsDropdownOpen(false);
    
    if (option.value === "thisyear") {
      setStartYear(currentYear.toString());
      setEndYear(currentYear.toString());
      setShowCustomYears(false);
    } else if (option.value === "5years") {
      setStartYear((currentYear - 5).toString());
      setEndYear(currentYear.toString());
      setShowCustomYears(false);
    } else if (option.value === "10years") {
      setStartYear((currentYear - 10).toString());
      setEndYear(currentYear.toString());
      setShowCustomYears(false);
    } else if (option.value === "custom") {
      setShowCustomYears(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSubmitting(true);

    // Build the search URL with query parameters
    const searchParams = new URLSearchParams();
    searchParams.set("query", query);
    if (startYear) searchParams.set("startYear", startYear);
    if (endYear) searchParams.set("endYear", endYear);
    searchParams.set("mode", "quick");

    // Navigate to the search page with the parameters and scroll to results
    router.push(`/search?${searchParams.toString()}#results`);

    // Reset submission state after a short delay to show loading state
    setTimeout(() => setIsSubmitting(false), 300);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="pt-2 pb-6 px-6 sm:pt-4 sm:pb-8 sm:px-8 md:pt-6 md:pb-10 md:px-10 space-y-4">
        {/* Search Input with Integrated Controls */}
        <div className="relative">
          {/* Search Input - Top */}
          <div className="mb-4">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Masukkan topik penelitian di sini..."
              className="w-full resize-none bg-transparent border-0 outline-none text-gray-900 text-lg placeholder-gray-500 overflow-hidden"
              required
              rows={1}
              style={{ minHeight: '60px', maxHeight: '1000px', textAlign: 'justify' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 1000) + 'px';
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as any);
                }
              }}
            />
          </div>

          {/* Filter and Search Controls - Bottom Row */}
          <div className="flex items-center justify-between gap-4 mt-12">
            {/* Year Filter Select */}
            <div className="relative flex-1" ref={dropdownRef}>
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-transparent border-0 text-gray-800 text-sm font-medium outline-none cursor-pointer flex items-center justify-between hover:text-gray-600 transition-colors duration-200"
              >
                <span>{selectedYearFilter}</span>
                <ChevronDown className={`w-4 h-4 text-gray-800 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-300 shadow-lg z-10">
                  {yearFilterOptions.map((option) => (
                    <div
                      key={option.value}
                      onClick={() => handleYearFilterSelect(option)}
                      className="px-4 py-3 text-gray-800 text-sm hover:bg-gray-100 cursor-pointer first:rounded-t-lg last:rounded-b-lg transition-colors duration-150"
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Search Button */}
            <button
              type="submit"
              disabled={isSubmitting || !query.trim()}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed border-0 rounded-full w-12 h-12 flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <span className="text-white text-xl">➜</span>
              )}
            </button>
          </div>

          {/* Custom Year Inputs - Show when "Masukkan custom tahun" is selected */}
          {showCustomYears && (
            <div className="animate-in slide-in-from-top-2 duration-300 mt-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm font-medium text-gray-700">Min:</Label>
                    <Input
                      type="number"
                      min="1900"
                      max={currentYear}
                      value={startYear}
                      onChange={(e) => setStartYear(e.target.value)}
                      placeholder="2020"
                      className="w-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-400 bg-white text-gray-900 placeholder-gray-500"
                    />
                  </div>

                  <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full border border-gray-300 shadow-sm">
                    <span className="text-orange-400 font-bold">→</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Label className="text-sm font-medium text-gray-700">Max:</Label>
                    <Input
                      type="number"
                      min="1900"
                      max={currentYear}
                      value={endYear}
                      onChange={(e) => setEndYear(e.target.value)}
                      placeholder="2025"
                      className="w-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-400 bg-white text-gray-900 placeholder-gray-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Custom Year Inputs - Show when "Masukkan tahun max dan min" is selected */}
        </div>

      {/* Role display */}
      <div className="mt-4">
        <SearchQuotaDisplay />
      </div>
    </form>
  );
}
