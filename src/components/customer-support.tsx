'use client'

import React, { useState } from 'react';

// Customer Support Component
// Komponen dukungan pelanggan responsif untuk melaporkan masalah, umpan balik, dan saran
// Fitur: Layout dua kolom desktop, validasi sisi klien, aksesibilitas, mock submit handler

interface FormData {
  name: string;
  email: string;
  category: string;
  message: string;
  agree: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  category?: string;
  message?: string;
  agree?: string;
}

const CustomerSupport: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    category: '',
    message: '',
    agree: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama wajib diisi';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Silakan masukkan alamat email yang valid';
    }

    if (!formData.category) {
      newErrors.category = 'Silakan pilih kategori';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Pesan wajib diisi';
    }

    if (!formData.agree) {
      newErrors.agree = 'Anda harus menyetujui syarat dan ketentuan';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Mock submit handler - replace with real API call
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Kirim data ke API
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        // Reset form setelah sukses
        setTimeout(() => {
          setFormData({
            name: '',
            email: '',
            category: '',
            message: '',
            agree: false,
          });
          setSubmitSuccess(false);
        }, 3000);
      } else {
        // Handle error response
        const errorData = await response.json();
        alert(errorData.error || 'Terjadi kesalahan saat mengirim pesan');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Terjadi kesalahan saat mengirim pesan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-200 rounded-full opacity-20 -translate-x-32 -translate-y-32"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-200 rounded-full opacity-20 translate-x-32 translate-y-32"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Dukungan Pelanggan</h1>
          <p className="text-xl text-gray-600">Kami di sini untuk membantu! Laporkan masalah, bagikan umpan balik, atau sarankan perbaikan.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Headline and CTA */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Hubungi Kami</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Umpan balik Anda sangat berharga bagi kami. Baik Anda mengalami masalah, memiliki saran,
                atau ingin berbagi pemikiran, kami mendengarkan. Tim kami akan meninjau setiap pesan yang masuk.
              </p>
            </div>

            {/* CTA Card */}
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Jaminan Respons Cepat</h3>
              <p className="text-gray-600 mb-4">
                Kami bertujuan untuk menjawab semua pertanyaan dalam waktu 24 jam. Harap sertakan "MENDESAK" di subjek pesan Anda untuk masalah yang memerlukan perhatian segera.
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Respons dalam 24 jam
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Masukkan nama lengkap Anda"
                  aria-describedby={errors.name ? 'name-error' : undefined}
                  aria-invalid={!!errors.name}
                />
                {errors.name && (
                  <p id="name-error" className="mt-1 text-sm text-red-600" role="alert">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="email.anda@contoh.com"
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Category Select */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                  aria-describedby={errors.category ? 'category-error' : undefined}
                  aria-invalid={!!errors.category}
                >
                  <option value="">Pilih kategori</option>
                  <option value="bug">Laporan Bug</option>
                  <option value="feature">Permintaan Fitur</option>
                  <option value="feedback">Umpan Balik Umum</option>
                  <option value="support">Dukungan Teknis</option>
                  <option value="other">Lainnya</option>
                </select>
                {errors.category && (
                  <p id="category-error" className="mt-1 text-sm text-red-600" role="alert">
                    {errors.category}
                  </p>
                )}
              </div>

              {/* Message Textarea */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Pesan *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical ${
                    errors.message ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Silakan jelaskan masalah, umpan balik, atau saran Anda secara detail..."
                  aria-describedby={errors.message ? 'message-error' : undefined}
                  aria-invalid={!!errors.message}
                />
                {errors.message && (
                  <p id="message-error" className="mt-1 text-sm text-red-600" role="alert">
                    {errors.message}
                  </p>
                )}
              </div>

              {/* Agreement Checkbox */}
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="agree"
                  name="agree"
                  checked={formData.agree}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  aria-describedby={errors.agree ? 'agree-error' : undefined}
                  aria-invalid={!!errors.agree}
                />
                <label htmlFor="agree" className="ml-3 text-sm text-gray-700">
                  Saya setuju dengan{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-500 underline">
                    Syarat Layanan
                  </a>{' '}
                  dan{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-500 underline">
                    Kebijakan Privasi
                  </a>
                  *
                </label>
              </div>
              {errors.agree && (
                <p id="agree-error" className="mt-1 text-sm text-red-600" role="alert">
                  {errors.agree}
                </p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Mengirim...' : 'Kirim Pesan'}
              </button>
            </form>

            {/* Success Message */}
            {submitSuccess && (
              <div
                className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg"
                role="alert"
                aria-live="polite"
              >
                <div className="flex">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-green-800">
                    Terima kasih atas pesan Anda! Kami akan menghubungi Anda dalam waktu 24 jam.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Thumbnail/Gallery Row Placeholder */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Update & Fitur Terbaru</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Placeholder cards */}
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="w-full h-32 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Placeholder Gambar {item}</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Judul Fitur {item}</h4>
                <p className="text-gray-600 text-sm">
                  Deskripsi singkat tentang fitur atau update. Ini adalah placeholder untuk konten sebenarnya.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSupport;
