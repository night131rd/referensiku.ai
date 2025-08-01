"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

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
  defaultMode = "quick",
}: SearchFormProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);
  const [startYear, setStartYear] = useState(defaultStartYear);
  const [endYear, setEndYear] = useState(defaultEndYear);
  const mode = "quick"; // Fixed to quick mode
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
    searchParams.set("mode", mode);

    // Navigate to the search page with the parameters
    router.push(`/search?${searchParams.toString()}`);

    // Reset submission state after a short delay to show loading state
    setTimeout(() => setIsSubmitting(false), 300);
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
        <div className="mt-6">
          <Button
            type="submit"
            className="w-full flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            <Search className="h-4 w-4" />
            {isSubmitting ? "Searching..." : "Search"}
          </Button>
        </div>
      </form>
    </div>
  );
}
