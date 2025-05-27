import Footer from "@/components/footer";
import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import {
  ArrowUpRight,
  BookOpen,
  FileText,
  Search,
  BookMarked,
  GraduationCap,
  Clock,
} from "lucide-react";
import { createClient } from "../../supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <Hero />

      {/* Features Section */}
      <section className="py-24 bg-white" id="features">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Powerful Academic Search Tools
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform combines AI-powered search with comprehensive
              academic databases to deliver accurate, properly cited research
              results.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Search className="w-6 h-6" />,
                title: "Intelligent Search",
                description:
                  "Find relevant academic papers with our advanced search algorithms",
              },
              {
                icon: <BookMarked className="w-6 h-6" />,
                title: "Proper Citations",
                description:
                  "All results include APA 7 citations ready to use in your research",
              },
              {
                icon: <FileText className="w-6 h-6" />,
                title: "Full-Text Access",
                description: "Download PDF versions of papers when available",
              },
              {
                icon: <GraduationCap className="w-6 h-6" />,
                title: "Academic Rigor",
                description:
                  "Results from peer-reviewed journals and trusted academic sources",
              },
              {
                icon: <Clock className="w-6 h-6" />,
                title: "Time-Saving",
                description:
                  "Get comprehensive answers in seconds instead of hours of research",
              },
              {
                icon: <BookOpen className="w-6 h-6" />,
                title: "Extensive Database",
                description:
                  "Access millions of academic papers across all disciplines",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our dual-backend system combines the best of AI and academic
              databases
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="text-2xl font-bold text-blue-600 mb-4">
                Quick Response
              </div>
              <p className="text-gray-600 mb-4">
                Powered by Vertex AI RAG and OpenAlex API for immediate answers
                to your academic queries.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Instant search results</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Key information extraction</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Properly formatted citations</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="text-2xl font-bold text-indigo-600 mb-4">
                Comprehensive Results
              </div>
              <p className="text-gray-600 mb-4">
                Crow Futurehouse API delivers in-depth analysis and thorough
                literature reviews.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  <span>Deep academic insights</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  <span>Comprehensive literature analysis</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  <span>Advanced filtering by year and relevance</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">50M+</div>
              <div className="text-blue-100">Academic Papers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-blue-100">Academic Journals</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-blue-100">Citation Accuracy</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Start Your Academic Research
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of researchers, students, and professors who use our
            platform for reliable academic insights.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Begin Searching Now
            <Search className="ml-2 w-4 h-4" />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
