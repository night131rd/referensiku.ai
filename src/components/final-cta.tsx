import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Main Headline */}
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Siap Merubah cara Anda Mencari Jurnal?
          </h2>

          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan mahasiswa yang telah menghemat waktu dan meningkatkan produktivitas dengan JurnalGPT
          </p>

          {/* Benefits List */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="flex items-center justify-center text-blue-100">
              <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
              <span>Gratis 10 pencarian</span>
            </div>
            <div className="flex items-center justify-center text-blue-100">
              <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
              <span>Tidak perlu kartu kredit</span>
            </div>
            <div className="flex items-center justify-center text-blue-100">
              <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
              <span>Batalkan kapan saja</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/search">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Mulai Pencarian Gratis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300">
                Buat Akun Premium
              </Button>
            </Link>
          </div>

          {/* Trust Message */}
          <p className="text-blue-200 text-sm">
            ✅ Lebih dari 1.000 mahasiswa telah mempercayai JurnalGPT
          </p>
        </div>
      </div>
    </section>
  );
}
