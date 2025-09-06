import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Search,
  HelpCircle,
  MessageCircle,
  BookOpen,
  ChevronRight,
  Mail,
  Phone,
  Clock
} from "lucide-react";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Pusat Bantuan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Temukan jawaban untuk pertanyaan umum dan panduan penggunaan JurnalGPT
          </p>
        </div>
      </section>

      {/* Quick Help */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">

            {/* Getting Started */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Memulai</h3>
              <p className="text-gray-600 mb-4">Pelajari cara menggunakan JurnalGPT untuk pertama kali</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Cara mendaftar akun</li>
                <li>• Melakukan pencarian pertama</li>
                <li>• Memahami hasil pencarian</li>
              </ul>
            </div>

            {/* Search Help */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Pencarian</h3>
              <p className="text-gray-600 mb-4">Tips dan trik untuk pencarian jurnal yang efektif</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Teknik pencarian advanced</li>
                <li>• Filter dan kategori</li>
              </ul>
            </div>

            {/* Account Help */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Akun & Billing</h3>
              <p className="text-gray-600 mb-4">Kelola akun dan informasi pembayaran Anda</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Upgrade ke premium</li>
                <li>• Mengelola langganan</li>
                <li>• Masalah pembayaran</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Pertanyaan Umum
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Jawaban untuk pertanyaan yang sering ditanyakan pengguna
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Bagaimana cara melakukan pencarian jurnal?
              </h3>
              <p className="text-gray-600">
                Masuk ke halaman pencarian, ketik kata kunci atau topik penelitian Anda,
                lalu klik tombol "Cari". AI akan mencari jurnal relevan dari database kami.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Berapa banyak pencarian yang bisa saya lakukan?
              </h3>
              <p className="text-gray-600">
                Pengguna gratis mendapat 10 pencarian. Pengguna premium mendapat
                pencarian tanpa batas dengan dukungan prioritas.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Bagaimana cara mendapatkan kutipan yang benar?
              </h3>
              <p className="text-gray-600">
                AI kami secara otomatis generate kutipan dalam format APA. Anda juga bisa menyesuaikan format kutipan sesuai kebutuhan.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Apakah data saya aman?
              </h3>
              <p className="text-gray-600">
                Ya, kami menggunakan enkripsi end-to-end dan tidak menyimpan data pencarian
                pribadi Anda. Privasi dan keamanan data adalah prioritas utama kami.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Masih Butuh Bantuan?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Tim dukungan kami siap membantu Anda dengan pertanyaan apa pun tentang JurnalGPT
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <Mail className="w-8 h-8 text-white mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Email</h3>
              <p className="text-blue-100 text-sm">chatgpt.student@gmail.com</p>
              <p className="text-blue-200 text-xs mt-1">Response dalam 24 jam</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <MessageCircle className="w-8 h-8 text-white mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Live Chat</h3>
              <p className="text-blue-100 text-sm">Tersedia 24/7</p>
              <p className="text-blue-200 text-xs mt-1">Untuk pengguna premium</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <Clock className="w-8 h-8 text-white mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Jam Operasional</h3>
              <p className="text-blue-100 text-sm">Senin - Minggu</p>
              <p className="text-blue-200 text-xs mt-1">24 jam dukungan</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50">
                <MessageCircle className="w-5 h-5 mr-2" />
                Hubungi Kami
              </Button>
            </Link>
            <Link href="/search">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                <Search className="w-5 h-5 mr-2" />
                Coba Pencarian
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
