import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import Link from "next/link";

export default function Screenshots() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Lihat JurnalGPT Dalam Aksi
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Temukan bagaimana mahasiswa seperti Anda menggunakan JurnalGPT untuk
            menemukan jurnal ilmiah dengan cepat dan mudah
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/search">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Coba Sekarang
              </Button>
            </Link>
            <Link href="/features">
              <Button size="lg" variant="outline">
                Pelajari Fitur
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Screenshot Display */}
        <div className="max-w-6xl mx-auto mb-16">
          <Card className="overflow-hidden shadow-2xl border-0">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="text-sm font-medium">JurnalGPT - Pencarian Jurnal Akademik</div>
                  <div className="w-16"></div>
                </div>
              </div>

              {/* Placeholder untuk Screenshot */}
              <div className="bg-gray-100 h-96 md:h-[500px] lg:h-[600px] flex items-center justify-center relative overflow-hidden">
                <div className="text-center p-8">
                  <Monitor className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-gray-600 mb-2">
                    Space untuk Screenshot
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Masukkan screenshot penggunaan website JurnalGPT di sini.
                    Area ini dirancang untuk menampilkan interface yang user-friendly.
                  </p>
                  <div className="bg-white rounded-lg p-6 shadow-lg max-w-lg mx-auto">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    </div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-4 right-4 text-gray-300">
                  <Smartphone className="w-8 h-8" />
                </div>
                <div className="absolute bottom-4 left-4 text-gray-300">
                  <Tablet className="w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Monitor className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Interface Modern
            </h3>
            <p className="text-gray-600">
              Desain yang clean dan intuitif untuk pengalaman pencarian yang optimal
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Responsive Design
            </h3>
            <p className="text-gray-600">
              Bekerja sempurna di desktop, tablet, dan smartphone
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tablet className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              User-Friendly
            </h3>
            <p className="text-gray-600">
              Mudah digunakan bahkan untuk pemula sekalipun
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Siap Mencoba JurnalGPT?
          </h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan mahasiswa yang telah menggunakan JurnalGPT
            untuk mempercepat penelitian mereka
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-3">
              Daftar Sekarang - Gratis!
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
