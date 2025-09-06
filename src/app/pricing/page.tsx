import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, Star, Zap, Users, Shield, HeadphonesIcon } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Pilih Paket yang Tepat untuk Anda
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Mulai dari gratis hingga premium dengan fitur lengkap untuk kebutuhan penelitian Anda
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">

            {/* Free Plan */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Gratis</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">Rp 0</div>
                <p className="text-gray-600">Cocok untuk mencoba</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>10 pencarian</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>Akses jurnal dasar</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>Dukungan email</span>
                </li>
              </ul>

              <Link href="/sign-up" className="block">
                <Button className="w-full" variant="outline">
                  Mulai Gratis
                </Button>
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                  <Star className="w-4 h-4 mr-1" />
                  POPULER
                </div>
              </div>

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Premium</h3>
                <div className="text-4xl font-bold mb-2">Rp 15.000</div>
                <p className="text-blue-100">per bulan</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0" />
                  <span>Pencarian tanpa batas</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0" />
                  <span>Dukungan prioritas</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0" />
                  <span>Dukungan komunitas</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0" />
                  <span>Akses jurnal premium</span>
                </li>
              </ul>

              <Link href="/sign-up" className="block">
                <Button className="w-full bg-white text-blue-600 hover:bg-gray-50">
                  Jadi Premium
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Perbandingan Fitur Lengkap
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Lihat perbedaan antara paket gratis dan premium secara detail
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full max-w-4xl mx-auto border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold">Fitur</th>
                  <th className="text-center py-4 px-6 font-semibold">Gratis</th>
                  <th className="text-center py-4 px-6 font-semibold">Premium</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-6 font-medium">Jumlah Pencarian</td>
                  <td className="text-center py-4 px-6">10</td>
                  <td className="text-center py-4 px-6 font-semibold text-blue-600">Tak Terbatas</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-6 font-medium">Dukungan</td>
                  <td className="text-center py-4 px-6">Email</td>
                  <td className="text-center py-4 px-6 font-semibold text-blue-600">Prioritas 24/7</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-6 font-medium">Akses Jurnal</td>
                  <td className="text-center py-4 px-6">Dasar</td>
                  <td className="text-center py-4 px-6 font-semibold text-blue-600">Premium + Dasar</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Siap Tingkatkan Produktivitas Penelitian Anda?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan mahasiswa dan peneliti yang telah menggunakan JurnalGPT
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50">
                Mulai Sekarang - Gratis
              </Button>
            </Link>
            <Link href="/features">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Lihat Semua Fitur
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
