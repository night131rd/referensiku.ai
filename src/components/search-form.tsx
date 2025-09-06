"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Lightbulb } from "lucide-react";
import SearchQuotaDisplay from "@/components/search-quota-display";
import { useSearchQuota } from "@/hooks/useSearchQuota";

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
  const [mode, setMode] = useState(defaultMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentYear = new Date().getFullYear();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSubmitting(true);

    // Build the search URL with query parameters
    const searchParams = new URLSearchParams();
    searchParams.set("query", query);
    if (startYear) searchParams.set("startYear", startYear);
    if (endYear) searchParams.set("endYear", endYear);
    if (mode) searchParams.set("mode", mode);

    // Navigate to the search page with the parameters and scroll to results
    router.push(`/search?${searchParams.toString()}#results`);

    // Reset submission state after a short delay to show loading state
    setTimeout(() => setIsSubmitting(false), 300);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 p-4 sm:p-6 md:p-8 lg:p-10 space-y-4 sm:space-y-6 md:space-y-8">
        {/* Topic input - pill shape with improved styling */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
          </div>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari jurnal, topik, atau kata kunci..."
            className="pl-12 sm:pl-16 pr-4 sm:pr-6 py-3 sm:py-4 md:py-5 text-base sm:text-lg md:text-xl border-2 border-gray-200 rounded-full focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 hover:border-gray-300 transition-all duration-300 bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-xl hover:shadow-blue-100/20"
            required
          />
        </div>

        {/* Year range picker - compact inline layout */}
        <div className="animate-in slide-in-from-bottom-2 duration-500 delay-200">
          <Label className="text-base font-semibold text-gray-700 mb-4 block">Pilih Rentang Tahun</Label>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-600">Dari:</span>
                <Input
                  type="number"
                  min="1900"
                  max={currentYear}
                  value={startYear}
                  onChange={(e) => setStartYear(e.target.value)}
                  placeholder="2020"
                  className="w-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white shadow-sm hover:shadow-md transition-all duration-200"
                />
              </div>

              <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full shadow-sm border border-gray-200">
                <span className="text-blue-600 font-bold">→</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-600">Sampai:</span>
                <Input
                  type="number"
                  min="1900"
                  max={currentYear}
                  value={endYear}
                  onChange={(e) => setEndYear(e.target.value)}
                  placeholder="2025"
                  className="w-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white shadow-sm hover:shadow-md transition-all duration-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mode selection with toggle cards and descriptions */}
        <div className="animate-in slide-in-from-bottom-2 duration-500 delay-300">
          <Label className="text-base font-semibold text-gray-700 mb-4 block">Mode Pencarian</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setMode("quick")}
              className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] text-left min-h-[88px] ${
                mode === "quick"
                  ? 'bg-blue-50 border-blue-500 shadow-md'
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">⚡</span>
                <div>
                  <h3 className={`font-semibold text-base ${mode === "quick" ? 'text-blue-700' : 'text-gray-800'}`}>
                    Quick
                  </h3>
                  <p className="text-xs text-gray-500">Menjawab berdasarkan abstrak jurnal</p>
                </div>
              </div>
              <p className={`text-sm leading-relaxed ${mode === "quick" ? 'text-blue-600' : 'text-gray-600'}`}>
                Pencarian cepat untuk gambaran umum topik dengan hasil yang ringkas dan mudah dipahami.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setMode("detail")}
              className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] text-left min-h-[88px] ${
                mode === "detail"
                  ? 'bg-purple-50 border-purple-500 shadow-md'
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">📚</span>
                <div>
                  <h3 className={`font-semibold text-base ${mode === "detail" ? 'text-purple-700' : 'text-gray-800'}`}>
                    Detail
                  </h3>
                  <p className="text-xs text-gray-500">Menjawab berdasarkan konten lengkap jurnal</p>
                </div>
              </div>
              <p className={`text-sm leading-relaxed ${mode === "detail" ? 'text-purple-600' : 'text-gray-600'}`}>
                Analisis mendalam dengan memahami isi jurnal secara lengkap untuk hasil yang komprehensif.
              </p>
            </button>
          </div>
        </div>

        {/* Full-width search button - enhanced CTA */}
        <Button
          type="submit"
          disabled={isSubmitting || !query.trim()}
          className="w-full py-4 sm:py-5 md:py-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 text-white font-bold text-lg sm:text-xl rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-blue-200/50 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none active:scale-95 animate-in slide-in-from-bottom-2 duration-500 delay-400 min-h-[48px] sm:min-h-[56px]"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-white mr-4"></div>
              <span>Mencari Jurnal...</span>
            </>
          ) : (
            <>
              <Search className="h-7 w-7 mr-4" />
              <span> Cari Jurnal</span>
            </>
          )}
        </Button>
      </div>

      {/* Quota display */}
      <div className="mt-8">
        <SearchQuotaDisplay />
      </div>
    </form>
  );
}
