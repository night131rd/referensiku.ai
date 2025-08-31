import SearchResults from "@/components/search-results";
import SearchForm from "@/components/search-form";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "../../../supabase/server";
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
          {/* Search form ditampilkan untuk semua kondisi */}
          <div className={`${hasSearchParams ? 'mb-6' : ''}`}>
            <h1 className="text-3xl font-bold mb-3 text-center text-gray-800">Ada yang aku bisa bantu cari?</h1>
            <p className="text-center text-gray-600 mb-6">
              Jawaban, Kutipan, dan Daftar Pustaka semua dalam satu tempat.
            </p>
            <SearchForm 
              defaultQuery={query || ""} 
              defaultStartYear={startYear || "2019"}
              defaultEndYear={endYear || "2025"}
              defaultMode={mode || "quick"}
            />
          </div>

          {hasSearchParams && (
            <div>

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
