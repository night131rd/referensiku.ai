import SearchForm from "@/components/search-form";
import SearchResults from "@/components/search-results";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Suspense } from "react";

export default function SearchPage({
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Academic Journal Search</h1>
            <p className="text-gray-600">
              Search millions of academic papers and get AI-powered answers with
              proper citations
            </p>
          </div>

          <SearchForm
            defaultQuery={query || ""}
            defaultStartYear={startYear || ""}
            defaultEndYear={endYear || ""}
            defaultMode={mode || "quick"}
          />

          {hasSearchParams && (
            <Suspense
              fallback={
                <div className="mt-8 text-center">Loading results...</div>
              }
            >
              <SearchResults
                query={query || ""}
                startYear={startYear || ""}
                endYear={endYear || ""}
                mode={mode || "quick"}
              />
            </Suspense>
          )}

          {!hasSearchParams && (
            <div className="mt-16 bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
              <h2 className="text-xl font-semibold mb-4">
                Start Your Academic Research
              </h2>
              <p className="text-gray-600 mb-4">
                Enter a research topic above to search through millions of
                academic papers
              </p>
              <div className="flex justify-center gap-8 mt-8">
                <div className="text-center">
                  <div className="text-blue-600 font-bold text-2xl mb-2">
                    50M+
                  </div>
                  <div className="text-sm text-gray-500">Academic Papers</div>
                </div>
                <div className="text-center">
                  <div className="text-blue-600 font-bold text-2xl mb-2">
                    10K+
                  </div>
                  <div className="text-sm text-gray-500">Academic Journals</div>
                </div>
                <div className="text-center">
                  <div className="text-blue-600 font-bold text-2xl mb-2">
                    99.9%
                  </div>
                  <div className="text-sm text-gray-500">Citation Accuracy</div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-6">
            <h3 className="font-semibold text-blue-800 mb-2">
              Create an account for more features
            </h3>
            <p className="text-blue-700 text-sm">
              Sign up to save your search history, create collections, and
              access advanced search filters.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
