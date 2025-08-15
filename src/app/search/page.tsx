import SearchResults from "@/components/search-results";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Suspense } from "react";
import { Loader2, Search, Lightbulb } from "lucide-react";
import { createClient } from "../../../supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: {
    query?: string;
    startYear?: string;
    endYear?: string;
    mode?: string;
  };
}) {
  const { query, startYear, endYear, mode } = searchParams;
  const hasSearchParams = !!query;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {!hasSearchParams && (
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
              <h1 className="text-3xl font-bold mb-3 text-center text-gray-800">Ada yang aku bisa bantu cari?</h1>
              <p className="text-center text-gray-600 mb-6">
                Jawaban, Kutipan, dan Daftar Pustaka semua dalam satu tempat.
              </p>
              <form method="get">
                <div className="mb-5">
                  <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-1">
                    Masukkan topik pencarian
                  </label>
                  <Input
                    type="text"
                    name="query"
                    id="query"
                    placeholder="Ask anything"
                    className="w-full"
                    defaultValue={query || ""}
                    required
                  />
                  <input type="hidden" name="mode" value={mode || "quick"} />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div>
                    <label htmlFor="startYear" className="block text-sm font-medium text-gray-700 mb-1">
                      Tahun Awal
                    </label>
                    <Input
                      type="number"
                      name="startYear"
                      id="startYear"
                      defaultValue={startYear || "2000"}
                      min="1900"
                      max="2025"
                    />
                  </div>
                  <div>
                    <label htmlFor="endYear" className="block text-sm font-medium text-gray-700 mb-1">
                      Tahun Akhir
                    </label>
                    <Input
                      type="number"
                      name="endYear"
                      id="endYear"
                      defaultValue={endYear || "2023"}
                      min="1900"
                      max="2025"
                    />
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mode Pencarian
                  </label>

                  <div className="grid grid-cols-2 gap-4">
                    <Link 
                      href={`?${new URLSearchParams({
                        query: query || "",
                        startYear: startYear || "2000",
                        endYear: endYear || "2023",
                        mode: "quick"
                      }).toString()}`}
                      className={`relative block border rounded-lg p-3 cursor-pointer transition-all no-underline ${mode !== "detail" ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center mb-1">
                        <Search className="mr-1 h-4 w-4 text-blue-600" /> 
                        <span className="font-medium text-blue-700">Quick</span>
                      </div>
                      <p className="text-xs text-gray-600">Menghasilkan jawaban instan dan cepat</p>
                      <div className={`absolute top-2 right-2 h-3 w-3 rounded-full ${mode !== "detail" ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                    </Link>
                    
                    <Link 
                      href={`?${new URLSearchParams({
                        query: query || "",
                        startYear: startYear || "2000",
                        endYear: endYear || "2023",
                        mode: "detail"
                      }).toString()}`}
                      className={`relative block border rounded-lg p-3 cursor-pointer transition-all no-underline ${mode === "detail" ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center mb-1">
                        <Lightbulb className="mr-1 h-4 w-4 text-blue-600" /> 
                        <span className="font-medium text-blue-700">Detail</span>
                      </div>
                      <p className="text-xs text-gray-600">Menghasilkan jawaban lengkap, terstruktur, dan detail</p>
                      <div className={`absolute top-2 right-2 h-3 w-3 rounded-full ${mode === "detail" ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                    </Link>
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </form>
            </div>
          )}

          {hasSearchParams && (
            <div className="mt-4">
              <div className="mb-6 flex items-center gap-2 bg-white rounded-lg p-2 border border-gray-200">
                <span className="border-0 flex-grow overflow-hidden overflow-ellipsis whitespace-nowrap text-gray-700 px-3">
                  {query}
                </span>
                <Link href={`/search`} className="h-8 px-3 flex items-center justify-center rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors">
                  <Search className="h-4 w-4" />
                </Link>
              </div>

              <h2 className="text-xl font-semibold mb-4">Hasil Pencarian</h2>

              <Suspense
                fallback={
                  <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <span className="ml-2 text-lg text-gray-600">
                      Loading results...
                    </span>
                  </div>
                }
              >
                <SearchResults
                  query={query || ""}
                  startYear={startYear || "2000"}
                  endYear={endYear || "2023"}
                  mode={mode || "quick"}
                />
              </Suspense>
            </div>
          )}

          {!user && (
            <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-6">
              <h3 className="font-semibold text-blue-800 mb-2">
                Create an account for more features
              </h3>
              <p className="text-blue-700 text-sm">
                Sign up to save your search history, create collections, and
                access advanced search filters.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
