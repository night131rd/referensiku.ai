'use client'

import Link from "next/link";
import { Twitter, Linkedin, Github, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setEmail('');
      } else {
        setSubmitStatus('error');
        console.error('Error:', data.error);
      }
    } catch (error) {
      setSubmitStatus('error');
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

          {/* Company Info */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <img
                src="/dog.png"
                alt="JurnalGPT Logo"
                className="h-8 w-auto mr-3 brightness-0 invert"
                loading="lazy"
              />
              <span className="text-xl font-bold">JurnalGPT</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
              Saya mahasiswa semester 5 yang memiliki minat besar terhadap teknologi, terutama AI.
              Saya percaya bahwa AI dapat membantu kehidupan sehari-hari, sehingga saya membuat website ini
              untuk membantu sesama mahasiswa dalam penelitiannya dan menemukan jurnal ilmiah lebih mudah.
              Sebagian besar uang dari pembayaran premium digunakan untuk menjaga website tetap berjalan
              seperti membayar server, layanan AI, dan untuk riset agar layanan ini dapat menjadi lebih baik.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Produk</h3>
            <ul className="space-y-2">
              <li><Link href="/search" className="text-gray-400 hover:text-white transition-colors">Pencarian Jurnal</Link></li>
              <li><Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">Harga</Link></li>
              <li><Link href="/features" className="text-gray-400 hover:text-white transition-colors">Fitur</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Dukungan</h3>
            <ul className="space-y-2">
              <li><Link href="/help" className="text-gray-400 hover:text-white transition-colors">Bantuan</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Kontak</Link></li>
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-800 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-center text-gray-400">
              <Mail className="w-5 h-5 mr-3" />
              <span>chatgpt.student@gmail.com</span>
            </div>
            <div className="flex items-center text-gray-400">
              <MapPin className="w-5 h-5 mr-3" />
              <span>Jakarta, Indonesia</span>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h4 className="text-lg font-semibold mb-2">Tetap Update</h4>
            <p className="text-gray-400 mb-4">Dapatkan tips penelitian dan update fitur terbaru</p>

            {submitStatus === 'success' && (
              <div className="bg-green-600 text-white px-4 py-2 rounded-md mb-4 text-sm">
                ✅ Berhasil berlangganan newsletter!
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="bg-red-600 text-white px-4 py-2 rounded-md mb-4 text-sm">
                ❌ Gagal berlangganan. Silakan coba lagi.
              </div>
            )}

            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email Anda"
                required
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-md font-medium transition-colors"
              >
                {isSubmitting ? 'Mengirim...' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            © {currentYear} JurnalGPT. All rights reserved.
          </div>
          <div className="flex space-x-6 text-sm text-gray-400">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
