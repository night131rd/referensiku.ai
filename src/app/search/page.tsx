import SearchResults from "@/components/search-results";
import SearchForm from "@/components/search-form";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Suspense } from "react";
import { Loader2, Search } from "lucide-react";
import { createClient } from "../../../supabase/server";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ScrollToResults } from "@/components/scroll-to-results";

// Lazy load heavy components
const EnhancedLoading = dynamic(() => import("@/components/enhanced-loading").then(mod => ({ default: mod.EnhancedLoading })), {
  loading: () => <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
});

export default async function SearchPage({
  searchParams,
}: {
  searchParams: {
    query?: string;
    startYear?: string;
    endYear?: string;
  };
}) {
  const { query, startYear, endYear } = searchParams;
  const hasSearchParams = !!query;

  // Get user information including role
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRole = 'guest';
  let isAuthenticated = false;

  if (user) {
    isAuthenticated = true;
    // Get user role from profiles table
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    userRole = profileData?.role || 'free';
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navbar />
      <ScrollToResults />
      <main className="flex-grow">
        {/* Compact Hero Section */}
        <section className="relative py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              {/* Compact Badge */}
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                AI Pencari Jurnal
              </div>

              {/* Compact Headline */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight mb-4 sm:mb-6 md:mb-7">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Jawaban, Kutipan, dan Daftar Pustaka, semua dalam satu tempat.
                </span>
              </h1>

              {/* Mascot Section */}
              <div className="flex justify-center items-start mb-6 sm:mb-8 relative">
                {/* Mascot Image */}
                <div className="relative mr-4 sm:mr-6">
                  <img
                    src="/dog_thinking.png"
                    alt="Dog mascot thinking"
                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-contain"
                    loading="lazy"
                  />
                  {/* Subtle glow effect */}
                  <div className="absolute inset-0 bg-blue-200 rounded-full opacity-20"></div>
                </div>

                {/* Speech Bubble */}
                <div className="relative -mt-2 sm:-mt-3">
                  <div className="bg-white border-2 border-blue-300 rounded-2xl px-4 py-3 shadow-lg max-w-xs sm:max-w-sm relative">
                    {/* Small tail pointing left to mascot */}
                    <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-blue-300"></div>
                    <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-3 border-b-3 border-r-3 border-transparent border-r-white"></div>
                    <p className="text-gray-800 text-sm sm:text-base font-medium text-center">
                      {userRole === 'premium' 
                        ? 'Premium user! Apa yang bisa aku bantu hari ini?' 
                        : userRole === 'free' 
                        ? 'Halo! Mari kita cari jurnal yang bagus!' 
                        : 'Ada yang aku bisa bantu cari?'}
                    </p>
                  </div>
                  {/* Enhanced shadow for depth */}
                  <div className="absolute inset-0 bg-blue-100 rounded-2xl transform translate-x-1 translate-y-1 -z-10 opacity-30"></div>
                </div>
              </div>

              {/* Compact Search Form */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 md:p-8 max-w-2xl mx-auto">
                <SearchForm
                  defaultQuery={query || ""}
                  defaultStartYear={startYear || "2019"}
                  defaultEndYear={endYear || "2025"}
                  defaultMode="quick"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Results Section */}
        <section id="results" className="py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {hasSearchParams && (
                <Suspense
                  fallback={
                    <div className="mt-4">
                      <EnhancedLoading />
                    </div>
                  }
                >
                  <SearchResults
                    query={query || ""}
                    startYear={startYear || "2000"}
                    endYear={endYear || "2023"}
                    mode="quick"
                  />
                </Suspense>
              )}

              {!hasSearchParams && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Mulai Pencarian Jurnal Anda
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Masukkan topik penelitian di form di atas
                  </p>
                </div>
              )}

              {!isAuthenticated && hasSearchParams && (
                <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-6 text-center">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    Upgrade untuk Pencarian Unlimited
                  </h4>
                  <p className="text-blue-700 text-sm mb-3">
                    Dapatkan akses penuh ke semua fitur premium
                  </p>
                  <Link
                    href="/sign-up"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Daftar Premium
                  </Link>
                </div>
              )}

              {isAuthenticated && userRole === 'free' && hasSearchParams && (
                <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-lg p-6 text-center">
                  <h4 className="font-semibold text-amber-800 mb-2">
                    Upgrade ke Premium
                  </h4>
                  <p className="text-amber-700 text-sm mb-3">
                    Dapatkan kuota pencarian yang lebih banyak dan fitur premium lainnya
                  </p>
                  <Link
                    href="/payment"
                    className="inline-flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Upgrade Premium
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
