import SearchForm from "@/components/search-form";
import SearchResults from "@/components/search-results";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "../../../supabase/server";

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
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2"> Pencarian </h1>
            <p className="text-gray-600">
              Dapatkan jawaban, kutipan, dan daftar pustaka dari jutaan jurnal akademik dengan bantuan AI
            </p>
          </div>

          <SearchForm
            defaultQuery={query || ""}
            defaultStartYear={startYear || "2000"}
            defaultEndYear={endYear || "2023"}
            defaultMode={mode || "comprehensive"}
          />

          {hasSearchParams && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Search Results</h2>

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
                  mode={mode || "comprehensive"}
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
