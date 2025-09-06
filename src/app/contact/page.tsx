'use client'

import dynamic from 'next/dynamic'
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Mail,
  MessageCircle,
  Send,
  HelpCircle,
  Search,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useState } from "react";

// Simple navbar for contact page (no Supabase dependency)
const SimpleNavbar = () => (
  <nav className="w-full bg-white py-4 border-b border-gray-100">
    <div className="container mx-auto px-4 flex justify-between items-center">
      <div className="flex items-center">
        <Link href="/" className="text-xl font-bold flex items-center">
          <div className="mr-2">
            <img
              src="/favicon.png"
              alt="JurnalGPT"
              className="h-8 w-8"
              loading="lazy"
            />
          </div>
          JurnalGPT
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        <Link href="/search" className="text-gray-600 hover:text-blue-600">
          Pencarian
        </Link>
        <Link href="/pricing" className="text-gray-600 hover:text-blue-600">
          Harga
        </Link>
        <Link href="/contact" className="text-blue-600 font-medium">
          Kontak
        </Link>
      </div>
    </div>
  </nav>
)

// Dynamic import for footer
const Footer = dynamic(() => import('@/components/footer'), { ssr: false })

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitStatus('success')
        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          category: 'general'
        })
      } else {
        setSubmitStatus('error')
        console.error('Error:', data.error)
      }
    } catch (error) {
      setSubmitStatus('error')
      console.error('Error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleNavbar />

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Hubungi Kami
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Ada pertanyaan atau butuh bantuan? Tim kami siap membantu Anda
          </p>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto mb-12">

            {/* Email Contact */}
            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Email</h3>
              <p className="text-gray-600 mb-6">
                Kirim email untuk pertanyaan umum, dukungan teknis, atau feedback
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center">
                <p className="text-lg font-medium text-gray-900">chatgpt.student@gmail.com</p>
                <p className="text-sm text-gray-600 mt-1">Response dalam 24 jam</p>
              </div>
              <a
                href="mailto:chatgpt.student@gmail.com"
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <Mail className="w-4 h-4 mr-2" />
                Kirim Email
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Kirim Pesan
              </h2>
              <p className="text-gray-600">
                Isi formulir di bawah ini dan kami akan segera menghubungi Anda
              </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-8 shadow-lg">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap *
                  </label>
                  <Input
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Masukkan nama Anda"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <Input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@contoh.com"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori
                </label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Pertanyaan Umum</SelectItem>
                    <SelectItem value="technical">Dukungan Teknis</SelectItem>
                    <SelectItem value="billing">Billing & Pembayaran</SelectItem>
                    <SelectItem value="feedback">Saran & Masukan</SelectItem>
                    <SelectItem value="other">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subjek
                </label>
                <Input
                  name="subject"
                  type="text"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Subjek pesan"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pesan *
                </label>
                <Textarea
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Jelaskan pertanyaan atau masalah Anda..."
                  rows={5}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Mengirim...' : 'Kirim Pesan'}
                <Send className="w-4 h-4 ml-2" />
              </Button>

              {/* Status Messages */}
              {submitStatus === 'success' && (
                <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg mt-4">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-green-700">Pesan berhasil dikirim! Kami akan segera merespons.</span>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg mt-4">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-700">Gagal mengirim pesan. Silakan coba lagi.</span>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* FAQ Quick Links */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Mungkin Jawaban Anda Ada di Sini
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Sebelum menghubungi kami, cek dulu FAQ dan panduan bantuan kami
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/help">
              <Button size="lg" variant="outline" className="border-2 border-gray-300 hover:border-blue-500">
                <HelpCircle className="w-5 h-5 mr-2" />
                Lihat FAQ
              </Button>
            </Link>
            <Link href="/search">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
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
