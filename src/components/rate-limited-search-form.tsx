"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Lightbulb, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SearchFormProps {
  defaultQuery?: string;
  defaultStartYear?: string;
  defaultEndYear?: string;
  defaultMode?: string;
}

interface RateLimitState {
  limit: number | null;
  remaining: number | null;
  isLimitExceeded: boolean;
}

export default function RateLimitedSearchForm({
  defaultQuery = "",
  defaultStartYear = "",
  defaultEndYear = "",
  defaultMode = "quick",
}: SearchFormProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);
  const [startYear, setStartYear] = useState(defaultStartYear);
  const [endYear, setEndYear] = useState(defaultEndYear);
  const [mode, setMode] = useState(defaultMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [rateLimit, setRateLimit] = useState<RateLimitState>({
    limit: null,
    remaining: null,
    isLimitExceeded: false,
  });

  const currentYear = new Date().getFullYear();

  // Helper function to make the search request and handle rate limit headers
  const performSearch = async (searchParams: URLSearchParams) => {
    try {
      // Create the same endpoint your backend uses
      const url = "/api/proxy/search";
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchParams.get("query"),
          year: searchParams.has("startYear") || searchParams.has("endYear") 
            ? `${searchParams.get("startYear") || ""}-${searchParams.get("endYear") || ""}`
            : "-",
          mode: searchParams.get("mode") || "quick"
        }),
      });

      // Extract rate limit headers
      const limitDaily = response.headers.get("X-RateLimit-Limit-Daily");
      const remainingDaily = response.headers.get("X-RateLimit-Remaining-Daily");

      // Update rate limit state
      setRateLimit({
        limit: limitDaily ? parseInt(limitDaily, 10) : null,
        remaining: remainingDaily ? parseInt(remainingDaily, 10) : null,
        isLimitExceeded: remainingDaily === "0"
      });

      setHasSearched(true);
      return response;
    } catch (error) {
      console.error("Search request failed:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSubmitting(true);

    // Build the search URL with query parameters
    const searchParams = new URLSearchParams();
    searchParams.set("query", query);
    if (startYear) searchParams.set("startYear", startYear);
    if (endYear) searchParams.set("endYear", endYear);
    if (mode) searchParams.set("mode", mode);

    try {
      // Make the search request to capture rate limit headers
      await performSearch(searchParams);
      
      // Navigate to the search page with the parameters
      router.push(`/search?${searchParams.toString()}`);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      // Reset submission state after a short delay to show loading state
      setTimeout(() => setIsSubmitting(false), 300);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="query" className="text-sm font-medium">
            Topik Pencarian
          </Label>
          <Input
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Masukkan topik pencarian"
            className="w-full"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startYear" className="text-sm font-medium">
              Tahun Awal
            </Label>
            <Input
              id="startYear"
              type="number"
              min="1900"
              max={currentYear}
              value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
              placeholder="Dari tahun (opsional)"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endYear" className="text-sm font-medium">
              Tahun Akhir
            </Label>
            <Input
              id="endYear"
              type="number"
              min="1900"
              max={currentYear}
              value={endYear}
              onChange={(e) => setEndYear(e.target.value)}
              placeholder="Hingga tahun (opsional)"
              className="w-full"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Mode Pencarian
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <div
              onClick={() => setMode("quick")}
              className={`relative block border rounded-lg p-3 cursor-pointer transition-all ${
                mode === "quick" ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center mb-1">
                <Search className="mr-1 h-4 w-4 text-blue-600" /> 
                <span className="font-medium text-blue-700">Quick</span>
              </div>
              <p className="text-xs text-gray-600">Menghasilkan jawaban instan dan cepat</p>
              <div className={`absolute top-2 right-2 h-3 w-3 rounded-full ${
                mode === "quick" ? 'bg-blue-500' : 'bg-gray-200'
              }`}></div>
            </div>
            
            <div
              onClick={() => setMode("detail")}
              className={`relative block border rounded-lg p-3 cursor-pointer transition-all ${
                mode === "detail" ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center mb-1">
                <Lightbulb className="mr-1 h-4 w-4 text-blue-600" /> 
                <span className="font-medium text-blue-700">Detail</span>
              </div>
              <p className="text-xs text-gray-600">Mode detail sedang dalam perbaikan, harap coba lagi nanti.</p>
              <div className={`absolute top-2 right-2 h-3 w-3 rounded-full ${
                mode === "detail" ? 'bg-blue-500' : 'bg-gray-200'
              }`}></div>
            </div>
          </div>
        </div>

        {/* Rate Limit Information Alert */}
        {hasSearched && rateLimit.limit !== null && (
          <div className="mt-4">
            {rateLimit.isLimitExceeded ? (
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="ml-2">
                  Limit pencarian harian Anda telah habis. Silakan coba lagi besok.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="bg-blue-50 border border-blue-100 rounded-md px-3 py-2 text-sm text-blue-700">
                <p className="flex items-center gap-1">
                  <span>Limit pencarian harian:</span>
                  <span className="font-medium">{rateLimit.remaining} / {rateLimit.limit}</span>
                  <span>tersisa</span>
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-6">
          <Button
            type="submit"
            className="w-full flex items-center justify-center gap-2"
            disabled={isSubmitting || rateLimit.isLimitExceeded}
          >
            <Search className="h-4 w-4" />
            {isSubmitting ? "Searching..." : "Search"}
          </Button>
        </div>
      </form>
    </div>
  );
}
